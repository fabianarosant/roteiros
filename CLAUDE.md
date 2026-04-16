# Vamos Carimbar — Roteiros

## ⚠️ Regras de segurança — LEIA ANTES DE QUALQUER AÇÃO

**NUNCA excluir pastas ou arquivos de clientes.** Cada pasta `{pais}/{cliente}/` é um roteiro entregue ou em produção. Deletar é irreversível e pode destruir trabalho já enviado ao cliente.

**NUNCA sobrescrever o `01MODELO-MESTRE/template.html`** com conteúdo de cliente. O template é a base de todos os roteiros futuros — deve conter apenas `{{PLACEHOLDER}}` e nunca dados reais.

**Para criar um novo roteiro: SEMPRE duplicar o template mestre.** O fluxo correto é:
1. Criar nova pasta `{pais-slug}/{cliente-slug}/` (nunca reutilizar ou renomear pasta existente)
2. Copiar `01MODELO-MESTRE/template.html` → `{pais}/{cliente}/index.html`
3. Copiar `01MODELO-MESTRE/assets/` → `{pais}/{cliente}/assets/`
4. Preencher os `{{PLACEHOLDER}}` no novo `index.html` com os dados do briefing

**Em caso de dúvida:** perguntar à Fabiana antes de mover, renomear ou apagar qualquer arquivo.

**Não criar arquivos de backup manuais** (`index-backup.html`, `index-v2.html`, etc.) — o projeto usa git como sistema de versionamento. Antes de fazer alterações grandes em um roteiro existente (ex: avançar da Etapa 1 para a Etapa 2 de um cliente Tipo B), fazer um commit com mensagem descritiva. Exemplos: `"vanessa: etapa 1 finalizada"`, `"maria: hoteis atualizados apos escolha"`. Isso preserva o histórico sem poluir as pastas com arquivos duplicados.

---

## O que é este projeto

Roteiros de viagem personalizados em HTML, criados pela Fabiana (Vamos Carimbar) para clientes. Cada roteiro é um único arquivo `index.html` com design system próprio, seções interativas e conteúdo completo da viagem.

---

## Estrutura de pastas

```
roteiros/
├── CLAUDE.md                          ← este arquivo
├── 01MODELO-MESTRE/
│   ├── template.html                  ← template base com placeholders
│   └── assets/                        ← assets de branding fixos (logos, foto-casal)
│       ├── branding/
│       ├── capas/
│       ├── cidades/
│       ├── atracoes/
│       ├── gastronomia/
│       ├── parceiros/
│       └── restaurantes/
├── {pais-slug}/
│   └── {cliente-slug}/
│       ├── index.html                 ← roteiro final do cliente
│       └── assets/                    ← imagens específicas deste roteiro
└── ...
```

**Exemplos reais:**
- `africa-do-sul/vanessa/index.html`
- `italia/` (em desenvolvimento)

---

## Tipos de cliente

### Tipo A — Roteiro completo
Voos, hospedagem e datas já definidos antes de começar. O roteiro é montado completo de uma vez — do voo de ida ao último dia. Exemplos: Vanessa (África do Sul), Ana Luiza & Débora (Itália).

### Tipo B — Do zero (consultoria)
A Vamos Carimbar estrutura tudo do zero: pesquisa voos, indica hotéis e constrói o roteiro progressivamente, conforme o cliente vai decidindo. O roteiro é entregue em etapas.

**Etapa 1 — Base de curadoria** (antes das decisões do cliente)

