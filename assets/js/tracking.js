/* =========================================================================
   AUTO VISÃO · RASTREAMENTO E REMARKETING
   GTM + GA4 + Google Ads + Meta Pixel, com Consent Mode v2 (LGPD).
   Todo evento passa por AV.track(), que envia ao mesmo tempo para:
     - dataLayer (GTM)  -> evento "av_<nome>"
     - gtag (GA4 + Google Ads remarketing)
     - Meta Pixel (eventos padrão quando existem, personalizados nos demais)
   ========================================================================= */
(function () {
  'use strict';
  var C = window.AV_CONFIG || {};
  var w = window, d = document;

  /* ---------- Utilidades ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function cookie(name) { var m = d.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; }
  function uid() { return 'av.' + Date.now().toString(36) + '.' + Math.random().toString(36).slice(2, 10); }

  /* ---------- Consentimento (Consent Mode v2) ---------- */
  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  w.gtag = w.gtag || gtag;

  var saved = store('av_consent'); // 'granted' | 'denied' | null
  var defaultState = saved || (C.CONSENT_MODE === 'opt-in' ? 'denied' : 'granted');
  function consentObj(state) {
    return { ad_storage: state, ad_user_data: state, ad_personalization: state, analytics_storage: state, functionality_storage: 'granted', security_storage: 'granted' };
  }
  w.gtag('consent', 'default', Object.assign(consentObj(defaultState), { wait_for_update: 500 }));
  w.gtag('set', 'ads_data_redaction', defaultState === 'denied');
  w.gtag('set', 'url_passthrough', true);

  /* ---------- Origem do lead (UTM / gclid / fbclid), primeiro e último toque ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  var qs = new URLSearchParams(location.search), touch = {};
  KEYS.forEach(function (k) { if (qs.get(k)) touch[k] = qs.get(k); });
  if (Object.keys(touch).length) {
    touch.landing = location.href; touch.ts = new Date().toISOString();
    if (!store('av_first_touch')) store('av_first_touch', JSON.stringify(touch));
    store('av_last_touch', JSON.stringify(touch));
  }
  if (!store('av_first_visit')) store('av_first_visit', new Date().toISOString());
  var visits = parseInt(store('av_visits') || '0', 10);
  if (!sessionStorage.getItem('av_session')) { try { sessionStorage.setItem('av_session', '1'); } catch (e) {} visits++; store('av_visits', String(visits)); }

  /* ---------- Carregadores ---------- */
  function loadScript(src) { var s = d.createElement('script'); s.async = true; s.src = src; d.head.appendChild(s); }

  // Google Tag Manager (um ou mais containers)
  (C.GTM_IDS || []).filter(Boolean).forEach(function (id, i) {
    if (i === 0) w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript('https://www.googletagmanager.com/gtm.js?id=' + id);
  });

  // gtag.js (GA4 + Google Ads)
  var gtagId = C.GA4_ID || C.GOOGLE_ADS_ID;
  if (gtagId) {
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + gtagId);
    w.gtag('js', new Date());
    if (C.GA4_ID) w.gtag('config', C.GA4_ID, { visit_number: visits });
    if (C.GOOGLE_ADS_ID) w.gtag('config', C.GOOGLE_ADS_ID, { allow_enhanced_conversions: true });
  }

  // Meta Pixel
  if (C.META_PIXEL_ID) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(w, d, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    if (defaultState === 'denied') w.fbq('consent', 'revoke');
    w.fbq('init', C.META_PIXEL_ID);
    w.fbq('track', 'PageView');
  }

  /* ---------- Mapa de eventos -> Meta Pixel ---------- */
  var META_STD = {
    generate_lead: 'Lead',
    contact: 'Contact',
    view_content: 'ViewContent',
    file_download: null // tratado como personalizado
  };
  var META_CUSTOM = {
    file_download: 'DownloadApresentacao',
    section_view: 'SecaoVista',
    scroll_depth: 'ProfundidadeScroll',
    engaged_visitor: 'VisitanteEngajado',
    form_start: 'FormularioIniciado',
    cta_click: 'CliqueCTA',
    faq_open: 'DuvidaAberta',
    service_tab: 'ServicosFiltro',
    exit_intent: 'IntencaoSaida',
    returning_visitor: 'VisitanteRecorrente'
  };

  /* ---------- API pública ---------- */
  var AV = w.AV = w.AV || {};
  AV.uid = uid;
  AV.track = function (name, params, opts) {
    params = params || {}; opts = opts || {};
    var eventId = params.event_id || uid();
    var payload = Object.assign({ page_location: location.href }, params, { event_id: eventId });

    // 1) GTM
    w.dataLayer.push(Object.assign({ event: 'av_' + name }, payload));
    // 2) GA4 + Google Ads (audiências de remarketing usam estes eventos)
    if (gtagId) w.gtag('event', name, payload);
    // 3) Meta Pixel (event_id permite deduplicar com a API de Conversões)
    if (w.fbq && C.META_PIXEL_ID) {
      var metaParams = { content_name: params.content_name || params.section || params.form || params.cta_id || name, content_category: 'Franquia Auto Visão' };
      if (params.value) { metaParams.value = params.value; metaParams.currency = 'BRL'; }
      if (params.uf) metaParams.region = params.uf;
      var std = META_STD[name];
      if (std) w.fbq('track', std, metaParams, { eventID: eventId });
      if (META_CUSTOM[name]) w.fbq('trackCustom', META_CUSTOM[name], Object.assign(metaParams, params), { eventID: eventId + '.c' });
    }
    if (opts.debug || /[?&]av_debug=1/.test(location.search)) console.info('[AV.track]', name, payload);
    return eventId;
  };

  /* Dados do usuário para correspondência avançada (Meta) e conversões otimizadas (Google).
     O Pixel e o gtag aplicam hash SHA-256 antes de enviar. */
  AV.identify = function (u) {
    var phone = (u.phone || '').replace(/\D/g, '');
    if (phone && phone.indexOf('55') !== 0) phone = '55' + phone;
    var names = (u.name || '').trim().toLowerCase().split(/\s+/);
    if (w.fbq && C.META_PIXEL_ID) {
      w.fbq('init', C.META_PIXEL_ID, {
        em: (u.email || '').trim().toLowerCase(), ph: phone,
        fn: names[0] || '', ln: names.length > 1 ? names[names.length - 1] : '',
        ct: (u.city || '').toLowerCase().replace(/\s+/g, ''), st: (u.uf || '').toLowerCase(), country: 'br'
      });
    }
    if (gtagId) {
      w.gtag('set', 'user_data', {
        email: (u.email || '').trim().toLowerCase(), phone_number: phone ? '+' + phone : undefined,
        address: { first_name: names[0] || '', last_name: names.length > 1 ? names[names.length - 1] : '', city: u.city || '', region: u.uf || '', country: 'BR' }
      });
    }
  };

  /* Conversão de lead no Google Ads (só com rótulo configurado). */
  AV.adsConversion = function (value, eventId) {
    if (C.GOOGLE_ADS_ID && C.GOOGLE_ADS_LEAD_LABEL) {
      w.gtag('event', 'conversion', { send_to: C.GOOGLE_ADS_ID + '/' + C.GOOGLE_ADS_LEAD_LABEL, value: value || 1, currency: 'BRL', transaction_id: eventId });
    }
  };

  /* Contexto de atribuição enviado junto com cada lead. */
  AV.attribution = function () {
    function parse(k) { try { return JSON.parse(store(k) || 'null'); } catch (e) { return null; } }
    return {
      first_touch: parse('av_first_touch'), last_touch: parse('av_last_touch'),
      first_visit: store('av_first_visit'), visits: visits,
      referrer: d.referrer || '', fbp: cookie('_fbp'), fbc: cookie('_fbc') || (qs.get('fbclid') ? 'fb.1.' + Date.now() + '.' + qs.get('fbclid') : ''),
      ga_client_id: (cookie('_ga').split('.').slice(-2).join('.')) || '', user_agent: navigator.userAgent
    };
  };

  /* Atualiza consentimento (chamado pelo banner). */
  AV.setConsent = function (state) {
    store('av_consent', state);
    w.gtag('consent', 'update', consentObj(state));
    w.gtag('set', 'ads_data_redaction', state === 'denied');
    if (w.fbq) w.fbq('consent', state === 'granted' ? 'grant' : 'revoke');
    w.dataLayer.push({ event: 'av_consent_update', consent: state });
  };
  AV.consentDecided = function () { return !!saved || !!store('av_consent'); };

  /* ---------- Gatilhos automáticos de remarketing ---------- */
  function onReady(fn) { if (d.readyState !== 'loading') fn(); else d.addEventListener('DOMContentLoaded', fn); }

  onReady(function () {
    if (visits > 1) AV.track('returning_visitor', { visits: visits });

    // Profundidade de rolagem: 25/50/75/90%
    var marks = [25, 50, 75, 90], hit = {};
    function onScroll() {
      var h = d.documentElement, max = h.scrollHeight - h.clientHeight;
      if (max <= 0) return;
      var pct = Math.round((h.scrollTop || d.body.scrollTop) / max * 100);
      marks.forEach(function (m) { if (pct >= m && !hit[m]) { hit[m] = 1; AV.track('scroll_depth', { percent: m }); } });
    }
    w.addEventListener('scroll', onScroll, { passive: true });

    // Tempo de engajamento ativo (aba visível): 30s, 60s, 120s
    var active = 0, sent = {};
    setInterval(function () {
      if (d.visibilityState !== 'visible') return;
      active += 5;
      [30, 60, 120].forEach(function (s) { if (active >= s && !sent[s]) { sent[s] = 1; AV.track('engaged_visitor', { seconds: s }); } });
    }, 5000);

    // Seções vistas (audiências por interesse). Serviços/Estrutura/Apresentação viram ViewContent.
    var CONTENT = { servicos: 1, estrutura: 1, apresentacao: 1, 'como-funciona': 1 };
    if ('IntersectionObserver' in w) {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var id = e.target.id;
          if (e.isIntersecting && !seen[id]) {
            seen[id] = 1;
            AV.track('section_view', { section: id });
            if (CONTENT[id]) AV.track('view_content', { content_name: id });
          }
        });
      }, { threshold: 0.35 });
      d.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
    }

    // Cliques: WhatsApp, telefone, e-mail e qualquer elemento com data-track
    d.addEventListener('click', function (ev) {
      var a = ev.target.closest('a, button');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var loc = a.getAttribute('data-loc') || (a.closest('[id]') || {}).id || '';
      if (/wa\.me|whatsapp/.test(href)) AV.track('contact', { method: 'whatsapp', location: loc, content_name: 'whatsapp' });
      else if (href.indexOf('tel:') === 0) AV.track('contact', { method: 'phone', location: loc, content_name: 'telefone' });
      else if (href.indexOf('mailto:') === 0) AV.track('contact', { method: 'email', location: loc, content_name: 'email' });
      var t = a.getAttribute('data-track');
      if (t) AV.track('cta_click', { cta_id: t, location: loc, cta_text: (a.textContent || '').trim().slice(0, 60) });
    });
  });
})();
