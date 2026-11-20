/**
 * AUTO VISÃO · RECEPTOR DE LEADS (Google Apps Script)
 * ---------------------------------------------------
 * Grava cada lead da landing page numa Planilha Google, valida o captcha
 * Cloudflare Turnstile no servidor e avisa a expansão por e-mail.
 *
 * Como instalar (5 minutos):
 *  1. Crie uma Planilha Google. Menu Extensões > Apps Script.
 *  2. Cole este arquivo inteiro e salve.
 *  3. Em "Configurações do projeto" > "Propriedades do script", crie:
 *       TURNSTILE_SECRET  -> Secret Key do Turnstile (opcional, mas recomendado)
 *       NOTIFY_EMAIL      -> e-mail(s) da expansão, separados por vírgula (opcional)
 *  4. Implantar > Nova implantação > Tipo "App da Web".
 *       Executar como: Eu  ·  Quem pode acessar: Qualquer pessoa
 *  5. Copie a URL /exec e cole em LEAD_ENDPOINT no arquivo assets/js/config.js.
 *
 * O segredo do Turnstile fica só aqui (servidor). Nunca coloque no site.
 */

var SHEET_NAME = 'Leads';
var HEADERS = [
  'Recebido em', 'Tipo', 'Nome', 'WhatsApp', 'E-mail', 'Cidade', 'UF', 'Prazo', 'Temperatura',
  'Mensagem', 'Captcha', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'fbp', 'fbc', 'GA client id', 'Visitas', 'Referência', 'Página', 'Event ID'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    var captcha = verifyTurnstile_(data.captcha_token);
    if (captcha === 'falhou') return json_({ ok: false, error: 'captcha' });

    var a = data.atribuicao || {};
    var t = a.last_touch || a.first_touch || {};
    var row = [
      new Date(), data.tipo, data.nome, data.whatsapp, data.email, data.cidade, data.uf, data.prazo,
      data.temperatura, data.mensagem, captcha, t.utm_source, t.utm_medium, t.utm_campaign, t.utm_term,
      t.utm_content, t.gclid, t.fbclid, a.fbp, a.fbc, a.ga_client_id, a.visits, a.referrer, data.pagina, data.event_id
    ].map(function (v) { return v === undefined || v === null ? '' : String(v).slice(0, 500); });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try { sheet_().appendRow(row); } finally { lock.releaseLock(); }

    notify_(data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() { return json_({ ok: true, service: 'auto-visao-leads' }); }

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
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold'); }
  return sh;
}

function notify_(d) {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  var subject = '[Franquia] ' + (d.temperatura ? d.temperatura.toUpperCase() + ' · ' : '') + d.nome + ' · ' + d.cidade + '/' + d.uf;
  var phone = String(d.whatsapp || '').replace(/\D/g, '');
  var body = [
    d.tipo, '',
    'Nome: ' + d.nome, 'WhatsApp: ' + d.whatsapp + ' (https://wa.me/55' + phone + ')', 'E-mail: ' + d.email,
    'Cidade: ' + d.cidade + '/' + d.uf, 'Prazo: ' + d.prazo, 'Mensagem: ' + (d.mensagem || '-')
  ].join('\n');
  MailApp.sendEmail(to, subject, body);
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