- Seções informativas prontas: capa, sobre o destino, guia financeiro, clima & mala, frases mágicas, guia gastronômico
- **Seção de recomendação de voos** (`#voos-recomendados`): 2–3 opções com data, horário, conexões, companhia, tempo total, valor estimado e print de tela. Levar em conta a cidade de origem do cliente, conforto logístico (horário de chegada, escalas razoáveis) e custo-benefício. Cada opção em card comparativo.
- **Seção de recomendação de hotéis** (`#hoteis-recomendados`): 3 opções por cidade/base, com nome, localização, o que inclui, faixa de preço e link. Organizar por perfil: econômico / custo-benefício / premium (ou central / boutique / vista, conforme o destino).
- Roteiro macro esboçado: dias temáticos sem horários fixos, para dar noção do ritmo da viagem.
- Seção de próximos passos: instrução clara do que o cliente deve decidir para avançar.

**Etapa 2 — Roteiro completo** (após escolhas confirmadas)

Com voos e hotel definidos, completar:
- Voo de ida e volta com dados reais
- Hotel(s) com dados reais
- Todos os dias com atrações, restaurantes, logística e horários
- Checklist de reservas e resumo financeiro final

**Estrutura de pasta para Tipo B:**
```
{pais-slug}/{cliente-slug}/
├── index.html         ← atualizado progressivamente (etapa 1 → etapa 2)
└── assets/
    ├── voos/          ← prints de tela das opções de voo
    └── hoteis/        ← fotos dos hotéis sugeridos (se houver)
```

---

## Como criar um novo roteiro

### Passo 1 — Identificar o tipo de cliente

Verificar se é **Tipo A** (pacote completo) ou **Tipo B** (consultoria por etapas) antes de começar. Isso define o que entra no roteiro agora e o que fica para depois.

### Passo 2 — Receber o briefing

A Fabiana manda um briefing com estas informações. Aguardar sempre o briefing completo antes de começar.

### Passo 3 — Criar a pasta

```
{pais-slug}/{cliente-slug}/
```
Exemplo: `japao/maria/`

Dentro dela, criar `assets/` com as subpastas:
`branding/`, `capas/`, `cidades/`, `atracoes/`, `gastronomia/`, `parceiros/`, `restaurantes/`

Para Tipo B, criar também: `assets/voos/`, `assets/hoteis/`

Copiar de `01MODELO-MESTRE/assets/branding/` os logos fixos da Vamos Carimbar.

### Passo 4 — Gerar o index.html

Usar `01MODELO-MESTRE/template.html` como base. Substituir todos os `{{PLACEHOLDER}}` com os dados do briefing. Seguir o mapa de seções abaixo.

### Passo 5 — Confirmar com a Fabiana

Antes de finalizar, confirmar os conteúdos das seções financeiras e datas que ela não enviou no briefing.

---

## Briefing padrão

Quando a Fabiana pedir um novo roteiro, ela deve fornecer (ou eu pergunto):

```
DADOS BÁSICOS
─────────────
País/Destino:
Slug do país (pasta):         ex: japao, franca, marrocos
Nome(s) do(s) cliente(s):     ex: Maria & João
Slug do cliente (pasta):      ex: maria
Período:                       ex: Setembro de 2026
Topbar curto:                  ex: Japão · Set 2026

VIAGEM
──────
Total de dias:
Cidades visitadas (em ordem):
Para cada cidade:
  - Nome
  - Quantos dias
  - Hotel (nome + endereço + o que inclui/não inclui)
  - Observações de segurança/contexto

Para cada dia:
  - Data e dia da semana
  - Tema/título (ex: "Chegada + Safari")
  - Ritmo (Leve / Moderado / Intenso)
  - Atrações (nome, horário, custo, ingresso, dicas)
  - Refeições sugeridas (restaurantes)
  - Transfer/logística

VOO IDA
───────
Origem → Destino:
Data e horário de partida:
Conexão (se houver):
Data e horário de chegada no destino:

VOO VOLTA
─────────
Partida do destino:
Data e horário:
Chegada (com conexão se houver):

EXTRAS
──────
Observações sobre o grupo (crianças, necessidades especiais):
Guia financeiro (câmbio, cartão recomendado, gorjetas):
Frases mágicas no idioma local:
Checklist de mala específico para o destino/clima:
Restrições alimentares:
```

