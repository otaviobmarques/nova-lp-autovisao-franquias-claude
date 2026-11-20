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
| `GTM_IDS` | `GTM-TS9TTZT4`, `GTM-P89JQ5JP` | Containers do Tag Manager (copiados do site atual) |
| `GA4_ID` | `G-6YX7V9V32Q` | Google Analytics 4 |
| `GOOGLE_ADS_ID` | `AW-16735504209` | Remarketing do Google Ads |
| `GOOGLE_ADS_LEAD_LABEL` | *(vazio)* | Rótulo da conversão de lead no Ads |
| `META_PIXEL_ID` | `916911729103377` | Pixel da Meta |
| `TURNSTILE_SITE_KEY` | *(vazio)* | Captcha Cloudflare Turnstile. Vazio = desafio próprio (conta simples) |
| `LEAD_ENDPOINT` | *(vazio)* | Para onde os leads vão (ver abaixo) |
| `PRESENTATION_FILE_ID` | ID do PDF no Drive | O arquivo precisa estar como "qualquer pessoa com o link" |

> As tags `<noscript>` do GTM e do Pixel no `index.html` repetem os IDs. Se trocar um ID, troque lá também.

### Leads: para onde vão

Sem `LEAD_ENDPOINT`, o lead só vira evento (GTM/GA4/Pixel) e abre o WhatsApp. **Configure um destino antes de colocar no ar.**

Opção pronta e gratuita: `integrations/google-apps-script.gs` grava cada lead numa Planilha Google, valida o Turnstile no servidor e manda e-mail para a expansão. As instruções estão no topo do arquivo. Também funciona com qualquer webhook que receba POST com JSON (RD Station, Zapier, Make, n8n).

Cada lead leva: nome, WhatsApp, e-mail, cidade, UF, prazo, temperatura (quente/morno/frio), UTMs de primeiro e último toque, gclid/fbclid, cookies `_fbp`/`_fbc`, client id do GA e `event_id` (para deduplicar com a API de Conversões da Meta).

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
| `form_error` | — | Tentou enviar com erro | Diagnóstico de UX |
| `generate_lead` | `Lead` | Formulário enviado. Leva `value` pela temperatura | Excluir de campanhas de captação |
| `file_download` | `DownloadApresentacao` | PDF liberado | Baixou e não chamou no WhatsApp |
| `contact` | `Contact` | Clique em WhatsApp, telefone ou e-mail | Contatos |
| `cta_click` | `CliqueCTA` | Qualquer botão com `data-track` | Análise de CTAs |
| `faq_open` | `DuvidaAberta` | Abriu uma pergunta | Dúvidas mais comuns |
| `service_tab` | `ServicosFiltro` | Filtrou serviços | Interesse em B2B |
| `exit_intent` | `IntencaoSaida` | Mouse saindo da página (desktop) | — |

**Valor do lead** (para otimizar campanhas por valor): "agora" = 100, "até 3 meses" = 80, "até 6 meses" = 40, "até 1 ano" = 20, "pesquisando" = 5.

Também ativos: correspondência avançada do Pixel e conversões otimizadas do Google (dados com hash), Consent Mode v2 com banner LGPD, captura de UTM/gclid/fbclid. Para ver os eventos no console, abra a página com `?av_debug=1`.

**Sobre o GTM atual:** os dois containers só têm tags de conversão do Google Ads (contas `AW-16735504209` e `AW-11341887504`), sem GA4 nem Pixel, então não há contagem em dobro. Os gatilhos dessas conversões foram feitos para o site antigo: aponte-os para o evento `av_generate_lead`.

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
- Símbolo isolado para outros usos: `assets/img/simbolo-autovisao.svg` e `simbolo-autovisao-branco.svg`
- Banner de prévia (WhatsApp, LinkedIn, Facebook, X): `assets/img/og-preview.jpg`, 1200×630, 95 KB (o WhatsApp ignora imagens acima de ~300 KB)

**Ao migrar para o domínio final**, troque `https://otaviobmarques.github.io/nova-lp-autovisao-franquias-claude` por `https://sejaumfranqueado.autovisao.com` nas tags `og:url`, `og:image`, `og:image:secure_url` e `twitter:image` do `index.html`. Depois, force a atualização da prévia no [Depurador de Compartilhamento da Meta](https://developers.facebook.com/tools/debug/) e no [Post Inspector do LinkedIn](https://www.linkedin.com/post-inspector/).

Depois de publicar no domínio final: envie o sitemap no Google Search Console e no Bing Webmaster Tools (o Bing alimenta o ChatGPT e o Copilot).

## Rodar localmente

```bash
python3 -m http.server 8000
```

Abra http://localhost:8000.
