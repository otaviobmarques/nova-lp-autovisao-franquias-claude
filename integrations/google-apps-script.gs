/**
 * AUTO VISÃO · RECEPTOR DE LEADS (Google Apps Script)
 * ---------------------------------------------------
 * Cole este arquivo inteiro no Apps Script e publique como App da Web.
 * O passo a passo curto está em DEPLOY-APPS-SCRIPT.md.
 *
 * Grava cada lead na Planilha Google e avisa por e-mail.
 * O envio padrão já vai para NOTIFY_EMAIL. Uma propriedade de script
 * com o mesmo nome, se existir, substitui este endereço (vários e-mails
 * separados por vírgula).
 *
 * Não preencha TURNSTILE_SECRET enquanto a landing usar o captcha próprio.
 * O segredo do Turnstile fica só aqui. Nunca coloque no site.
 */

var NOTIFY_EMAIL = 'otaviobmarques@gmail.com';
var TIMEZONE = 'America/Sao_Paulo';
var SHEET_NAME = 'Leads';
var HEADERS = [
  'Recebido em (America/Sao_Paulo)', 'Tipo', 'Nome', 'WhatsApp', 'E-mail', 'Cidade', 'UF', 'Prazo', 'Temperatura',
  'Mensagem', 'Captcha', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'gbraid', 'wbraid', 'fbclid',
  'utm_source (1º toque)', 'utm_medium (1º toque)', 'utm_campaign (1º toque)', 'utm_term (1º toque)', 'utm_content (1º toque)', 'gclid (1º toque)', 'gbraid (1º toque)', 'wbraid (1º toque)', 'fbclid (1º toque)',
  'Página', 'Landing', 'Referência', 'Visitas', 'Primeira visita', 'fbp', 'fbc', 'GA client id', 'User agent', 'Event ID'
];

function doPost(e) {
  try {
    var data = JSON.parse((e.postData && e.postData.contents) || '{}');
    var captcha = verifyTurnstile_(data.captcha_token);
    if (captcha === 'falhou') return json_({ ok: false, error: 'captcha' });

    var when = formatSP_(new Date());
    var row = leadRow_(data, captcha, when);
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try { sheet_().appendRow(row); } finally { lock.releaseLock(); }

    var mail = 'enviado';
    try { notify_(data, when); } catch (mailErr) { mail = 'falhou'; }
    return json_({ ok: true, mail: mail });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() { return json_({ ok: true, service: 'auto-visao-leads' }); }

function leadRow_(data, captcha, when) {
  var a = data.atribuicao || {};
  var last = a.last_touch || {};
  var first = a.first_touch || {};
  return [
    when, data.tipo, data.nome, data.whatsapp, data.email, data.cidade, data.uf, data.prazo, data.temperatura,
    data.mensagem, captcha, last.utm_source, last.utm_medium, last.utm_campaign, last.utm_term, last.utm_content,
    last.gclid, last.gbraid, last.wbraid, last.fbclid,
    first.utm_source, first.utm_medium, first.utm_campaign, first.utm_term, first.utm_content, first.gclid, first.gbraid, first.wbraid, first.fbclid,
    data.pagina, last.landing || first.landing, a.referrer, a.visits, a.first_visit, a.fbp, a.fbc, a.ga_client_id, a.user_agent, data.event_id
  ].map(cell_);
}

function verifyTurnstile_(token) {
  var secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) return token ? 'nao-verificado' : 'sem-token';
  if (!token || token === 'local-ok') return 'falhou';
  var res = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post', payload: { secret: secret, response: token }, muteHttpExceptions: true
  });
  var body = JSON.parse(res.getContentText() || '{}');
  return body.success ? 'ok' : 'falhou';
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSpreadsheetTimeZone() !== TIMEZONE) ss.setSpreadsheetTimeZone(TIMEZONE);
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0 || (sh.getLastRow() === 1 && sh.getLastColumn() !== HEADERS.length)) {
    if (sh.getLastRow() === 1) sh.clear();
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function recipients_() {
  var prop = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL') || '';
  prop = String(prop).trim();
  return prop || NOTIFY_EMAIL;
}

function notify_(d, when) {
  var to = recipients_();
  if (!to) return;
  var nome = String(d.nome || 'sem nome').replace(/[\r\n]+/g, ' ').slice(0, 120);
  var subject = 'Novo lead Franquia Auto Visão - ' + nome;
  var phone = String(d.whatsapp || '').replace(/\D/g, '');
  if (phone && phone.indexOf('55') !== 0) phone = '55' + phone;
  var a = d.atribuicao || {};
  var last = a.last_touch || {};
  var first = a.first_touch || {};
  var lines = [
    'Novo lead — Franquia Auto Visão',
    '',
    'Data/hora: ' + when + ' (America/Sao_Paulo)',
    'Tipo: ' + cell_(d.tipo),
    'Nome: ' + cell_(d.nome),
    'WhatsApp: ' + cell_(d.whatsapp) + (phone ? ' (https://wa.me/' + phone + ')' : ''),
    'E-mail: ' + cell_(d.email),
    'Cidade: ' + cell_(d.cidade),
    'UF: ' + cell_(d.uf),
    'Prazo: ' + cell_(d.prazo),
    'Temperatura: ' + cell_(d.temperatura),
    'Mensagem: ' + cell_(d.mensagem || '-'),
    'Página: ' + cell_(d.pagina),
    'Event ID: ' + cell_(d.event_id),
    '',
    'UTM (último toque)',
    'utm_source: ' + cell_(last.utm_source),
    'utm_medium: ' + cell_(last.utm_medium),
    'utm_campaign: ' + cell_(last.utm_campaign),
    'utm_term: ' + cell_(last.utm_term),
    'utm_content: ' + cell_(last.utm_content),
    'gclid: ' + cell_(last.gclid),
    'gbraid: ' + cell_(last.gbraid),
    'wbraid: ' + cell_(last.wbraid),
    'fbclid: ' + cell_(last.fbclid),
    'Landing: ' + cell_(last.landing || first.landing),
    '',
    'UTM (primeiro toque)',
    'utm_source: ' + cell_(first.utm_source),
    'utm_medium: ' + cell_(first.utm_medium),
    'utm_campaign: ' + cell_(first.utm_campaign),
    'utm_term: ' + cell_(first.utm_term),
    'utm_content: ' + cell_(first.utm_content),
    'gclid: ' + cell_(first.gclid),
    'gbraid: ' + cell_(first.gbraid),
    'wbraid: ' + cell_(first.wbraid),
    'fbclid: ' + cell_(first.fbclid),
    'Data do primeiro toque: ' + cell_(first.ts),
    '',
    'Atribuição',
    'Visitas: ' + cell_(a.visits),
    'Primeira visita: ' + cell_(a.first_visit),
    'Referência: ' + cell_(a.referrer),
    'fbp: ' + cell_(a.fbp),
    'fbc: ' + cell_(a.fbc),
    'GA client id: ' + cell_(a.ga_client_id),
    'User agent: ' + cell_(a.user_agent)
  ];
  MailApp.sendEmail(to, subject, lines.join('\n'));
}

function formatSP_(date) {
  return Utilities.formatDate(date, TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
}

function cell_(v) {
  if (v === undefined || v === null) return '';
  return String(v).replace(/[\r\n]+/g, ' ').slice(0, 500);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
