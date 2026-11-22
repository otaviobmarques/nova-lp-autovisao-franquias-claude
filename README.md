# Landing Page · Franquia Auto Visão

Página de vendas da franquia Auto Visão Vistorias. HTML, CSS e JS puros, sem build. Segue o **Design System Auto Visão v1.1** (cores, Nunito + Inter, botões 48 px, raios 8/12/16, foco visível, movimento 120/180/240 ms).

## Estrutura da página (jornada de venda)

| # | Seção | Objetivo |
|---|---|---|
| 1 | Hero | Promessa ("Seu próximo negócio pode ser Auto Visão"), prova e 2 CTAs |
| 2 | Números | +15 anos · +240 lojas · +18 estados · +80 mil laudos/mês |
| 3 | Por que | 3 pilares + comparativo "abrir sozinho × abrir Auto Visão" |
| 4 | Mercado | Frota, usados, gráfico por UF e Res. Contran 1.032/2026 (urgência) |
| 5 | Serviços | 11 serviços com filtro, destaque para a Vistoria 360° |
| 6 | Estrutura | 12 áreas da matriz em 3 fases (abrir, operar, vender) |
| 7 | Apresentação | Isca digital: formulário + captcha → download do PDF |
| 8 | Depoimentos | 3 franqueados |
| 9 | Como abrir | 4 etapas + "essa franquia é para você se…" |
| 10 | Dúvidas | FAQ (também em dados estruturados) |
| 11 | Contato | Formulário da expansão → WhatsApp |

## Configuração: um arquivo só

Tudo fica em **`assets/js/config.js`**:

| Campo | Valor atual | O que é |
|---|---|---|
| `GTM_IDS` | `GTM-M7TGT3T` | Container do Otávio. Está vazio. O script entra pelo `tracking.js`, no head |
| `GA4_ID` | `G-6YX7V9V32Q` | Google Analytics 4 |
| `GOOGLE_ADS_ID` | `AW-16735504209` | Google Ads |
| `GOOGLE_ADS_LEAD_LABEL` | `TSX2CPHt3P8ZENGOjqw-` | Conversão de lead (formulário enviado) |
| `GOOGLE_ADS_WHATSAPP_LABEL` | `nLbrCMG-wd4ZENGOjqw-` | Conversão `[Site] Botão wpp` (todo clique de WhatsApp) |
| `SEND_ADS_CONVERSIONS_VIA_GTAG` | `true` | `false` desliga o envio dessas conversões pelo gtag e deixa só o GTM |
| `META_PIXEL_ID` | `2296327844222677` | Pixel da Meta |
| `TURNSTILE_SITE_KEY` | *(vazio)* | Captcha Cloudflare Turnstile. Vazio = desafio próprio (conta simples) |
| `LEAD_ENDPOINT` | URL `/exec` publicada | Único lugar do Web App. Ver `DEPLOY-APPS-SCRIPT.md` |
| `PRESENTATION_FILE_ID` | ID do PDF no Drive | O arquivo precisa estar como "qualquer pessoa com o link" |

> As tags `<noscript>` do GTM e do Pixel no `index.html` repetem os IDs. Se trocar um ID, troque lá também.

### Leads: para onde vão

O endereço fica só em `LEAD_ENDPOINT` e já aponta para o App da Web publicado. A tela de sucesso e o fluxo de WhatsApp não esperam a resposta. Se o campo for esvaziado, o lead continua só como evento (GTM, GA4 e Pixel).

O POST sai em segundo plano (`fetch` com `keepalive` e `text/plain`, para não disparar preflight no Apps Script). Se a rede falhar, tenta `sendBeacon`. A confirmação na página não espera a resposta e não quebra se o endpoint estiver fora.

Para receber por e-mail, publique `integrations/google-apps-script.gs` como App da Web (acesso: qualquer pessoa). O passo a passo está em `DEPLOY-APPS-SCRIPT.md`. O aviso já vai para `otaviobmarques@gmail.com`, com o assunto `Novo lead Franquia Auto Visão - <nome>`, todos os campos do formulário, UTMs de primeiro e último toque, gclid/gbraid/wbraid/fbclid, página e data/hora em America/Sao_Paulo. Também funciona com qualquer webhook que receba POST com JSON.

