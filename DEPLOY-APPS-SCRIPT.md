# Implantar o receptor de leads

O código está em `integrations/google-apps-script.gs`. O e-mail de aviso já é `otaviobmarques@gmail.com`. O assunto sai como `Novo lead Franquia Auto Visão - <nome>`, com todos os campos, UTMs, página e horário em America/Sao_Paulo.

1. Crie uma Planilha Google em branco.
2. Extensões → Apps Script. Apague o que estiver no editor, cole o arquivo inteiro e salve.
3. Implantar → Nova implantação → engrenagem → **App da Web**.
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
4. Autorize Planilhas e envio de e-mail.
5. Copie a URL que termina em `/exec`.
6. Cole essa URL em `LEAD_ENDPOINT`, no arquivo `assets/js/config.js`. É o único lugar.
7. Publique a landing de novo.

Teste: abra a URL `/exec` no navegador. A resposta deve ser `{"ok":true,"service":"auto-visao-leads"}`. Envie o formulário da página e confira a aba **Leads** e a caixa de entrada.

Não crie `TURNSTILE_SECRET` enquanto o site usar o captcha próprio. O segredo só entra quando houver Site Key do Turnstile em `config.js`.

Para avisar mais gente, em Configurações do projeto → Propriedades do script, crie `NOTIFY_EMAIL` com os e-mails separados por vírgula. Se essa propriedade existir, ela substitui o e-mail do arquivo. Se a aba Leads já tiver colunas antigas, apague a aba (ou use uma planilha nova) antes do primeiro lead.
