/* =========================================================================
   AUTO VISÃO · CONFIGURAÇÃO DA LANDING PAGE
   Edite somente este arquivo para trocar IDs de rastreamento e integrações.
   Deixe um campo vazio ('') para desligar aquele recurso.
   ========================================================================= */
window.AV_CONFIG = {
  /* --- Rastreamento ------------------------------------------------------
     IDs da conta Auto Visão. Não misture com tags de outros clientes. */
  /* Container vazio, na conta do Otávio. Os eventos av_* seguem no dataLayer.
     Não crie tag de conversão nele sem desligar SEND_ADS_CONVERSIONS_VIA_GTAG. */
  GTM_IDS: ['GTM-M7TGT3T'],
  GA4_ID: 'G-6YX7V9V32Q',
  GOOGLE_ADS_ID: 'AW-16735504209',
  /* Conversão de lead (envio dos formulários). */
  GOOGLE_ADS_LEAD_LABEL: 'TSX2CPHt3P8ZENGOjqw-',
  /* Conversão '[Site] Botão wpp' — todo clique em WhatsApp.
     Sai pelo gtag. O GTM está vazio de propósito. */
  GOOGLE_ADS_WHATSAPP_LABEL: 'nLbrCMG-wd4ZENGOjqw-',
  /* true: envia as conversões do Ads pelo gtag (padrão).
     false: não envia pelo gtag. Use só se o GTM for a única fonte.
     Os eventos av_* continuam no dataLayer nos dois casos. */
  SEND_ADS_CONVERSIONS_VIA_GTAG: true,
  META_PIXEL_ID: '916911729103377',

  /* --- Captcha (Cloudflare Turnstile, gratuito) --------------------------
     Crie em dash.cloudflare.com > Turnstile e cole a Site Key aqui.
     Sem chave, a página usa um desafio simples próprio (conta + anti-robô). */
  TURNSTILE_SITE_KEY: '',

  /* --- Destino dos leads -------------------------------------------------
     ÚNICO lugar da URL. Cole aqui o /exec do Apps Script (DEPLOY-APPS-SCRIPT.md).
     Vazio = o formulário confirma na página e abre o WhatsApp, sem gravar o lead. */
  LEAD_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwKBv170Jt_vBEp0ZZzUjOvBztvG-b3ND2ITy6qBcwdH6SwtrxfmRnLrCu49lLGEWBs/exec',

  /* --- Apresentação para download (Google Drive, "qualquer pessoa com o link") */
  PRESENTATION_FILE_ID: '1D0wnsYKTpuYCD928u2J6OrE54C9iRuDi',
  PRESENTATION_NAME: 'Apresentacao-Franquia-Auto-Visao.pdf',

  /* --- Contato ---------------------------------------------------------- */
  WHATSAPP: '5519983668000',

  /* --- LGPD -------------------------------------------------------------
     'opt-out': rastreia por padrão e o banner permite recusar (padrão do mercado BR).
     'opt-in' : só rastreia anúncios/analytics depois que a pessoa aceitar. */
  CONSENT_MODE: 'opt-out'
};
