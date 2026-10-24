**Resumo:** o fluxo atual apaga tudo de forma irreversível, e isso provavelmente é o problema. O app é uma instituição de pagamento regulada pelo BC, e parte desses dados tem guarda obrigatória. Revisei só `src/routes/conta.ts`, `src/services/exclusao-conta.ts`, `src/kyc/onboarding.ts` e `db/schema.sql`. Isto é evidência técnica, não parecer jurídico. Base legal, prazos de guarda e o que se aplica ao seu caso são decisões do controlador, com o encarregado e o jurídico.

## Achados

**1. Exclusão indevida de dados com guarda regulatória (principal)**
- Local: `src/services/exclusao-conta.ts:15-17` (e `:7-10` para os arquivos no S3).
- O que acontece: o fluxo apaga `kyc_documentos` (RG, CNH, selfie, comprovante), `kyc_verificacoes` (renda, ocupação, PEP, score de risco) e `transacoes`. Esses dados existem por exigência de PLD/FT (`onboarding.ts:6`).
- Por que importa: o art. 18, VI da LGPD só garante eliminação de dados tratados com consentimento. O art. 16, I permite conservar dados para cumprir obrigação legal ou regulatória. A referência do repositório de normas aponta guarda de **10 anos** para cadastro e operações em instituições financeiras (Circular BCB 3.978/2020, art. 67). Essa linha está marcada "confirmar" e eu não consegui conferir na fonte oficial, então não afirme esse prazo sem validar. Lei 9.613/1998 e normas de arranjos de pagamento também podem se aplicar.
- Resultado: se a guarda se confirmar, um clique do titular destrói evidência que a empresa precisa ter à disposição de BC, COAF e Justiça. O comentário da função ("sem possibilidade de recuperação") torna isso intencional. Como a exclusão é irreversível, não há como corrigir depois.

**2. Falta o desenho "encerrar + reter restrito + eliminar depois"**
O fluxo trata exclusão e encerramento como a mesma coisa. O desenho esperado é:
- Eliminar o que não tem guarda: sessões, preferências de marketing, e e-mail e telefone se não forem exigidos pelo cadastro.
- Reter o que tem guarda, com acesso restrito e sem uso para outra finalidade, e com data final de retenção.
- Eliminar tudo ao fim do prazo, com um job.
- Informar o titular do que foi mantido, por quanto tempo e com base em qual norma (art. 18, §4). Há um modelo de resposta em `dpo/titulares.md`.

**3. Sem registro nem resposta ao pedido (responsabilização, art. 6, X)**
A rota não grava que o pedido existiu, quando foi atendido e o que foi eliminado ou retido. Depois do `DELETE FROM clientes` não resta nada que prove o atendimento. O 204 também não diz ao titular o que aconteceu.

**4. Eliminação incompleta (provável, depende de fatos fora do repositório)**
O código só alcança 6 tabelas e o bucket KYC. Não confirmei os pontos abaixo:
- `req.motorRisco.avaliar` (`onboarding.ts:17`) recebe dados do cliente. Se for terceiro ou guardar histórico, a exclusão não chega lá, e o art. 18, §6 exige avisar quem recebeu os dados.
- Backups, logs, CRM, ferramentas de e-mail/push e analytics.
- `transacoes.contraparte` (jsonb) guarda dados de terceiros, que não pediram nada.

Isso fica como `precisa_validacao`. Quem confirma é o time de plataforma, com o inventário de sistemas.

**5. Integridade e segurança da operação**
- **Ordem errada:** o S3 é apagado (`:7-10`) antes da transação. Se o banco falhar depois, ficam linhas apontando para arquivos que não existem mais.
- **Sem tratamento de erro:** não há `ROLLBACK` nem `try/catch` (`:12-19`). Se um `DELETE` falhar, a transação fica aberta. Se `req.db` for um pool, `BEGIN` e os `DELETE` podem rodar em conexões diferentes e deixar exclusão parcial. Precisa validar como `req.db` é implementado.
- **Sem confirmação nem reautenticação:** `autenticado` basta (`conta.ts:7`). Uma sessão sequestrada apaga a conta de forma irreversível (art. 46, segurança).
- **Pré-condição incompleta:** o único bloqueio é saldo zero (`conta.ts:8-9`). Boletos e Pix pendentes, contestações e chargebacks não são verificados.
- **Mensagem do bloqueio:** o 409 diz só "transfira o saldo". Registre o pedido como pendente e informe o motivo.

**6. Pontos menores**
- `preferencias_marketing` é apagada. Se o e-mail ou telefone for reaproveitado depois, o opt-out some. Mantenha uma lista de supressão com o mínimo (hash com segredo, não hash simples).
- Se a selfie passar por reconhecimento facial, ela é dado biométrico, sensível pelo art. 5, II. O código não mostra isso, então precisa validação.

## Correção mínima sugerida

A regra que o sistema precisa garantir é: **o pedido de exclusão nunca destrói dado com guarda obrigatória e nunca deixa dado sem guarda para trás.**

1. Trocar `excluirContaCompleta` por `encerrarConta`:
   - Numa única transação, apagar sessões e marketing e marcar `encerrada_em` e `retencao_ate`.
   - Remover o acesso de uso normal do que for retido, movendo para papel ou schema restrito.
   - Gravar o registro do pedido, sem repetir dado pessoal além do necessário.
2. Criar um job que elimina `kyc_*`, `transacoes` e o S3 após `retencao_ate`. Aplicar a mesma regra aos backups.
3. Fazer o S3 só depois do commit, de forma idempotente, ou deixar o job fazer.
4. Exigir reautenticação (senha ou biometria) antes do encerramento.
5. Notificar os operadores e terceiros do inventário.
6. Responder ao titular com o modelo de `dpo/titulares.md`.
7. Testes de regressão:
   - Após `DELETE /conta`, não restam sessões nem marketing, e `kyc_*` e `transacoes` seguem existindo, restritos.
   - Uma falha no meio não deixa estado parcial.
   - O job elimina tudo depois do prazo.

## O que precisa de decisão fora do código

- **Jurídico/compliance:** confirmar quais dados e qual prazo de guarda se aplicam (PLD/FT, fiscal, arranjo de pagamento), e se a contagem começa no encerramento da relação.
- **Encarregado:** publicar a política de retenção, atualizar o aviso de privacidade e o RoPA com a base legal "obrigação legal" para o que for retido.
- **Plataforma:** inventariar onde mais os dados do cliente vivem (item 4).

Não alterei nenhum arquivo. Se quiser, implemento o `encerrarConta` e os testes, ou monto o texto de resposta ao titular.