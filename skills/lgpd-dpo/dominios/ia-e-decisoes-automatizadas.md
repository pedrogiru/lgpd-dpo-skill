# IA e decisões automatizadas

## Quando usar

Sempre que o código chamar provedor de LLM, OCR, transcrição, embeddings ou banco vetorial, ou quando
uma regra ou modelo aprovar, recusar, precificar, priorizar ou classificar pessoas. A regulamentação
específica da ANPD sobre IA e sobre o art. 20 ainda está em elaboração: ancore os achados nos arts.
6, 11, 20 e 33 da LGPD e não trate minuta ou consulta pública como obrigação.

## Disciplina do domínio (inclua no prompt)

```
- Trace o dado até o prompt: o que vai para o provedor, de quem é, se é sensível e se precisa ir.
- Retenção, uso para treino e região do provedor são configurações de conta ou contrato: se não
  estiverem no código, são precisa_validacao.
- O resultado gerado volta para o sistema? Então é dado pessoal novo, com o mesmo ciclo de vida.
- Decisão automatizada é achado quando afeta interesses do titular e não há caminho de revisão nem
  informação sobre critérios. Não exija revisão por pessoa natural: a lei não exige.
```

## Classes

**Dado pessoal desnecessário no prompt**
Documento inteiro, histórico completo, CPF, nome ou dado sensível enviado ao provedor quando a tarefa
não precisa disso (art. 6, III). A correção típica é minimizar ou pseudonimizar antes da chamada.

**Dado sensível em provedor externo**
Conteúdo de saúde, biometria, religião ou vida sexual enviado a LLM, OCR ou transcrição. Exige
hipótese do art. 11 para essa finalidade; se o provedor estiver fora do Brasil, também mecanismo de
transferência (ver [terceiros-e-rastreamento.md](terceiros-e-rastreamento.md)).

**Prompts guardados em ferramentas de observabilidade**
Tracing de LLM e logs de aplicação gravando prompts e respostas completos com dados pessoais, com
acesso e retenção mais largos que o sistema de origem.

**Embeddings e índices vetoriais sem controle**
Documentos com dados pessoais indexados sem filtro por titular, unidade ou permissão na consulta, ou
sem eliminação quando o documento de origem é apagado. A busca semântica vira caminho alternativo de
leitura.

**Decisão unicamente automatizada sem revisão**
Aprovação de crédito, recusa de cadastro, preço, limite, prioridade de atendimento ou triagem
decididos unicamente por regra ou modelo, sem caminho para o titular pedir revisão e sem informação
clara sobre critérios e procedimentos (art. 20, *caput* e §1). O segredo comercial pode limitar o
detalhe, não o direito. Se o código não mostra se há revisão fora do sistema, `precisa_validacao`.

**Inferência de dado sensível**
Modelo que estima saúde, orientação sexual, religião, etnia ou condição financeira a partir de
comportamento. O resultado é dado sensível e exige hipótese do art. 11; usá-lo para publicidade ou
preço agrava o risco (art. 6, IX, não discriminação).

**Agente com ferramentas sobre dados pessoais**
Agente de IA com acesso a banco, CRM ou e-mail sem limite de escopo por titular, sem registro das
ações e sem barreira contra instruções injetadas em conteúdo de terceiros.

## Regras de validação

1. Mostre o ponto do código onde o dado entra no prompt ou na requisição ao provedor.
2. Separe o que o código prova (campos enviados) do que só a conta ou o contrato prova (retenção,
   treino, região).
3. Para decisão automatizada, mostre a regra ou o modelo, o efeito sobre o titular e a ausência de
   caminho de revisão no sistema.
