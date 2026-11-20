/* =========================================================================
   AUTO VISÃO · INTERAÇÕES DA PÁGINA
   ========================================================================= */
(function () {
  'use strict';
  var C = window.AV_CONFIG || {};
  var AV = window.AV || { track: function () { return ''; }, identify: function () {}, adsConversion: function () {}, attribution: function () { return {}; }, setConsent: function () {}, consentDecided: function () { return true; }, uid: function () { return String(Date.now()); } };
  var d = document, w = window;
  d.documentElement.classList.add('js');
  function $(s, r) { try { return (r || d).querySelector(s); } catch (e) { return null; } }
  function $$(s, r) { try { return Array.prototype.slice.call((r || d).querySelectorAll(s)); } catch (e) { return []; } }
  var reduced = w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header sólido + barra mobile ---------- */
  var header = $('#topo'), bar = $('#mobileBar'), hero = $('#inicio'), progress = $('#progress'), photo = $('.hero__photo');
  var wide = w.matchMedia('(min-width: 960px)');
  function onScroll() {
    var y = w.scrollY;
    var max = d.documentElement.scrollHeight - w.innerHeight;
    if (progress) progress.style.setProperty('--p', max > 0 ? Math.min(y / max, 1).toFixed(4) : 0);
    // Parallax leve na foto do hero (só desktop e sem movimento reduzido)
    if (photo && !reduced && wide.matches && hero && y < hero.offsetHeight) photo.style.setProperty('--parallax', (y * 0.12).toFixed(1) + 'px');
    header.classList.toggle('is-solid', y > 24);
    if (bar) {
      var pastHero = y > (hero ? hero.offsetHeight * 0.7 : 400);
      var nearForm = $$('#apresentacao .form-card, #contato .form-card').some(function (el) { var r = el.getBoundingClientRect(); return r.top < w.innerHeight && r.bottom > 0; });
      bar.classList.toggle('is-visible', pastHero && !nearForm);
    }
  }
  w.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Menu mobile ---------- */
  var menuBtn = $('#menuBtn'), drawer = $('#drawer');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    drawer.hidden = !open;
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) header.classList.add('is-solid'); else onScroll();
  }
  menuBtn.addEventListener('click', function () { setMenu(drawer.hidden); });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- Link ativo na navegação ---------- */
  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in w) {
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      var s = $(href);
      if (s) navIO.observe(s);
    });
    ['#inicio', '#numeros', '#apresentacao', '#depoimentos', '#contato'].forEach(function (id) { var s = $(id); if (s) navIO.observe(s); });
  }

  /* ---------- Revelação + contadores ---------- */
  function countUp(el) {
    var end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduced) return;
    var t0 = null, dur = 1200;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = pre + v.toLocaleString('pt-BR') + suf; if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in w) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        $$('[data-count]', e.target).forEach(countUp);
        rio.unobserve(e.target);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -40px 0px' });
    $$('[data-reveal]').forEach(function (el) {
      // cascata entre irmãos do mesmo grupo (cards, passos, depoimentos)
      var sibs = $$(':scope > [data-reveal]', el.parentNode), idx = sibs.indexOf(el);
      el.style.transitionDelay = (idx > 0 ? Math.min(idx, 6) * 80 : 0) + 'ms';
      rio.observe(el);
    });
  } else { $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); }); }

  /* ---------- Filtro de serviços ---------- */
  var tabs = $$('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var f = tab.dataset.filter;
      tabs.forEach(function (t) { var on = t === tab; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on)); });
      $$('.services [data-cat]').forEach(function (c, i) {
        var hide = f !== 'all' && c.dataset.cat !== f;
        c.classList.toggle('is-hidden', hide);
        c.classList.toggle('is-showing', false);
        if (!hide && !reduced) { void c.offsetWidth; c.style.animationDelay = (i % 6) * 40 + 'ms'; c.classList.toggle('is-showing', true); }
      });
      AV.track('service_tab', { tab: f, section: 'servicos', content_name: f });
    });
  });

  /* ---------- FAQ: abre um por vez + evento ---------- */
  $$('.faq__item').forEach(function (it) {
    it.addEventListener('toggle', function () {
      if (!it.open) return;
      $$('.faq__item').forEach(function (o) { if (o !== it) o.open = false; });
      var summary = $('summary', it);
      var question = ((summary && summary.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 90);
      AV.track('faq_open', { question: question, section: 'duvidas', content_name: question });
    });
  });

  /* ---------- Opções dos selects ---------- */
  var UFS = [['AC','Acre'],['AL','Alagoas'],['AP','Amapá'],['AM','Amazonas'],['BA','Bahia'],['CE','Ceará'],['DF','Distrito Federal'],['ES','Espírito Santo'],['GO','Goiás'],['MA','Maranhão'],['MT','Mato Grosso'],['MS','Mato Grosso do Sul'],['MG','Minas Gerais'],['PA','Pará'],['PB','Paraíba'],['PR','Paraná'],['PE','Pernambuco'],['PI','Piauí'],['RJ','Rio de Janeiro'],['RN','Rio Grande do Norte'],['RS','Rio Grande do Sul'],['RO','Rondônia'],['RR','Roraima'],['SC','Santa Catarina'],['SP','São Paulo'],['SE','Sergipe'],['TO','Tocantins']];
  // valor = temperatura do lead (usado como "value" em Meta e Google para otimizar campanhas)
  var PRAZOS = [['imediato', 'Quero abrir agora', 'quente', 100], ['3m', 'Em até 3 meses', 'quente', 80], ['6m', 'Em até 6 meses', 'morno', 40], ['12m', 'Em até 1 ano', 'morno', 20], ['pesquisando', 'Ainda estou pesquisando', 'frio', 5]];
  $$('[data-uf]').forEach(function (s) { s.innerHTML = '<option value="">UF</option>' + UFS.map(function (u) { return '<option value="' + u[0] + '">' + u[0] + ' · ' + u[1] + '</option>'; }).join(''); });
  $$('[data-prazo]').forEach(function (s) { s.innerHTML = '<option value="">Selecione</option>' + PRAZOS.map(function (p) { return '<option value="' + p[0] + '">' + p[1] + '</option>'; }).join(''); });

  /* ---------- Máscara de telefone ---------- */
  function maskPhone(v) {
    v = v.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
    if (v.length > 10) return '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
    if (v.length > 6) return '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
    if (v.length > 2) return '(' + v.slice(0, 2) + ') ' + v.slice(2);
    return v.length ? '(' + v : '';
  }
  $$('input[type="tel"]').forEach(function (i) { i.addEventListener('input', function () { i.value = maskPhone(i.value); }); });

  /* ---------- Captcha: Turnstile (se configurado) ou desafio próprio ---------- */
  var turnstileReady = false, widgets = {};
  function initCaptchas() {
    $$('[data-captcha]').forEach(function (box) {
      var form = box.closest('form');
      if (C.TURNSTILE_SITE_KEY && w.turnstile) {
        widgets[form.id] = w.turnstile.render(box, { sitekey: C.TURNSTILE_SITE_KEY, language: 'pt-br', theme: 'light', size: 'flexible', action: form.dataset.form });
      } else if (!C.TURNSTILE_SITE_KEY) {
        var a = 2 + Math.floor(Math.random() * 7), b = 1 + Math.floor(Math.random() * 8);
        box.dataset.answer = String(a + b);
        box.innerHTML = '<div class="captcha__box"><label for="' + form.id + '-cap">Verificação: quanto é ' + a + ' + ' + b + '?<input id="' + form.id + '-cap" name="captcha" inputmode="numeric" autocomplete="off" maxlength="2" required></label><small>Confirma que você não é um robô.</small></div>';
      }
    });
  }
  if (C.TURNSTILE_SITE_KEY) {
    w.avTurnstileLoaded = function () { turnstileReady = true; initCaptchas(); };
    var ts = d.createElement('script'); ts.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=avTurnstileLoaded'; ts.async = true; ts.defer = true; d.head.appendChild(ts);
  } else { initCaptchas(); }
  function captchaToken(form) {
    var box = $('[data-captcha]', form);
    if (C.TURNSTILE_SITE_KEY) { return turnstileReady && w.turnstile ? w.turnstile.getResponse(widgets[form.id]) : ''; }
    var inp = $('input', box);
    return inp && inp.value.trim() === box.dataset.answer ? 'local-ok' : '';
  }

  /* ---------- Validação (DS: validar após interação, mensagem que explica como corrigir) ---------- */
  var MSG = {
    nome: 'Informe seu nome e sobrenome.',
    whatsapp: 'Informe um WhatsApp válido com DDD.',
    email: 'Informe um e-mail válido, como nome@email.com.',
    cidade: 'Informe a cidade onde quer abrir a loja.',
    uf: 'Selecione o estado.',
    prazo: 'Selecione quando pretende abrir.',
    lgpd: 'Marque a autorização para podermos falar com você.',
    captcha: 'Confira a verificação antirrobô.'
  };
  function check(el) {
    var v = (el.value || '').trim(), ok = true;
    switch (el.name) {
      case 'nome': ok = v.split(/\s+/).length >= 2 && v.length >= 5; break;
      case 'whatsapp': ok = /^\d{10,11}$/.test(v.replace(/\D/g, '')) && !/^(\d)\1+$/.test(v.replace(/\D/g, '')); break;
      case 'email': ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v); break;
      case 'lgpd': ok = el.checked; break;
      default: ok = v.length > 0;
    }
    return ok;
  }
  function setError(el, ok) {
    if (el.name === 'lgpd') { var m = el.closest('form').querySelector('.field__msg--consent'); m.textContent = ok ? '' : MSG.lgpd; el.setAttribute('aria-invalid', String(!ok)); return; }
    var f = el.closest('.field'); if (!f) return;
    var msg = $('.field__msg', f);
    f.classList.toggle('has-error', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    if (msg) { msg.textContent = ok ? '' : MSG[el.name] || 'Preencha este campo.'; if (!msg.id) msg.id = el.id + '-msg'; el.setAttribute('aria-describedby', msg.id); }
  }

  /* ---------- Envio do lead ---------- */
  function driveUrl() { return 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(C.PRESENTATION_FILE_ID); }
  function wppUrl(text) { return 'https://wa.me/' + C.WHATSAPP + '?text=' + encodeURIComponent(text); }
  function formSection(kind) { return kind === 'download' ? 'apresentacao' : 'contato'; }
  /* O endpoint não pode segurar nem cancelar a confirmação na página. */
  function sendLead(data) {
    if (!C.LEAD_ENDPOINT) return;
    var body = JSON.stringify(data);
    var beacon = function () {
      try { navigator.sendBeacon(C.LEAD_ENDPOINT, new Blob([body], { type: 'text/plain;charset=utf-8' })); } catch (e) {}
    };
    try {
      // text/plain evita preflight CORS (compatível com Google Apps Script)
      fetch(C.LEAD_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, keepalive: true }).catch(beacon);
    } catch (e) { beacon(); }
  }
  function startDownload() {
    // iframe oculto: o Drive responde com "attachment" e o navegador baixa sem abrir aba
    // (abrir aba depois de uma chamada assíncrona costuma ser bloqueado como pop-up)
    var f = d.createElement('iframe');
    f.style.display = 'none'; f.title = 'download'; f.src = driveUrl();
    d.body.appendChild(f);
  }

  $$('.lead-form').forEach(function (form) {
    var kind = form.dataset.form, started = false, t0 = Date.now();
    var fields = $$('input[name]:not([name="website"]):not([name="captcha"]):not([name^="cf-"]), select[name]', form);

    form.addEventListener('focusin', function () {
      if (started) return; started = true; t0 = Date.now();
      AV.track('form_start', { form: kind, section: formSection(kind) });
    });
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value || el.type === 'checkbox') setError(el, check(el)); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') setError(el, check(el)); });
      el.addEventListener('change', function () { if (el.getAttribute('aria-invalid') === 'true') setError(el, check(el)); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (el) { var ok = check(el); setError(el, ok); if (!ok && !firstBad) firstBad = el; });
      var token = captchaToken(form), capBox = $('[data-captcha]', form);
      capBox.classList.toggle('has-error', !token);
      var old = $('.form-alert', form); if (old) old.remove();
      if (!token && !firstBad) {
        firstBad = $('input', capBox) || capBox;
        var al = d.createElement('p'); al.className = 'form-alert'; al.setAttribute('role', 'alert'); al.textContent = MSG.captcha;
        capBox.after(al);
      }
      if (firstBad) { firstBad.focus({ preventScroll: false }); AV.track('form_error', { form: kind, field: firstBad.name || 'captcha', section: formSection(kind) }); return; }
      // Honeypot: robô, sem mensagem. Envio rápido demais: pede para tentar de novo, sem perder o formulário.
      var hp = form.elements.website && form.elements.website.value;
      if (hp) return;
      var btn = $('button[type="submit"]', form), label = $('span', btn);
      if (Date.now() - t0 < 2500) {
        var wait = d.createElement('p'); wait.className = 'form-alert'; wait.setAttribute('role', 'alert');
        wait.textContent = 'Confira os dados e toque em enviar de novo.';
        btn.before(wait);
        return;
      }

      btn.disabled = true; btn.setAttribute('aria-busy', 'true'); if (label) label.textContent = 'Enviando...';

      var v = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
      var prazo = PRAZOS.filter(function (p) { return p[0] === v('prazo'); })[0] || [];
      var eventId = AV.uid();
      var lead = {
        tipo: kind === 'download' ? 'Download da apresentação' : 'Contato expansão',
        nome: v('nome'), whatsapp: v('whatsapp'), email: v('email').toLowerCase(),
        cidade: v('cidade'), uf: v('uf'), prazo: prazo[1] || v('prazo'), temperatura: prazo[2] || '',
        mensagem: v('mensagem'), captcha_token: token, event_id: eventId,
        pagina: location.href, enviado_em: new Date().toISOString(), atribuicao: AV.attribution()
      };
      var value = prazo[3] || 10;

      AV.identify({ name: lead.nome, email: lead.email, phone: lead.whatsapp, city: lead.cidade, uf: lead.uf });
      AV.track('generate_lead', { form: kind, section: formSection(kind), uf: lead.uf, city: lead.cidade, lead_temperature: lead.temperatura, value: value, currency: 'BRL', event_id: eventId });
      AV.adsConversion({ value: value, eventId: eventId });
      try { sendLead(lead); } catch (err) {}

      var msgWpp = 'Olá! Sou ' + lead.nome + ' e tenho interesse em abrir uma franquia Auto Visão em ' + lead.cidade + '/' + lead.uf + '. Prazo: ' + (prazo[1] || '-') + '.' + (lead.mensagem ? ' ' + lead.mensagem : '');

      form.hidden = true;
      if (kind === 'download') {
        try { localStorage.setItem('av_download_ok', '1'); } catch (er) {}
        $('#downloadLink').href = driveUrl();
        $('#successWpp').href = wppUrl(msgWpp + ' Acabei de baixar a apresentação.');
        var ok = $('#downloadSuccess'); ok.hidden = false; ok.focus();
        AV.track('file_download', { file_name: C.PRESENTATION_NAME, content_name: 'apresentacao_franquia', section: 'apresentacao', event_id: eventId });
        startDownload();
      } else {
        $('#contatoWpp').href = wppUrl(msgWpp);
        var ok2 = $('#contatoSuccess'); ok2.hidden = false; ok2.focus();
      }
    });
  });

  /* ---------- Intenção de saída (desktop, uma vez por sessão, se ainda não baixou) ---------- */
  var exitDlg = $('#exitDialog');
  function exitAllowed() { try { return !sessionStorage.getItem('av_exit') && !localStorage.getItem('av_download_ok'); } catch (e) { return false; } }
  if (exitDlg && exitDlg.showModal && w.matchMedia('(pointer: fine)').matches) {
    var armed = false; setTimeout(function () { armed = true; }, 12000);
    d.addEventListener('mouseout', function (e) {
      if (!armed || e.relatedTarget || e.clientY > 8 || !exitAllowed()) return;
      try { sessionStorage.setItem('av_exit', '1'); } catch (er) {}
      exitDlg.showModal();
      AV.track('exit_intent', { content_name: 'exit_apresentacao' });
    });
    exitDlg.addEventListener('click', function (e) { if (e.target === exitDlg || e.target.closest('[data-close]')) exitDlg.close(); });
  }

  /* ---------- Banner LGPD ---------- */
  var cookie = $('#cookieBanner');
  if (cookie && !AV.consentDecided()) setTimeout(function () { cookie.hidden = false; }, 1200);
  $$('[data-consent]', cookie).forEach(function (b) {
    b.addEventListener('click', function () { AV.setConsent(b.dataset.consent); cookie.hidden = true; });
  });
  var oc = $('#openConsent'); if (oc) oc.addEventListener('click', function () { cookie.hidden = false; });
})();
