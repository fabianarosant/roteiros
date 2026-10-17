const path = require('path');
const fs = require('fs');
const {pathToFileURL} = require('url');
const puppeteer = require(path.resolve(__dirname, '../../../infoprodutos/node_modules/puppeteer'));
(async () => {
  const output = path.resolve(__dirname, '../../../output/pdf/maressa-guilherme-eua-resumo.pdf');
  fs.mkdirSync(path.dirname(output), {recursive:true});
  const browser = await puppeteer.launch({headless:'shell', args:['--no-sandbox']});
  try {
    const page = await browser.newPage();
    await page.setViewport({width:794,height:1123,deviceScaleFactor:1});
    await page.emulateMediaType('print');
    await page.goto(pathToFileURL(path.join(__dirname,'versao-pdf.html')).href,{waitUntil:'networkidle0',timeout:60000});
    await page.evaluate(()=>document.fonts.ready);
    const audit = await page.evaluate(()=>({
      fonts:document.fonts.status,
      images:[...document.images].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})),
      pages:[...document.querySelectorAll('.pagina')].map((p,i)=>{
        const content=p.querySelector('.content'); const footer=p.querySelector('.pf');
        return {page:i+1,id:p.id,bottom:content?content.getBoundingClientRect().bottom-p.getBoundingClientRect().top:0,limit:footer?footer.getBoundingClientRect().top-p.getBoundingClientRect().top-14:1123};
      })
    }));
    if(audit.images.some(i=>!i.ok)||audit.pages.some(p=>p.bottom>p.limit))throw new Error(JSON.stringify(audit,null,2));
    await page.pdf({path:output,format:'A4',preferCSSPageSize:true,printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});
    console.log(JSON.stringify({output,audit},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
