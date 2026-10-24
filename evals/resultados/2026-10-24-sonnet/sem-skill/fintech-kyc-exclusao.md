**Resumo:** o fluxo não está certo. O problema principal não é apagar de menos, e sim apagar demais. Este é um app de instituição de pagamento autorizada pelo BCB (pelo `package.json`) e o fluxo apaga dados que a lei obriga a guardar. Ele também tem bugs que podem deixar a exclusão pela metade.

Não sou advogado. Os artigos e prazos abaixo são o que conheço, e o DPO ou o jurídico deve confirmá-los.

## Críticos

**1. Exclusão total de dados com guarda obrigatória** (`src/services/exclusao-conta.ts:6-19`)
- O LGPD art. 18, VI garante a eliminação, mas o art. 16, I permite (e na prática exige) manter dados para cumprir obrigação legal ou regulatória.
- Para PLD/FT, a Lei 9.613/98 (arts. 10 e 11) e a Circular BCB 3.978/2020 exigem guardar cadastro, KYC e registros de transações por pelo menos 5 anos após o fim do relacionamento. Pelo que conheço da Circular, o prazo pode chegar a 10 anos. Há também obrigações fiscais e de prevenção a fraude.
- O código apaga `kyc_verificacoes`, `kyc_documentos` (inclusive no S3), `transacoes` e `clientes`. Num incidente, numa fiscalização do BCB ou numa ordem judicial, você não teria como reconstituir quem era o cliente nem o que ele movimentou.
- O comentário "sem possibilidade de recuperação" e o da rota ("atende ao pedido de eliminação") mostram que esse é o comportamento pretendido, então o erro é de desenho.

**2. Sem rollback, e a ordem das operações deixa o estado inconsistente**
- Os arquivos do S3 são apagados **antes** do `BEGIN`. Se o banco falhar depois, os registros ficam apontando para arquivos que não existem mais.
- Não há `try/catch` nem `ROLLBACK`. Se um `DELETE` falhar, a transação fica aberta.
- Com `pg.Pool`, `db.query("BEGIN")` e as queries seguintes podem sair por conexões diferentes. Nesse caso a transação nem funciona. É preciso usar um único `client`.
- `req.db.contas.saldo(...)` indica que existe uma tabela de contas, mas ela não está em `schema.sql` e o serviço não a apaga. Se ela tiver FK para `clientes`, o último `DELETE` falha com o S3 já apagado.

## Importantes

**3. Eliminação sem cobrir os outros lugares com dados**
- Se o bucket tem versionamento, `deleteObject` só cria um delete marker e as versões antigas continuam lá.
- Faltam backups, logs, o `motorRisco` e outros operadores ou terceiros. O art. 18, §6 manda informar os agentes com quem os dados foram compartilhados.
- `transacoes.contraparte` (jsonb) guarda dados pessoais de terceiros.

**4. Falta transparência com o titular** (art. 9 e art. 18, §3)
- O botão promete "excluir", mas o correto é informar o que será eliminado, o que será mantido, por qual base legal e até quando.
- Falta uma resposta formal ao pedido, dentro do prazo legal.
- Falta confirmação do pedido, com reautenticação ou segundo fator, porque a ação é irreversível. Hoje basta uma requisição `DELETE` autenticada.

**5. Verificações incompletas antes de encerrar** (`src/routes/conta.ts:9-10`)
- Só se checa `saldo !== 0`. Faltam transações pendentes, contestações, MED do Pix e cartão em aberto.
- Não há trava entre a checagem e a exclusão. Um Pix recebido nesse intervalo faz o saldo ser apagado junto com a conta.
- Se `saldo` for float, a comparação com 0 é frágil.

## Como corrigir

Troque "excluir tudo" por **encerrar a conta, eliminar o que dá e reter bloqueado o que a lei exige**:

1. Elimine imediatamente `preferencias_marketing` e `sessoes`, além de e-mail, telefone e qualquer dado que não seja regulatório.
2. Mantenha `clientes` (identificação), `kyc_*` e `transacoes` numa tabela ou estado "encerrado". O acesso deve ser restrito, sem uso para marketing, e deve haver uma coluna `eliminar_apos`, por exemplo encerramento + prazo regulatório. Documentos e selfie ficam no S3 sob a mesma regra. Selfie é dado biométrico (art. 11), então vale uma política explícita de acesso.
3. Rode um job de expurgo que elimine tudo de fato quando o prazo vencer.
4. Faça tudo numa transação com um único `client`, com `ROLLBACK`. As operações externas (S3) vão para uma fila idempotente, depois do commit.
5. Registre a solicitação e a decisão num log de auditoria sem PII, para provar o atendimento.
6. Mude o texto do app para "Encerrar conta" e mostre o que é apagado e o que fica retido, com o motivo.
7. Defina em política interna os prazos de retenção por categoria, validados pelo jurídico, e registre as bases legais no ROPA.

Posso implementar isso (encerramento com retenção, transação correta e job de expurgo) se você me passar a decisão do jurídico sobre os prazos. Posso também só montar um esboço com os prazos como configuração.