---

## Mapa de seções do HTML

Cada seção tem um `id` fixo. A ordem no HTML é:

| ID | Seção | Tipo |
|----|-------|------|
| `capa` | Capa com foto e nome do país | Fixo |
| `menu-pratico` | Menu principal com botões | Fixo |
| `menu-dias` | Roteiro macro (grid de todos os dias) | Dinâmico |
| `cidade` | Sobre o país/destino | Dinâmico |
| `checklist-reservas` | Checklist de reservas + resumo financeiro | Dinâmico |
| `dinheiro` | Guia financeiro | Dinâmico |
| `clima` | Checklist clima e mala | Dinâmico |
| `frases` | Frases mágicas no idioma local | Dinâmico |
| `guia-gastronomico` | Guia gastronômico do país | Dinâmico |
| `legendas` | Legendas do roteiro | Fixo |
| `{cidade-slug}` | Hero da cidade (ex: `pilanesberg`, `cidade-do-cabo`) | Dinâmico |
| `dia01`, `dia02`... | Seções de cada dia | Dinâmico |
| `volta` | Voo de volta | Dinâmico |
| `encerramento` | Mensagem final | Fixo |
| *(sem id)* | Seção de redes sociais | Fixo |

**Nota sobre o checklist:** ele é inserido antes do `#cidade` via JavaScript (já no template).

---

## Componentes CSS — referência rápida

### Estrutura de página
```html
<section id="X" class="secao-wrapper">        <!-- seção fundo claro -->
<section id="X" class="dia-secao">            <!-- seção de dia (borda azul) -->
<section id="X" class="cidade-clean" style="--cidade-bg:url('...')"> <!-- hero cidade -->
<div class="page secao">                       <!-- conteúdo centralizado 780px -->
```

### Cabeçalho de dia
```html
<div class="dia-header-card">
  <div class="dia-header-pill-top">
    <span class="dia-header-titulo-novo">Dia 01</span>
    <div class="dia-header-data-wrap">
      <span class="dia-header-data-novo">21/07 · TERÇA</span>
    </div>
    <span class="dia-header-tema">🦁 Tema do dia</span>
  </div>
  <div class="dia-header-body">
    <span class="dia-header-ritmo">🚶 Ritmo: Leve · descrição</span>
  </div>
</div>
```

### Card de atração (componente principal dos dias)
```html
<div class="atracao-nova">
  <div class="atracao-nova-topo">
    <div class="atracao-nova-num" style="font-size:16px;">🗺️</div>
    <div class="atracao-nova-info">
      <span class="atracao-nova-nome">Nome da Atração <span class="atracao-data">Dia 01 · 21/07 · Terça</span></span>
      <span class="atracao-nova-cat">⏰ 09h00 · descrição curta</span>
    </div>
    <span class="selo CLASSE-SELO">texto</span>   <!-- opcional -->
  </div>
  <div class="atracao-info-faixa">               <!-- opcional: grid de infos -->
    <div><span class="info-label">Label</span><span class="info-valor">Valor</span></div>
    <div><span class="info-label">Label</span><span class="info-valor">Valor</span></div>
    <span class="info-atencao">Atenção importante.</span>
  </div>
  <div class="atracao-nova-corpo">               <!-- texto + imagem -->
    <div class="atracao-img-box is-placeholder">
      <img src="./assets/atracoes/dia-01/nome.jpg" alt="Nome" loading="lazy"
        onload="this.parentElement.classList.remove('is-placeholder')"
        onerror="this.parentElement.classList.add('is-placeholder')">
    </div>
    <p class="atracao-nova-desc">Descrição da atração.</p>
  </div>
  <div class="dicas-box">                        <!-- opcional: dicas -->
    <div class="dica-item">
      <span class="dica-item-icon">💡</span>
      <div><span class="dica-item-label">TÍTULO DICA</span>Texto da dica.</div>
    </div>
  </div>
</div>
```