Cada lead leva: nome, WhatsApp, e-mail, cidade, UF, prazo, temperatura (quente/morno/frio), mensagem, UTMs, cookies `_fbp`/`_fbc`, client id do GA e `event_id` (para deduplicar com a API de Conversões da Meta).

## Rastreamento e remarketing

Todo evento sai por `AV.track()` em `assets/js/tracking.js` e vai ao mesmo tempo para o **dataLayer** (`av_<evento>`), **GA4/Google Ads** e **Pixel da Meta**.

| Evento (GA4 / GTM) | Pixel Meta | Quando dispara | Público de remarketing sugerido |
|---|---|---|---|
| `section_view` | `SecaoVista` | Seção aparece na tela | Por interesse: viu Serviços, Estrutura, Mercado |
| `view_content` | `ViewContent` | Viu Serviços, Estrutura, Apresentação ou Como abrir | Interessados qualificados |
| `scroll_depth` | `ProfundidadeScroll` | 25, 50, 75 e 90% | Leu 75%+ e não converteu |
| `engaged_visitor` | `VisitanteEngajado` | 30 s, 60 s e 120 s com a aba ativa | 60 s+ sem lead |
| `returning_visitor` | `VisitanteRecorrente` | 2ª visita em diante | Voltou e não converteu (alta intenção) |
| `form_start` | `FormularioIniciado` | Clicou num campo | **Abandono de formulário** |
| `form_error` | `FormularioErro` | Tentou enviar com erro | Diagnóstico de UX |
| `generate_lead` | `Lead` | Formulário enviado. Leva `value` pela temperatura | Excluir de campanhas de captação |
| `file_download` | `DownloadApresentacao` | PDF liberado | Baixou e não chamou no WhatsApp |
| `contact` | `Contact` | Clique em WhatsApp, telefone ou e-mail | Contatos |
| `cta_click` | `CliqueCTA` | Botões e CTAs, com `cta_text` (nome) e `section` | Análise de CTAs |
| `faq_open` | `DuvidaAberta` | Abriu uma pergunta | Dúvidas mais comuns |
| `service_tab` | `ServicosFiltro` | Filtrou serviços | Interesse em B2B |
| `exit_intent` | `IntencaoSaida` | Mouse saindo da página (desktop) | — |

**Valor do lead** (para otimizar campanhas por valor): "agora" = 100, "até 3 meses" = 80, "até 6 meses" = 40, "até 1 ano" = 20, "pesquisando" = 5.

Também ativos: correspondência avançada do Pixel e conversões otimizadas do Google (dados com hash), Consent Mode v2 com banner LGPD, captura de UTM/gclid/fbclid. Para ver os eventos no console, abra a página com `?av_debug=1`.

### Conversões do Google Ads

| Ação | Rótulo | Quando dispara |
|---|---|---|
| Lead do formulário | `TSX2CPHt3P8ZENGOjqw-` | Envio bem-sucedido da apresentação e do contato |
| `[Site] Botão wpp` | `nLbrCMG-wd4ZENGOjqw-` | Qualquer clique em link de WhatsApp |

As duas saem pelo `gtag` com `SEND_ADS_CONVERSIONS_VIA_GTAG` em `true`. Pixel, GA4 e essas conversões saem direto pelo código. Os eventos `av_*` continuam no dataLayer.

O `GTM-M7TGT3T` está vazio. Não crie nele tag de conversão de lead nem de WhatsApp sem antes mudar `SEND_ADS_CONVERSIONS_VIA_GTAG` para `false`. Com a flag ligada, a mesma conversão no GTM conta duas vezes.

## SEO e IAs

