# Requisições de titulares

## Conteúdo
- 1. Receber e registrar
- 2. Verificar identidade
- 3. Classificar o direito
- 4. Prazos
- 5. Localizar os dados
- 6. Responder
- 7. Sinais de problema técnico

Playbook para atender direitos dos arts. 18 a 20 da LGPD. A skill classifica o pedido, levanta onde
estão os dados (a partir do mapa de dados) e redige a resposta. Ela não acessa sistemas de produção:
quem extrai os dados é a área responsável, por canal autorizado.

A ANPD tem regulamentação de direitos dos titulares na agenda regulatória. Se já houver norma
publicada, ela prevalece sobre este playbook nos prazos e procedimentos: confira em
[../normas/referencias.md](../normas/referencias.md).

## 1. Receber e registrar

Registre: data e hora do pedido, canal, direito pedido, identificação do solicitante e se é o próprio
titular ou representante legalmente constituído (art. 18, §3), como procurador ou responsável legal
de menor.

## 2. Verificar identidade

Proporcional ao risco do pedido. Confirmar por e-mail ou telefone já cadastrado costuma bastar para
"confirmar que tenho cadastro"; acesso a dado sensível ou financeiro exige verificação mais forte
(login autenticado, documento conferido por atendente). Não peça mais dados do que o necessário para
verificar e não guarde a cópia do documento além do necessário.

Nunca envie dados para e-mail ou telefone diferente do cadastrado sem verificação.

## 3. Classificar o direito

| Direito | O que fazer | Atenção |
|---|---|---|
| Confirmação da existência de tratamento (art. 18, I) | Responder se há tratamento | Prazos do art. 19 (item 4) |
| Acesso (art. 18, II) | Entregar os dados | Prazos do art. 19 (item 4) |
| Correção (art. 18, III) | Corrigir na origem e nas cópias | Avisar imediatamente quem recebeu os dados (art. 18, §6) |
| Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou em desconformidade (art. 18, IV) | Avaliar e executar | Avisar quem recebeu (art. 18, §6) |
| Portabilidade (art. 18, V) | Exportar em formato estruturado | Depende de regulamentação da ANPD; observados os segredos comercial e industrial |
| Eliminação dos dados tratados com consentimento (art. 18, VI) | Eliminar | Exceções do art. 16 (ex.: obrigação legal ou regulatória de guarda) |
| Informação sobre compartilhamento (art. 18, VII) | Listar as entidades públicas e privadas | Use a lista de terceiros do inventário |
| Informação sobre não consentir (art. 18, VIII) | Explicar as consequências | |
| Revogação do consentimento (art. 18, IX; art. 8, §5) | Parar o tratamento baseado nele | Não retroage; verifique se o sistema respeita a revogação |
| Oposição (art. 18, §2) | Avaliar | Cabe contra tratamento sem consentimento feito em desconformidade com a lei; típico em marketing por legítimo interesse |
| Revisão de decisão automatizada (art. 20) | Informar critérios e procedimentos; revisar | Segredo comercial pode limitar detalhes, não o direito; a revisão não precisa ser feita por pessoa natural |

## 4. Prazos

- **Confirmação ou acesso (art. 19)**: em formato simplificado, imediatamente; ou por declaração
  clara e completa (origem, inexistência de registro, critérios e finalidade), em até **15 dias**
  contados do requerimento. O prazo de 15 dias é **desta** declaração, não dos demais direitos.
- **Demais direitos (art. 18, §§3 a 5)**: atendimento sem custos, nos prazos e termos do
  regulamento. Se não for possível atender imediatamente, responda ao titular comunicando que não é
  agente de tratamento (e indicando quem é, se possível) ou as razões de fato ou de direito que
  impedem a providência imediata (art. 18, §4).

## 5. Localizar os dados

Use `inventario-dados.md` (se houver auditoria) ou levante com as áreas: sistema principal, CRM,
mensageria, planilhas, BI, backups, terceiros. Para cada local, anote o que existe sobre o titular e
se há guarda legal que impede a eliminação.

## 6. Responder

Modelo de resposta de eliminação com exceção legal:

```text
Olá, <nome>.

Recebemos em <data> seu pedido de exclusão de dados. Já excluímos: <cadastro de marketing,
histórico de navegação, preferências>. Também pedimos a exclusão a <terceiros que receberam os
dados>.

Alguns dados precisam ser mantidos por obrigação legal: <quais> por <prazo>, conforme <norma>.
Eles ficam guardados com acesso restrito e não são usados para outras finalidades. Ao fim do prazo,
serão eliminados.

Dúvidas: <canal do titular / contato do encarregado>.
```

## 7. Sinais de problema técnico

Se o atendimento esbarrar em algo assim, abra uma auditoria focada no sistema:

- não há como achar todos os dados de uma pessoa (sem chave comum entre sistemas);
- a exclusão não chega a CRM, índices, terceiros ou backups ativos;
- a exclusão apaga dados que tinham guarda obrigatória;
- a revogação do consentimento não para o envio de mensagens;
- não há registro de com quem os dados foram compartilhados.