### Selos de atração
```html
<span class="selo selo-pre-viagem">🎟️ Pré-viagem</span>   <!-- comprar antes -->
<span class="selo selo-amarelo">🟡 Ingresso no Local</span>  <!-- comprar lá -->
<span class="selo selo-verde">🔵 Gratuito</span>             <!-- grátis -->
<span class="selo selo-incluso">✓ Incluso</span>             <!-- incluso no hotel/pacote -->
```

### Card simples (informações)
```html
<div class="card">
  <div class="card-header">
    <span class="card-header-icon">💡</span>
    <span class="card-header-titulo">Título do Card</span>
  </div>
  <div class="card-body">
    <p>Conteúdo.</p>
  </div>
</div>
```

### Card2 (info com ícone grande — usado na seção do país)
```html
<div class="card2-grid">
  <div class="card2">
    <span class="card2-icon">🗣</span>
    <div>
      <span class="card2-label">Label</span>
      <span class="card2-valor">Valor Principal</span>
      <span class="card2-detalhe">Detalhe explicativo.</span>
    </div>
  </div>
</div>
```

### Caixas de destaque
```html
<div class="dica-box">                           <!-- azul — dica/info positiva -->
  <span class="dica-box-label">🔑 TÍTULO</span>
  <p>Texto.</p>
</div>

<div class="dica2-box">                          <!-- dourado — atenção/aviso amigável -->
  <span class="dica2-label">⚠️ TÍTULO</span>
  <p>Texto.</p>
</div>

<div class="alerta-box">                         <!-- vermelho — alerta importante -->
  <span class="alerta-box-titulo">⚠️ Título</span>
  <p>Texto.</p>
</div>
```

### Restaurante
```html
<span class="rest-titulo-script">Sugestão de Jantar</span>
<div class="restaurante">
  <div class="restaurante-header">
    <div class="rest-letra">🍽️</div>     <!-- ou inicial: A, B, C -->
    <div class="rest-nome">
      Nome do Restaurante
      <span class="rest-recomendado-badge badge-premium">✨ Experiência</span>
      <!-- ou badge-bom (⭐ Bem Avaliado) ou badge-economico (💰 Econômico) -->
    </div>
  </div>
  <div class="restaurante-body">
    <p>📍 Endereço · observação</p>
    <p>Culinária: tipo · ambiente</p>
    <p>💰 <strong>ZAR 200–400</strong> por pessoa</p>
    <div class="rest-prato">Descrição do prato/destaque.</div>
    <p><span class="reserva-essencial">🔴 Reserva Essencial</span></p>
    <!-- ou reserva-recomendada ou reserva-direto -->
  </div>
</div>
```

### Hero de cidade (cidade-clean)
```html
<section id="slug-cidade" class="cidade-clean"
  style="--cidade-bg:url('./assets/cidades/slug/slug-capa.jpg');
         background:linear-gradient(135deg,#1a1a2e 0%,#2d3561 50%,#1a1a2e 100%);
         overflow:hidden;">
<div class="page secao" style="color:white;padding-top:40px;">
  <span class="cidade-nome">Nome da Cidade</span>
  <p class="cidade-resumo">Texto de intro da cidade.</p>
  <div class="city-cards-grid">
    <div class="legenda-glass">
      <span class="legenda-glass-titulo">Título do Card</span>
      <!-- conteúdo -->
    </div>
  </div>
  <div class="btn-menu-wrap"><a class="btn-menu" href="#menu-pratico" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);color:white;">Menu Principal</a></div>
</div>
</section>
```

### Card lista (docs, itens estruturados)
```html
<div class="card-lista">
  <div class="card-lista-item">
    <span class="card-lista-emoji">✅</span>
    <div class="card-lista-info">
      <span class="card-lista-titulo">Título do item</span>
      <span class="card-lista-desc">Descrição detalhada.</span>
    </div>
    <span class="card-lista-badge badge-req">Obrigatório</span>
    <!-- ou badge-rec (Recomendado) ou badge-ok (Dispensado/OK) -->
  </div>
</div>
```