- `title`, `description`, canonical, Open Graph e Twitter Card
- JSON-LD: `Organization` (com catálogo de 11 serviços), `WebSite`, `WebPage`, `FAQPage`
- Um `h1`, hierarquia de títulos, textos alternativos, HTML semântico
- `sitemap.xml` com imagens e os arquivos para IAs
- `robots.txt` liberando buscadores e robôs de IA (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot, Bingbot e outros)
- `llms.txt` (índice para IAs) e `llms-full.txt` (todo o conteúdo factual em texto simples, com fontes)
- Desempenho: hero em WebP (580 KB → 40 KB), fontes com `display=swap`, imagens com dimensões, scripts com `async`/`defer`

## Ícones e prévia de link

- Favicon gerado do **vetor oficial do símbolo** (DS p.31), sem redesenho: `favicon.ico` (16/32/48), `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (180), `icon-192/512.png` e `icon-maskable-512.png` (Android, versão branca sobre vermelho)
- **Logotipo em vetor**, extraído do Design System (p.31), com fundo transparente: `logo-autovisao.svg` (colorido, para fundo claro) e `logo-autovisao-branco.svg` (todo branco, para fundo escuro ou vermelho). Versões PNG transparentes de 1200 px com os mesmos nomes, para usos que não aceitam SVG
- Símbolo isolado para outros usos: `assets/img/simbolo-autovisao.svg` e `simbolo-autovisao-branco.svg`
- Banner de prévia (WhatsApp, LinkedIn, Facebook, X): `assets/img/og-preview.jpg`, 1200×630, 95 KB (o WhatsApp ignora imagens acima de ~300 KB)

Canonical, Open Graph (`og:url`, `og:image`, `og:image:secure_url`), Twitter (`twitter:url`, `twitter:image`), `sitemap.xml`, `robots.txt`, `llms.txt` e `llms-full.txt` já apontam para `https://sejaumfranqueado.autovisao.com/`. A política de privacidade está em `/privacidade`.

Páginas internas para sitelink, com URL limpa (`vercel.json` com `cleanUrls`): `/mercado`, `/servicos`, `/estrutura-e-suporte`, `/como-funciona`, `/depoimentos`, `/duvidas` e `/fale-conosco`. O menu da home continua em âncoras. Essas páginas usam o mesmo `config.js` e `tracking.js` da home.

Depois que o domínio estiver respondendo por esta página, force a atualização da prévia no [Depurador de Compartilhamento da Meta](https://developers.facebook.com/tools/debug/) e no [Post Inspector do LinkedIn](https://www.linkedin.com/post-inspector/). Envie o sitemap no Google Search Console e no Bing Webmaster Tools (o Bing alimenta o ChatGPT e o Copilot).

## Conferir o rastreamento

Abra a página com `?av_debug=1`. O console mostra cada `[AV.track]` e cada `[AV.ads]` (`gtag` ou `gtag desligado`).

- Rolagem: `scroll_depth` em 25, 50, 75 e 90.
- Tempo com a aba visível: `engaged_visitor` aos 30 s, 60 s e 120 s.
- Seções: `section_view` quando uma faixa da seção entra na tela, inclusive seções mais altas que o celular. Serviços, Estrutura, Apresentação e Como abrir também disparam `view_content`.
- CTAs e botões: `cta_click` com `cta_text` e `section`.
- WhatsApp, telefone e e-mail: `contact`. No WhatsApp, `[AV.ads]` com o rótulo `nLbrCMG-wd4ZENGOjqw-`.
- Formulário: `form_start` ao focar, `form_error` se faltar campo, `generate_lead` no GA4 e Lead no Pixel no envio válido, mais `[AV.ads]` com `TSX2CPHt3P8ZENGOjqw-`. No download, `file_download` em seguida.
- Filtro de serviços: `service_tab`. Pergunta do FAQ: `faq_open`.

O envio do formulário pede cerca de 2,5 s depois do primeiro clique no campo. Antes disso, a página pede para enviar de novo e não conta lead.

## Rodar localmente

```bash
python3 -m http.server 8000
```

Abra http://localhost:8000.
