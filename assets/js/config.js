/* =========================================================================
   AUTO VISÃO · CONFIGURAÇÃO DA LANDING PAGE
   Edite somente este arquivo para trocar IDs de rastreamento e integrações.
   Deixe um campo vazio ('') para desligar aquele recurso.
   ========================================================================= */
window.AV_CONFIG = {
  /* --- Rastreamento ------------------------------------------------------
     IDs copiados do site atual (sejaumfranqueado.autovisao.com) em 20/11/2026.
     ATENÇÃO: se algum container do GTM já dispara GA4, Google Ads ou o Pixel,
     apague o ID correspondente aqui para não contar tudo em dobro. */
  GTM_IDS: ['GTM-TS9TTZT4', 'GTM-P89JQ5JP'],
  GA4_ID: 'G-6YX7V9V32Q',
  GOOGLE_ADS_ID: 'AW-16735504209',
  // Rótulo da conversão de lead no Google Ads (Ferramentas > Conversões).
  // Formato: 'AbCdEfGhIjK'. Sem rótulo, a conversão do Ads não é enviada
  // (o remarketing continua funcionando).
  GOOGLE_ADS_LEAD_LABEL: '',
  META_PIXEL_ID: '916911729103377',

  /* --- Captcha (Cloudflare Turnstile, gratuito) --------------------------
     Crie em dash.cloudflare.com > Turnstile e cole a Site Key aqui.
     Sem chave, a página usa um desafio simples próprio (conta + anti-robô). */
  TURNSTILE_SITE_KEY: '',

  /* --- Destino dos leads -------------------------------------------------
     URL do Web App do Google Apps Script (veja integrations/google-apps-script.gs),
     ou qualquer webhook que aceite POST com JSON (RD Station, Zapier, Make, n8n...). */
  LEAD_ENDPOINT: '',

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