### Título principal de seção
```html
<span class="titulo-principal">Nome da Seção</span>   <!-- fonte script, azul -->
```

### Botão voltar ao menu (final de cada seção)
```html
<div class="btn-menu-wrap"><a class="btn-menu" href="#menu-pratico">Menu Principal</a></div>
```

---

## Metodologia de conteúdo e tom

### Tom geral

- **Segunda pessoa do plural** — "vocês vão", "aproveitem", "confiram", "sigam". Nunca "você" no singular.
- **Pessoal mas não íntimo demais** — é um documento profissional que parece feito à mão. Cálido, não informal.
- **Sem inventar dados** — preços, horários e nomes sem confirmação: usar "A confirmar" ou perguntar à Fabiana antes de publicar.
- **Links externos** — sempre `target="_blank"`.
- **Imagens** — sempre usar o padrão `is-placeholder` com `onload`/`onerror`. Path: `./assets/atracoes/dia-XX/nome.jpg`

---

### Descrições de atrações (`atracao-nova-desc`)

Sempre **3 a 6 frases**. Nunca uma frase solta nem um bloco de 10 linhas. Equivale a um parágrafo de revista — substantivo mas não exaustivo.

**Estrutura em 3 camadas (sempre nesta ordem):**

1. **Contexto** — ancora o leitor no "por que isso existe e importa". Dado histórico, geográfico ou cultural específico.
   > "Construído entre 72 e 80 d.C. pelo imperador Vespasiano e inaugurado por Tito com 100 dias de jogos, o Coliseu comportava até 80 mil espectadores..."
   > "O Pilanesberg ocupa a cratera de um vulcão extinto há 1,2 bilhão de anos — uma das formações geológicas mais raras do planeta."

2. **Experiência** — o que se vê, sente, cheira e vive ali. Sensorial e concreto.
   > "A estrutura inclui piscina aquecida, mirantes e o famoso túnel subterrâneo de observação: um corredor escavado que termina num painel de vidro no nível do chão, com vista direta para o bebedouro — elefantes e rinocerontes chegam a metros de vocês, no nível dos cascos."

3. **Gancho final** — fato surpreendente, cena imaginada ou frase de impacto curta. Frequentemente personaliza com o nome do cliente.
   > "O Luigi vai viver o dia de explorador mais épico da viagem."
   > "A tradição da moeda foi popularizada pelo filme Três Moedas na Fonte (1954) — hoje a Trevi arrecada mais de €1 milhão por ano, doados à Caritas romana."

**Como começa:** sempre com dado factual (ano, localização, fundação, criador). Nunca com adjetivo genérico ("Este lindo lugar...") nem com pergunta retórica.

**Como termina:** fato inesperado, cena imaginada, frase curta de impacto, ou conexão com os clientes.

**Destinos de história rica (Itália, Europa):** mais camadas de erudição — fatos precisos, referências culturais secundárias, nomes de arquitetos/imperadores.

**Destinos de natureza (África, aventura):** mais camada emocional e sensorial — experiência física, clima, sons, o que se vai sentir no corpo.

---

### Resumo diário (`dica-box` com label "📋 Resumo do Dia")

**Formato:** um único parágrafo corrido. Nunca bullets. Nunca mais de 5–6 linhas.

**Sempre contém, nesta ordem:**
1. Caracterização temática do dia — uma expressão que define o espírito ("Dia longo de viagem", "Roma Antiga", "O dia mais cultural da viagem", "Dia para respirar fundo")
2. Sequência lógica das atividades (manhã → tarde → noite), em linguagem fluida
3. Frase final de antecipação ou síntese emocional

**Tom:** usa travessão (—) com frequência para adicionar detalhe sem abrir nova frase.

