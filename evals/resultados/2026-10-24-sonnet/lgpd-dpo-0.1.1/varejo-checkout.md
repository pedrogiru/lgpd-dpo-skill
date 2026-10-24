# Revisão de LGPD do checkout

Li os 11 arquivos de `src/` e não executei nada. Esta revisão é técnica e não substitui parecer jurídico. Decisões sobre base legal, contrato com a Meta e porte da empresa são suas, com o DPO e o jurídico.

O repositório não tem `src/db`, o layout que chama `iniciarPixel`, o banner de cookies nem a página `/privacidade`. Por isso não consigo ver como CPF e e-mail são armazenados, qual é a retenção, nem se há consentimento antes do pixel. Esses pontos aparecem como "precisa validar".

## O que está errado e prova-se pelo código

| # | Achado | Risco | Onde |
|---|---|---|---|
| 1 | O corpo inteiro do checkout vai para o log | Médio | `checkout.ts:13`, `logger.ts:3-5` |
| 2 | CPF completo na URL do rastreio e no log de acesso | Médio | `pedidos.ts:8-10`, `rastreio.ts:2`, `server.ts:12-13` |
| 3 | Checkbox de marketing já vem marcado, sem registro do consentimento | Médio | `CheckoutForm.tsx:21`, `checkout.ts:22-27` |

**1. O corpo do checkout vai inteiro para o log.**
- `logger.info({ body: req.body }, ...)` grava nome, e-mail, CPF, telefone e endereço em `logs/app.log`.
- Esses logs ficam 90 dias e são lidos por toda a engenharia e pelo suporte N2.
- Isso fere a necessidade e a segurança (LGPD, art. 6º, III e VII, e art. 46).
- Também anula o `mascararCpf` de `audit-log.ts`: o CPF mascarado é gravado, mas o completo já foi gravado uma linha antes.

**2. O rastreio manda o CPF na query string.**
- O `morgan("combined")` registra a URL completa em `logs/access.log`, então o CPF fica sem máscara nesse arquivo.
- A URL com CPF também fica no histórico do navegador e em proxies e CDN.

**3. O consentimento de marketing não vale como está.**
- O `defaultChecked` não mostra um ato afirmativo do titular (art. 5º, XII, e art. 8º).
- O backend guarda só um booleano no pedido, sem data, sem versão do texto e sem ligação ao cliente. Você não consegue provar o consentimento (art. 8º, §2º) nem tratar uma revogação (art. 8º, §5º).

## O que depende de fato fora do repositório

**A. Pixel e API de Conversões da Meta.** É o ponto mais sensível para o lançamento.
- `meta-capi.ts:26-31` envia à Meta, a cada compra, e-mail e telefone com hash, IP, user-agent e `_fbp`. O hash SHA-256 continua sendo dado pessoal, porque a Meta usa o hash para identificar a pessoa.
- `checkout.ts:31` envia sempre, sem consultar nenhum consentimento. Mesmo que você bloqueie o pixel no navegador, o envio pelo servidor continua.
- `pixel.ts` carrega o `fbevents.js` em todas as páginas e dispara `PageView` sem condição. O chamador não está no repositório, então não sei se há banner antes.
- O que preciso saber:
  - Qual é a base legal adotada para anúncios (consentimento ou legítimo interesse)?
  - O aviso de privacidade cita a Meta?
  - Há contrato com a Meta? Os dados vão para os EUA, então é preciso um mecanismo do art. 33, como as cláusulas-padrão da Res. CD/ANPD nº 19/2024.
  - A "correspondência avançada automática" está ligada no painel da Meta? Com o pixel na página do checkout, ela pode ler os campos do formulário.
- Se a loja vende produto ou serviço de saúde, o próprio fato de comprar pode virar dado de saúde inferido. Aí vale a vedação do art. 11, §4º, e consentimento não a afasta. O evento atual só leva valor e moeda, sem itens, o que ajuda.

**B. Rastreio sem login e sem limite de tentativas.**
- Qualquer pessoa que saiba um CPF pode testar números de pedido. Um 200 confirma que aquela pessoa comprou na loja. A resposta é enxuta (número, status e previsão), então o dano é pequeno.
- Se existir limite de tentativas no WAF ou no gateway, isso cai. Também preciso saber se os números de pedido são sequenciais.

**C. Documentação do DPO.** Não dá para saber pelo código.
- Base legal de cada finalidade.
- Necessidade de CPF e telefone como campos obrigatórios. O CPF costuma ser exigido para a nota fiscal, mas o telefone obrigatório precisa de justificativa.
- Retenção de clientes e pedidos. Eliminar o que tem guarda fiscal seria erro, e guardar o resto sem prazo também.
- Canal para o titular exercer os direitos (art. 18) e atualização do RoPA.

## O que está certo

- `dedup.ts` usa HMAC com segredo (pepper) e a chave não sai do banco. É a forma correta, diferente de um hash simples de CPF.
- Os cookies `sid` e `carrinho_id` são estritamente necessários, e têm `httpOnly`, `secure` e `sameSite`. Não dependem de consentimento.
- A resposta do rastreio não devolve endereço nem dados do cliente.

## O que corrigir, em ordem

1. **Logs**
   - Em `checkout.ts:13`, logue só o que importa, por exemplo `logger.info({ itens: itens?.length }, "checkout recebido")`.
   - Como rede de proteção, configure `redact` no pino para `cpf`, `email`, `telefone`, `nome` e `endereco`.
   - No `morgan`, registre o caminho sem a query string do rastreio.
   - Apague ou anonimize os logs já gravados, inclusive a cópia no serviço de observabilidade. Isso não é, por si só, um incidente comunicável: o DPO avalia, já que o acesso foi interno.
   - Teste: um POST de checkout não pode deixar CPF, e-mail ou telefone em nenhum arquivo de log.

2. **Meta e consentimento**
   - Dispare o pixel só depois da escolha no banner, com "rejeitar" tão fácil quanto "aceitar".
   - Faça o front enviar o estado do consentimento de anúncios e o backend verificá-lo antes de `enviarCompraMeta` em `checkout.ts:31`.
   - Teste: sem consentimento, não pode haver chamada a `graph.facebook.com`.
   - Aproveite para envolver o envio em `try/catch` ou numa fila. Hoje, se a Meta falhar, o checkout devolve erro depois de o pedido já ter sido criado.
   - Em `pixel.ts`, o `window.fbq` é chamado sem o stub padrão do snippet da Meta. Se ele não estiver definido em outro lugar, isso lança erro.

3. **Checkbox de marketing**
   - Tire o `defaultChecked`.
   - Guarde, na tabela de clientes, o valor, a data e a versão do texto exibido.
   - Crie um caminho de revogação (link de descadastro e canal para o titular).

4. **Rastreio**
   - Troque o CPF por um token imprevisível enviado por e-mail, ou use POST com o CPF no corpo.
   - Limite tentativas por IP e por CPF.
   - Responda igual para "não existe" e "dados não conferem".

5. **Documentos** (ação do DPO)
   - Atualize o aviso de privacidade com a Meta, as finalidades, a retenção e a transferência internacional.
   - Atualize o RoPA e defina a política de retenção.

Posso aplicar as correções 1 a 4 no código, mas só altero algo se você pedir. Se quiser a auditoria completa (`achados.json` e relatório), preciso do contexto que faltou: se vocês são controladores e de que porte, e o objetivo da entrega.