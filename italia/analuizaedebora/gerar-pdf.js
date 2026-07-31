const puppeteer = require('/Users/fabianarosant/roteiros/infoprodutos/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { execSync } = require('child_process');

const [,, inputFile, outputFile] = process.argv;

if (!inputFile || !outputFile) {
  console.error('Uso: node gerar-pdf.js <arquivo.html> <saida.pdf>');
  process.exit(1);
}

const htmlPath = path.resolve(inputFile);
const baseDir = path.dirname(htmlPath);
const fileName = path.basename(htmlPath);

// Servidor HTTP local para servir o HTML e assets corretamente
function startServer(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(dir, url.parse(req.url).pathname);
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        const ext = path.extname(filePath).toLowerCase();
        const mime = {
          '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
          '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
          '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2',
          '.otf': 'font/otf', '.ttf': 'font/ttf',
        }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  const server = await startServer(baseDir);
  const port = server.address().port;
  const pageUrl = `http://127.0.0.1:${port}/${fileName}`;
  console.log('Servindo em:', pageUrl);

  // headless:'shell' = modo legado necessário — Chrome 123+ tem bug com printToPDF no modo novo (headless:true)
  // Sem --disable-gpu e --use-gl=swiftshader: o pipeline normal do Chrome renderiza border-radius+overflow:hidden
  // corretamente. SwiftShader (software rendering) causa imagens pretas nesses elementos no Chrome 147+.
  const browser = await puppeteer.launch({
    headless: 'shell',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await page.emulateMediaType('print');
  await page.goto(pageUrl, { waitUntil: 'load', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');

  // Força carregamento de imagens com loading="lazy" — Puppeteer não as carrega fora do viewport
  await page.evaluate(() => {
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    lazyImgs.forEach(img => {
      img.removeAttribute('loading');
      const src = img.getAttribute('src');
      if (src) { img.setAttribute('src', ''); img.setAttribute('src', src); }
    });
  });
  await page.waitForNetworkIdle({ timeout: 15000 }).catch(() => {});

  // Elimina TODAS as fontes de transparência antes de gerar o PDF.
  // Preview e iOS (CoreGraphics) têm bugs com transparency groups; Chrome (PDFium) suporta tudo.
  // Solução: zero transparência no PDF → Ghostscript não rasteiriza nada → qualidade vetorial total.
  await page.addStyleTag({
    content: `
      html, body { background-color: white !important; }

      /* Remove efeitos que criam transparency groups */
      * {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        filter: none !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }

      /* Remove elementos de UI e pseudo-elementos com opacity */
      .topbar, .nav-drawer, .nav-overlay, .hamburger-btn { display: none !important; }
      .dhn-wrapper::after { display: none !important; }

      /* v2: seções com imagem de fundo inline (sem classes) — remover todos os z-index internos
         para eliminar stacking contexts → Form XObjects → transparency groups no Preview/iOS.
         As imagens de fundo em si são tratadas no JS evaluate abaixo. */
      #capa *, #boas-vindas *, #menu-pratico * { z-index: auto !important; }

      /* capa, menu-pratico e boas-vindas têm margin:0 auto 4mm inline que não é coberto
         pelo @media print (que só alcança .pagina). Sem este fix, as margens acumulam
         e deslocam os destinos das páginas seguintes no PDF. */
      #capa, #menu-pratico, #boas-vindas {
        margin: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
      }

      /* Card no header azul dos dias: branco opaco (v1 compat) */
      .dhn-card {
        background: white !important;
        border-color: #dbeafe !important;
      }

      /* Ana Luiza & Débora / Itália: este roteiro usa .vg-card como card BRANCO com texto
         escuro (#475569) — o override "v1 compat" acima (azul sólido) deixava o texto
         ilegível. Removido para este cliente; NÃO remover do script compartilhado. */

      /* #cidade (Sobre a Itália) usa .pais-hero: foto de fundo + .pais-hero-overlay
         (gradiente rgba empilhado por cima). Mesmo bug de transparência do Ghostscript
         já documentado para #pais-hero-bg — a foto sumia (ficava branca) no PDF final.
         A foto em si já é convertida para background-image pelo loop genérico de imagens
         abaixo (img com position:absolute + inset:0); só falta suprimir o overlay. */
      .pais-hero-overlay { display: none !important; }
      .pais-hero { border-radius: 0 !important; }

      /* Legenda glass: branco sólido (v1 compat) — mas os heros de cidade deste roteiro
         (#roma, #napoles, #sorrento, #capri, #milao, #como, #lugano) usam gradiente azul
         inline em vez da classe .cidade-clean, e o .legenda-glass ali é "glass" escuro com
         texto branco. Forçar branco apagava o texto branco por cima. Restaura o glass escuro
         só nesses heros (seletor mais específico vence o !important genérico acima). */
      .legenda-glass {
        background: white !important;
        border: 1px solid #e5edf7 !important;
      }
      #roma .legenda-glass, #napoles .legenda-glass, #sorrento .legenda-glass,
      #capri .legenda-glass, #milao .legenda-glass, #como .legenda-glass, #lugano .legenda-glass {
        background: #16324f !important;
        border-color: rgba(255,255,255,0.25) !important;
        color: white !important;
      }

      /* Cards individuais de prato dentro do Gastronomia (fundo rgba(255,255,255,0.06) sobre
         o navy do .legenda-glass): o loop genérico de conversão rgba->opaco faz blend com
         BRANCO (assume fundo de papel), então um branco a 6% vira quase-branco sólido — e o
         nome/descrição do prato (texto branco) fica branco sobre branco, invisível. O blend
         correto é sobre o navy #16324f do container, não sobre branco. */
      div[style*="background:rgba(255,255,255,0.06)"] {
        background: #2a4a6f !important;
      }
    `
  });

  await new Promise(r => setTimeout(r, 3000));

  // Elimina transparency groups na origem via JS:
  // 1. Converte imgs absolutas de fundo (inset:0) para background-image CSS ou esconde
  // 2. Esconde overlay divs de cobertura total com rgba
  // 3. Converte rgba (backgrounds, borders) para cores opacas blendadas com branco
  // 4. Zera opacity < 1 em todos os elementos
  await page.evaluate(async () => {
    const blendWhite = (r, g, b, a) =>
      `rgb(${Math.round(r*a+255*(1-a))},${Math.round(g*a+255*(1-a))},${Math.round(b*a+255*(1-a))})`;

    const toOpaque = (color) => {
      const m = color && color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (!m) return null;
      const a = parseFloat(m[4]);
      if (a === 0) return null;
      return blendWhite(+m[1], +m[2], +m[3], a);
    };

    // Composita imagem + overlay numa canvas flat (sem transparência) para capa e boas-vindas.
    // Isso elimina o Form XObject de transparência sem perder o escurecimento visual.
    async function compositeSection(sectionId, drawOverlay, bgColor = null) {
      const section = document.querySelector(sectionId);
      if (!section) return;
      const bgImg = [...section.querySelectorAll('img')].find(img => {
        const s = img.getAttribute('style') || '';
        return (s.includes('inset:0') || s.includes('inset: 0'));
      });
      if (!bgImg) return;
      const container = bgImg.parentElement;
      const opM = (bgImg.getAttribute('style') || '').match(/opacity:\s*([\d.]+)/);
      const imgOpacity = opM ? parseFloat(opM[1]) : 1;
      // Resolve bgColor from computed style if not provided
      const baseBg = bgColor || window.getComputedStyle(container).backgroundColor || '#ffffff';
      await new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const W = img.naturalWidth;
          const H = img.naturalHeight;
          canvas.width = W; canvas.height = H;
          // Preenche fundo antes de desenhar a imagem (necessário quando opacity < 1)
          ctx.fillStyle = baseBg;
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = imgOpacity;
          ctx.drawImage(img, 0, 0, W, H);
          ctx.globalAlpha = 1;
          drawOverlay(ctx, W, H);
          container.style.setProperty('background-image', `url(${canvas.toDataURL('image/png')})`, 'important');
          container.style.setProperty('background-size', 'cover', 'important');
          container.style.setProperty('background-position', 'center', 'important');
          bgImg.style.display = 'none';
          bgImg.setAttribute('data-composited', '1');
          // Esconde overlay desta seção
          [...section.querySelectorAll('[style]')].forEach(el => {
            const s = el.getAttribute('style') || '';
            if ((s.includes('inset:0') || s.includes('inset: 0')) && s.includes('rgba')) el.style.display = 'none';
          });
          resolve();
        };
        img.onerror = resolve;
        img.src = bgImg.src;
      });
    }

    // Ana Luiza & Débora / Itália: #capa usa <img class="capa-bg-img"> (sem inline inset:0) e
    // <div class="capa-overlay"></div> vazia (gradiente via classe CSS) — compositeSection()
    // não encontra esse padrão (procura img com inset:0 inline) e fica um no-op, deixando o
    // fundo preto no PDF. Composita manualmente aqui com a mesma lógica.
    await (async () => {
      const section = document.querySelector('#capa');
      const bgImg = section && section.querySelector('img.capa-bg-img');
      if (!section || !bgImg) return;
      await new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const W = img.naturalWidth;
          const H = img.naturalHeight;
          canvas.width = W; canvas.height = H;
          ctx.drawImage(img, 0, 0, W, H);
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0,    'rgba(0,0,0,0.02)');
          grad.addColorStop(0.30, 'rgba(0,0,0,0)');
          grad.addColorStop(0.65, 'rgba(0,0,0,0.3)');
          grad.addColorStop(1.0,  'rgba(0,0,0,0.6)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
          section.style.setProperty('background-image', `url(${canvas.toDataURL('image/png')})`, 'important');
          section.style.setProperty('background-size', 'cover', 'important');
          section.style.setProperty('background-position', 'center 20%', 'important');
          bgImg.style.display = 'none';
          const overlay = section.querySelector('.capa-overlay');
          if (overlay) overlay.style.display = 'none';
          resolve();
        };
        img.onerror = resolve;
        img.src = bgImg.src;
      });
    })();

    // Boas-vindas: NÃO usa compositeSection — o loop genérico abaixo seta background-image
    // diretamente da URL HTTP, preservando a resolução nativa da imagem no PDF (sem rasterizar).

    // Menu principal: imagem de fundo (opacity 0.35) sobre fundo claro — sem overlay adicional
    await compositeSection('#menu-pratico', (ctx, W, H) => {});

    // Divisor início do roteiro: panorâmica de Roma com overlay escuro uniforme
    await compositeSection('#inicio-roteiro', (ctx, W, H) => {
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(0, 0, W, H);
    });

    // Encerramento: fundo menu-pratico-bg sem overlay
    await compositeSection('#encerramento', (ctx, W, H) => {});

    // v2: imgs absolutamente posicionadas com inset:0 são imagens de fundo inline (sem classes).
    // opacity < 0.5 → decorativa (ex: day header a 0.18) → esconder; container já tem cor sólida.
    // opacity ≥ 0.5 → foto principal → converter para CSS background-image.
    document.querySelectorAll('img').forEach(img => {
      if (img.getAttribute('data-composited') === '1') return;
      const s = img.getAttribute('style') || '';
      if ((s.includes('inset:0') || s.includes('inset: 0')) &&
          (s.includes('position:absolute') || s.includes('position: absolute'))) {
        const src = img.getAttribute('src');
        const parent = img.parentElement;
        const opM = s.match(/opacity:\s*([\d.]+)/);
        const opacity = opM ? parseFloat(opM[1]) : 1;
        if (opacity < 0.5) {
          img.style.display = 'none';
        } else if (src && parent) {
          const posM = s.match(/object-position:\s*([^;]+)/);
          const bgPos = posM ? posM[1].trim() : 'center';
          parent.style.setProperty('background-image', `url(${src})`, 'important');
          parent.style.setProperty('background-size', 'cover', 'important');
          parent.style.setProperty('background-position', bgPos, 'important');
          img.style.display = 'none';
        }
      }
    });

    // Cards de cidades no Guia de Combinações: canvas composite (img + gradient) → PNG flat.
    // Mesmo padrão do compositeSection da capa — elimina transparency groups na origem.
    for (const img of [...document.querySelectorAll('#excursoes img')]) {
      if (img.getAttribute('data-composited') === '1') continue;
      const container = img.parentElement;
      const src = img.getAttribute('src');
      if (!container || !src) continue;
      await new Promise(resolve => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          const W = image.naturalWidth;
          const H = image.naturalHeight;
          canvas.width = W;
          canvas.height = H;
          ctx.drawImage(image, 0, 0, W, H);
          container.style.setProperty('background-image', `url(${canvas.toDataURL('image/png')})`, 'important');
          container.style.setProperty('background-size', 'cover', 'important');
          container.style.setProperty('background-position', 'center', 'important');
          img.style.display = 'none';
          img.setAttribute('data-composited', '1');
          // Move texto do overlay gradient para novo div sem background,
          // depois esconde o div original — elimina Form XObject de transparência no PDF.
          [...container.children].forEach(child => {
            if ((child.getAttribute('style') || '').includes('gradient')) {
              const newDiv = document.createElement('div');
              newDiv.style.cssText = 'position:absolute;bottom:0;left:0;right:0;padding:2.5mm 3mm 2mm;';
              while (child.firstChild) newDiv.appendChild(child.firstChild);
              container.appendChild(newDiv);
              child.style.setProperty('display', 'none', 'important');
            }
          });
          resolve();
        };
        image.onerror = resolve;
        image.src = src;
      });
    }

    // Esconde overlay divs de cobertura total (position:absolute + inset:0 + rgba):
    // são decorativos (vinheta sobre foto) — convertê-los para opaco cobriria o fundo.
    // Capa e boas-vindas já foram tratados acima pelo compositeSection.
    document.querySelectorAll('[style]').forEach(el => {
      const s = el.getAttribute('style') || '';
      if ((s.includes('inset:0') || s.includes('inset: 0')) && s.includes('rgba')) {
        el.style.display = 'none';
      }
    });

    // v1 compat: cidade-hero com classe CSS explícita
    document.querySelectorAll('.cidade-hero').forEach(hero => {
      const img = hero.querySelector('img');
      if (img) {
        const src = img.getAttribute('src');
        if (src) {
          hero.style.setProperty('background-image', `url(${src})`, 'important');
          hero.style.setProperty('background-size', 'cover', 'important');
          hero.style.setProperty('background-position', 'center 40%', 'important');
        }
        img.style.display = 'none';
      }
      const overlay = hero.querySelector('.cidade-hero-overlay');
      if (overlay) overlay.style.display = 'none';
    });

    // Converte rgba de todos os demais elementos
    document.querySelectorAll('*').forEach(el => {
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none') return;
      const bg = toOpaque(cs.backgroundColor);
      if (bg) el.style.backgroundColor = bg;
      for (const side of ['Top','Right','Bottom','Left']) {
        const fixed = toOpaque(cs[`border${side}Color`]);
        if (fixed) el.style[`border${side}Color`] = fixed;
      }
      if (parseFloat(cs.opacity) < 0.99) el.style.opacity = '1';
    });

  });

  console.log('Gerando PDF...');
  await page.pdf({
    path: path.resolve(outputFile),
    format: 'A4',
    printBackground: true,
    tagged: false,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    timeout: 300000,
  });

  await browser.close();
  server.close();

  // Ghostscript: PDF 1.4 sem rasteirização forçada — o JS acima eliminou toda transparência na origem.
  // Texto e vetores ficam nítidos (não rasterizados). Imagens mantidas em qualidade original.
  // -dColorConversionStrategy=/sRGB: corrige perfis ICC problemáticos que causavam preto no Preview/iOS.
  const flatOutput = outputFile.replace(/\.pdf$/, '-final.pdf');
  console.log('Otimizando PDF para compatibilidade universal...');
  execSync(
    `/opt/homebrew/bin/gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dColorConversionStrategy=/sRGB -dProcessColorModel=/DeviceRGB -dEmbedAllFonts=true -dDownsampleColorImages=false -dDownsampleGrayscaleImages=false -sOutputFile="${flatOutput}" "${path.resolve(outputFile)}"`,
    { stdio: 'inherit' }
  );
  fs.unlinkSync(path.resolve(outputFile));
  fs.renameSync(flatOutput, path.resolve(outputFile));
  // iOS clipa y > page_height para page_height, tornando ajustes de y ineficazes.
  // iOS interpreta y=0 corretamente como "base da página M" = topo da página M+1 em scroll contínuo.
  // Fix: redireciona cada destino para página M-1 com y=0 → iOS renderiza como topo de M.
  const pyFix = `
import fitz, sys, shutil, re
src = sys.argv[1]
tmp = src + '.tmp.pdf'
doc = fitz.open(src)

page_obj_to_index = {}
index_to_page_obj = {}
for i in range(len(doc)):
    xref = doc[i].xref
    page_obj_to_index[xref] = i
    index_to_page_obj[i] = xref

count = 0
for xref in range(1, doc.xref_length()):
    try:
        obj = doc.xref_object(xref, compressed=False)
        if '/XYZ' in obj and '/Dest' in obj:
            m = re.search(r'/Dest\\s*\\[\\s*(\\d+)\\s*0\\s*R\\s*/XYZ', obj)
            if m:
                cur_page_obj = int(m.group(1))
                cur_idx = page_obj_to_index.get(cur_page_obj)
                if cur_idx is not None and cur_idx > 0:
                    prev_obj = index_to_page_obj[cur_idx - 1]
                    new_obj = re.sub(
                        r'/Dest\\s*\\[\\s*\\d+\\s*0\\s*R\\s*/XYZ\\s+[\\d.]+\\s+[\\d.]+\\s+[\\d.]+\\s*\\]',
                        f'/Dest [ {prev_obj} 0 R /XYZ 0 0 0 ]',
                        obj
                    )
                    if new_obj != obj:
                        doc.update_object(xref, new_obj)
                        count += 1
    except:
        pass

doc.save(tmp)
doc.close()
shutil.move(tmp, src)
print(f'Links iOS corrigidos: {count}')
`;
  const pyFixPath = path.resolve(path.dirname(outputFile), '_fix_links.py');
  fs.writeFileSync(pyFixPath, pyFix);
  console.log('Corrigindo y dos links para iOS...');
  execSync(`python3 "${pyFixPath}" "${path.resolve(outputFile)}"`, { stdio: 'inherit' });
  fs.unlinkSync(pyFixPath);

  console.log('PDF final gerado:', outputFile);
})();