**Horários no resumo:**
- Destinos de safari/natureza: menciona horários específicos ("game drive às 16h", "saída às 11h")
- Destinos urbanos/culturais: mais temático, sem horários no resumo — horários ficam nos cards de atração

---

### Dicas (`dica-item`) — labels e quando usar

Toda atração tem `dicas-box` com 1 a 4 dicas. Cada uma: emoji + label em CAPS + texto.

| Label | Emoji | Quando usar | O que contém |
|-------|-------|-------------|--------------|
| **CARIMBE** | 📸 | Toda atração fotografável | Ângulo exato, horário ideal, enquadramento específico. É a dica mais frequente do roteiro. |
| **DICA** | 💡 | Truque que a maioria não sabe | Acesso alternativo, erro comum de turistas, alternativa mais barata ou menos lotada, comportamento local |
| **SEGURANÇA** | ⚠️ | Onde há risco real de erro ou perigo | Tom tranquilizador: delimita onde é seguro vs. onde tomar cuidado + instrução concreta |
| **GORJETA** / **GORJETA DO GUIA** | 🎁 | Após safaris, guias, housekeeping | Valor exato, momento certo, contexto cultural. Ex: "ZAR 100–150 para a família — pode ser em Rand ou dólar." |
| **IMIGRAÇÃO** | 🛂 | Chegada internacional | O que ter à mão, o que esperar, tom de rotina sem drama |
| Labels temáticos | varia | Quando o assunto é específico demais | Criar label próprio: FRIO NO TOPO, DASSIE, PINGUINS, TÚNEL SUBTERRÂNEO, LUIGI, TABLE MOUNTAIN, etc. |

**Dicas para crianças no grupo:** usar label com o nome da criança (ex: **LUIGI**, **PARA O LUIGI**). Aparece sempre que a atração tem algo relevante para ela: o que ela vai adorar, se pode participar, como ocupá-la, humor suave sobre a reação provável. A criança vira personagem ativo do roteiro.

---

### Personalização com nome dos clientes

**Nos textos de descrição:** o nome da criança aparece com frequência (10–15x ao longo do roteiro). Os adultos aparecem raramente — apenas na capa, menu principal, e 1–2 menções pontuais de humor no corpo.

**Adultos:** aparece em contextos de humor ou destaque pessoal.
> "O Felipe provavelmente vai amar; o Luigi provavelmente vai preferir o suco de uva. Os dois têm razão."

**Criança:** aparece para antecipar reação com afeto, incluí-la como protagonista, dar instrução prática, ou criar leveza.
> "O Luigi vai querer adotar um pinguim — avisem o guia."
> "Deixem o Luigi descobrir os animais sozinho — não falem antes. A reação vale mais."

**Grupos sem criança (só adultos):** o nome aparece pouco no corpo. Usa "vocês" e marcadores de grupo ("fiquem prontas", "casal", etc.) em vez de nomes individuais.

---

### Logística estratégica — sequência e timing

**A justificativa da sequência é sempre embutida no texto**, nunca explicitada como regra. O motivo aparece naturalmente:
> "Vão cedo — antes das 9h as ruas ainda estão vazias e as fotos ficam sem multidões." (Bo-Kaap)
> "De manhã cedo, com a luz rasante do sol e sem a multidão da tarde, essa é a foto do Coliseu que a maioria dos turistas nunca tira."
> "Ir cedo tem uma vantagem extra: a luz da manhã sobre a cidade é dourada e suave, as filas são menores."

**Os três critérios de sequência (comunicados organicamente):**
1. Luz fotográfica — manhãs têm luz melhor, menos turistas
2. Fluxo de turistas — explicar por que ir cedo ou tarde em cada atração
3. Proximidade geográfica — sempre com tempo de deslocamento explícito: "5 min a pé", "~10 min de Uber", "15 min de táxi"

**Horários nos cards:** sempre em `atracao-info-faixa` com label + valor. Usar til (~) para estimativas, horário exato apenas quando o horário é fixo (abertura, saída de transfer).

**Transferências e deslocamentos:** recebem card de atração próprio. A viagem é narrada como parte da experiência, não burocracia.
> "São aproximadamente 2h30 de estrada saindo de Joanesburgo em direção ao noroeste. A paisagem vai mudando ao longo do caminho — de metrópole para planície, até as primeiras montanhas arredondadas que marcam a cratera do vulcão extinto..."

---

### Preços e custos

**Formato de preço:** sempre com conversão em BRL quando relevante.
> "ZAR 1.200 · ~R$ 408 · câmbio R$ 0,34/ZAR"
> "€18 por pessoa · cobre Coliseu + Fórum Romano + Monte Palatino"

**Comparação agência vs. avulso:** usar grid de dois cards lado a lado.
- Card azul (`border: 1.5px solid #bfdbfe`) = opção avulsa / GetYourGuide
- Card laranja (`border: 1.5px solid #fed7aa`) = opção via agência brasileira
- Nunca recomendar explicitamente uma sobre a outra — apresentar as duas com seus diferenciais reais
- Exceção: quando uma tem vantagem logística clara, marcar o diferenciador ("guia em português", "cancelamento flexível")

**Incerteza de preços:** usar til (~) sistematicamente. Faixas quando o preço é variável: "~ZAR 700–900 para a família".

---

### Segurança

**Tom:** sempre tranquilizador e prático. Nunca alarmista. Padrão: reconhece o risco → delimita onde existe → dá instrução concreta → normaliza.
> "Dentro da praça, total tranquilidade. Fora do perímetro, sempre de Uber — não circulem a pé nas ruas adjacentes, especialmente à noite."

**Onde colocar:**
1. **Caixa vermelha global** (`alerta-box`) na seção Guia Financeiro — para destinos com risco urbano real (África, América Latina). 4 alertas em grid com ⚠️. **Não usar para a Itália ou Europa Ocidental.**
2. **dica-item com label SEGURANÇA** — embutido na atração específica onde o risco é relevante.
3. **`info-atencao`** nos cards de transfer/chegada — para instruções de chegada ao aeroporto.

---

### Restaurantes

**Estrutura fixa (sem exceção):**
```
[rest-letra: emoji ou inicial] Nome + badge de categoria
📍 Endereço · distância do hotel (a pé ou Uber)
Culinária: tipo · ambiente (sempre mencionar: "romântico", "descontraído", "de bairro", etc.)
💰 Faixa de preço por pessoa
[rest-prato] Prato destaque específico — 1 a 2 linhas
[badge de reserva]: 🔴 Reserva Essencial / ⚠️ Reserva Recomendada / ✅ Sem Reserva
```

**Badges de categoria:**
- `badge-premium` (dourado) → `✨ Experiência` — restaurante que é atração em si
- `badge-bom` (azul) → `⭐ Bem Avaliado` — excelentes avaliações e custo-benefício
- `badge-economico` (verde) → `💰 Econômico` — melhor custo-benefício da região

**Campo `rest-prato`:** sempre um prato ESPECÍFICO com micro-comentário. Nunca genérico.
> "carbonara, cacio e pepe ou amatriciana — massa italiano pra abrir o roteiro 🤌🏻"
> "Peçam o snoek (peixe local defumado), camarão da costa oeste e mussels — os frutos do mar de Hermanus são dos mais frescos da África do Sul."

**Título script antes do restaurante** (`rest-titulo-script`): sempre simples e informal.
> "Sugestão de Jantar", "Almoço no Lodge", "Sugestão pro Café da Manhã", "Sugestão pro Gelato"
> Pode ter tema: "Almoço 'Emily in Paris/Rome'" — com aspas para criar charme

---

### Intro das cidades (`cidade-resumo`)

**Tamanho:** 2 a 4 frases. Nunca mais que um parágrafo curto.

**Fórmula:**
1. Posição superlativa imediata — "uma das...", "a mais...", "um dos destinos..."
2. Lista de elementos específicos que justificam o superlativo
3. (Opcional) Declaração de impacto curta ou gancho emocional

> "Cape Town é uma das cidades mais bonitas do mundo. O Oceano Atlântico em um lado, o Índico do outro, Camps Bay com suas palmeiras e montanhas ao fundo, o colorido de Bo-Kaap subindo a encosta, vinícolas a 45 minutos da cidade. Natureza, gastronomia, história, arte e o pôr do sol mais bonito da África do Sul."

> "Capital econômica da África do Sul, JoBurg pulsa com energia contraditória: arranha-céus de vidro ao lado de grafites políticos, shoppings de luxo a minutos de bairros históricos que ainda guardam as cicatrizes do apartheid."

---

### Diferenças por tipo de destino

| Elemento | Natureza/Safari (África) | Cultural/Urbano (Itália/Europa) |
|----------|--------------------------|----------------------------------|
| Descrições | Mais sensorial, emocional, foco no corpo e clima | Mais histórico, erudito, fatos precisos e referências culturais |
| Resumo diário | Com horários específicos | Temático, sem horários no resumo |
| Segurança | Caixa vermelha global + dicas específicas | Só dicas comportamentais pontuais |
| Restaurantes | Mais simples, sem foto na maioria | Com foto (`restaurante-com-foto`), mais links de reserva, termos gastronômicos específicos |
| Personalização | Criança vira personagem ativo e recorrente | Adultos: "vocês", nomes raramente no corpo |
| Pontos do dia | Sem lista de pills | Lista de pills numerados após o resumo (resumo-pontos) |

---

## Variáveis de identidade visual (CSS custom properties)

```css
--azul: #1a3a5c          /* azul escuro — títulos, bordas */
--azul-medio: #2563a8    /* azul médio — botões, headers */
--azul-claro: #dbeafe    /* azul claro — backgrounds sutis */
--dourado: #c9a227
--dourado-claro: #f5e8b0
--vermelho: #c0392b
--vermelho-claro: #fdecea
--verde: #1a6b3c
--verde-claro: #d4edda
--cinza-claro: #f4f6f9
--cinza-borda: #dee2e6
--texto: #1c2b3a
```

---

## Assets de branding fixos (sempre os mesmos)

```
assets/branding/logo-vamos-carimbar-branco.png   ← logo branco (capa)
assets/branding/logo-vamos-carimbar-azul.png     ← logo azul (menu prático, encerramento)
assets/branding/foto-casal.png                   ← foto do casal (seção redes sociais)
assets/parceiros/cartao-nomad.png                ← cartão Nomad (guia financeiro)
```

---

## Seção de redes sociais (fixa — nunca muda)

A última seção antes do `</body>` é sempre a seção de redes sociais com os handles `@vamoscarimbar`, `@fabianarosant`, `@ericdepaula.cruz` e o YouTube. Copiar sempre do template sem alterar.

---

## JavaScript (fixo — nunca muda)

Dois blocos de script no final do `<body>`:
1. **Hamburger/Drawer** — menu lateral responsivo
2. **toggleAcordeao** — checklist de mala expansível

---

## Checklist de reservas (seção financeira)

Usa classes específicas: `rf-card`, `rf-secao`, `rf-linha`, `rf-label`, `rf-sub`, `rf-valor`, `rf-subtotal`, `rf-total-box`. Ver o template para estrutura completa.

A seção `#checklist-reservas` é movida via JS para antes de `#cidade`:
```html
<script>
document.addEventListener('DOMContentLoaded', function(){
  var cidade = document.getElementById('cidade');
  var checklist = document.getElementById('checklist-reservas');
  if(cidade && checklist){ cidade.parentNode.insertBefore(checklist, cidade); }
});
</script>
```
