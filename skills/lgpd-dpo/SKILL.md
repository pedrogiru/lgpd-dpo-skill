---
name: lgpd-dpo
description: LGPD (Lei 13.709/2018) e normas da ANPD conferidas e datadas, para auditoria de código e apoio ao encarregado (DPO) em qualquer setor no Brasil. Use SEMPRE que a pergunta ou a tarefa envolver LGPD, ANPD, dados pessoais ou privacidade no Brasil, inclusive perguntas jurídicas curtas (base legal, consentimento, dados sensíveis, crianças e adolescentes, ECA Digital, decisão automatizada, prazos, transferência internacional, retenção, RIPD, RoPA, encarregado, sanções), e ao revisar código, PR, formulário, banco, logs, cookies, pixels, SDKs, CRM ou IA que tratem dados pessoais. Também para incidente de segurança (comunicação à ANPD e aos titulares), pedidos de titulares, fornecedores, contratos de operador e aviso de privacidade. Evidência em arquivo:linha; separa o que o código prova do que depende do controlador. Rode o fluxo completo de auditoria só quando pedirem auditoria completa, relatório ou um entregável de DPO.
---

# LGPD e DPO

Encontre tratamentos de dados pessoais que violem uma obrigação concreta da LGPD, de regulamento da
ANPD ou de norma setorial, e entregue a quem decide a evidência, o risco ao titular e a correção
mínima. Um achado sem titular, dado, obrigação violada e resultado concreto não é um achado
confirmado.

Esta skill **não substitui parecer jurídico**. Ela produz evidência técnica e rascunhos. Decisões
sobre base legal, comunicação de incidente e aceitação de risco são do controlador, com o encarregado
e o jurídico. Diga isso uma vez em cada entrega, não em cada parágrafo.

## Modos de operação

Carregar a skill não autoriza o fluxo completo nem a criação de arquivos.

- **Orientação** (padrão): perguntas sobre LGPD, revisão focada de um arquivo, endpoint, formulário,
  integração ou PR. Use só as partes relevantes e responda na conversa.
- **Auditoria completa**: quando pedirem para auditar um repositório ou sistema inteiro, um
  "relatório de LGPD" ou uma revisão completa de privacidade. Siga o fluxo de seis fases abaixo.
- **Entregável de DPO**: quando pedirem um documento ou procedimento do encarregado. Funciona com ou
  sem código: sem repositório, colete os fatos com as perguntas do playbook.

Se o pedido couber em mais de um modo, faça uma pergunta objetiva antes de criar arquivos.

### Regra do modo orientação

Não responda "pode" ou "não pode" a uma pergunta jurídica. Diga quais hipóteses legais e obrigações
se aplicam, o que depende de fatos do controlador e quando levar ao jurídico. Pergunta técnica ("este
log expõe CPF?") pode e deve ter resposta direta.

## Contexto mínimo

Antes de uma auditoria completa ou de um entregável, descubra pelo contexto (ou pergunte, no máximo
quatro perguntas de uma vez):

1. **Papel**: a organização é controladora, operadora ou as duas coisas neste tratamento?
2. **Porte**: é agente de tratamento de pequeno porte (Res. CD/ANPD nº 2/2022)? Isso muda
   encarregado, prazos e documentação.
3. **Setor**: escolhe os arquivos de setor abaixo.
4. **Objetivo**: auditoria, preparação para fiscalização, resposta a incidente, novo produto.

## Arquivos de apoio

Leia só o que a tarefa pede.

| Tema | Arquivo |
|---|---|
| Mapa de dados, dicionário de campos, unidades de cobertura | [RECONHECIMENTO.md](RECONHECIMENTO.md) |
| Catálogo de achados por obrigação da LGPD | [CLASSES-DE-ACHADOS.md](CLASSES-DE-ACHADOS.md) |
| Vereditos, níveis de risco, verificação, relatório | [VALIDACAO-E-RELATORIO.md](VALIDACAO-E-RELATORIO.md) |
| Pixels, SDKs, analytics, mensageria, CRM, transferência internacional | [dominios/terceiros-e-rastreamento.md](dominios/terceiros-e-rastreamento.md) |
| IA, LLMs e decisões automatizadas (art. 20) | [dominios/ia-e-decisoes-automatizadas.md](dominios/ia-e-decisoes-automatizadas.md) |
| Saúde (clínicas, laboratórios, telemedicina, planos, benefícios) | [setores/saude.md](setores/saude.md) |
| Inventário (RoPA), RIPD, teste de legítimo interesse | [dpo/inventario-e-ripd.md](dpo/inventario-e-ripd.md) |
| Incidente de segurança, comunicação à ANPD e aos titulares | [dpo/incidentes.md](dpo/incidentes.md) |
| Requisição de titular | [dpo/titulares.md](dpo/titulares.md) |
| Fornecedores, operadores, transferência internacional, aviso de privacidade | [dpo/fornecedores-e-transferencia.md](dpo/fornecedores-e-transferencia.md) |
| Normas citadas, situação e data de verificação | [normas/referencias.md](normas/referencias.md) |
| Contrato de `achados.json` | [schemas/achados.schema.json](schemas/achados.schema.json) |

Setores sem arquivo próprio ainda: aplique o núcleo (classes, domínios, playbooks) e marque como
`precisa_validacao` toda conclusão que dependa de norma setorial (BACEN, SUSEP, ANATEL, MEC, ANS,
legislação trabalhista, LAI). Não cite norma setorial de memória sem conferir.

## Regras de segurança (valem em todos os modos)

1. **Nunca copie dado pessoal real** para achados, relatórios, prompts de subagentes ou mensagens.
   Cite `arquivo:linha`, nome do campo e tipo de dado. Em exemplos, use dados fictícios (CPF
   `000.000.000-00`, `cliente@example.com`, "Pessoa Exemplo").
2. **Não acesse produção.** Não consulte bancos reais, não chame APIs de produção, não baixe backups
   nem exportações. Se uma ferramenta devolver dados reais, use só metadados (contagens, nomes de
   campo, esquemas) e não tente reconstruir dados mascarados.
3. **Análise estática por padrão.** Não execute o código auditado. Se uma conclusão só puder ser
   confirmada executando, só execute com dados fictícios, sem rede externa, sem credenciais reais e
   num ambiente isolado que o usuário aprovou; sem isso, registre `precisa_validacao` com o plano de
   validação.
4. **Segredos** encontrados no código entram no relatório só pelo local e tipo, nunca pelo valor.
5. **Normas mudam.** [normas/referencias.md](normas/referencias.md) tem a situação e a data de
   verificação de cada norma. Antes de afirmar prazo, valor ou número de resolução, confira a versão
   vigente na fonte oficial (gov.br/anpd, planalto.gov.br, DOU) se tiver acesso à web; se não tiver,
   diga que não conferiu.

## Regras que mais se erram de memória

Confira cada uma antes de responder; a situação e a data de verificação estão em
[normas/referencias.md](normas/referencias.md).

- **Saúde e publicidade**: o art. 11, §4 veda compartilhar dado de saúde entre controladores para
  vantagem econômica, com exceções taxativas. Consentimento não está entre elas e não afasta a
  vedação.
- **Transferência para UE/EEE**: a Res. CD/ANPD nº 32/2026 reconheceu adequação (art. 33, I); não
  exige cláusulas-padrão. Para outros destinos, como os EUA, use outro mecanismo do art. 33, como as
  cláusulas-padrão da Res. 19/2024.
- **Art. 20**: o titular pode pedir revisão de decisão unicamente automatizada, mas a lei não exige
  que a revisão seja feita por pessoa natural (trecho vetado na Lei 13.853/2019).
- **RIPD**: não é obrigação geral. A ANPD pode exigi-lo (arts. 10, §3, e 38). Para avaliar alto
  risco, a referência normativa disponível é o critério cumulativo da Res. CD/ANPD nº 2/2022, art. 4,
  definido para fins daquele regulamento: um critério geral (larga escala ou afetar
  significativamente direitos) **e** um específico (tecnologia emergente, vigilância de área
  pública, decisão unicamente automatizada, dado sensível ou de criança, adolescente ou idoso).
- **Crianças e adolescentes**: o consentimento parental do art. 14, §1 é para **criança** (até 12
  anos incompletos). Pelo Enunciado CD/ANPD nº 1/2023, cabem as bases dos arts. 7 e 11, observado o
  melhor interesse.
- **Dado sensível**: o art. 11 não admite legítimo interesse, proteção do crédito nem "execução de
  contrato" (o art. 11, II, "d" é exercício regular de direitos, inclusive em contrato, que é outra
  coisa).
- **Tratamento como condição do serviço**: o art. 9, §3 admite que o **tratamento** seja condição
  para fornecer produto ou serviço, desde que o titular seja informado com destaque e sobre como
  exercer seus direitos. O dispositivo não fala em consentimento: se a base for consentimento,
  condicioná-lo põe em dúvida que ele seja livre (art. 5, XII), e a base costuma ser outra (ex.:
  execução de contrato, art. 7, V). Leve ao jurídico.
- **Encarregado**: o agente de pequeno porte pode ser dispensado de indicar encarregado, mas deve
  manter canal de comunicação com o titular (Res. CD/ANPD nº 2/2022, art. 11).
- **Art. 19**: os 15 dias são para a declaração completa de confirmação e acesso, não para
  eliminação ou outros direitos. Para pequeno porte (Res. 2/2022, arts. 14 e 15): 30 dias para a
  declaração completa, até 15 dias para a simplificada e prazo em dobro nos pedidos do art. 18.
- **Incidente** (Res. CD/ANPD nº 15/2024): 3 dias úteis do conhecimento de que o incidente afetou
  dados pessoais, para a ANPD e para os titulares; complementação em 20 dias úteis; em dobro para
  pequeno porte que possa usar o regime diferenciado. Mostre a data final, pulando fins de semana e
  feriados nacionais. O conteúdo mínimo tem 12 itens: veja [dpo/incidentes.md](dpo/incidentes.md).
- **Guarda legal**: não recomende eliminar dado com guarda obrigatória (fiscal, trabalhista,
  regulatória). Os "10 anos previdenciários" da Lei 8.212/1991 caíram com a Súmula Vinculante 8 do
  STF.

## Princípios

### Exija obrigação, dado e resultado

Para cada candidato, nomeie o **titular** (cliente, usuário, aluno, colaborador, candidato, cidadão,
paciente), o **dado** e sua categoria, a **operação** (coleta, armazenamento, uso, compartilhamento,
exposição, retenção), a **obrigação** violada (artigo, regulamento ou norma setorial) e o
**resultado** concreto. "Falta boa prática" não é achado.

### Separe o que o código prova do que só o controlador sabe

Código prova fluxo: o que é coletado, para onde vai, como é guardado, quem lê. Código não prova base
legal, finalidade declarada, contrato com operador, consentimento colhido fora do sistema, política
de retenção, porte do agente ou região do provedor. Quando o fato decisivo está fora do repositório,
use `precisa_validacao` com o fato exato e quem pode confirmá-lo. Não presuma presença nem ausência.

### Risco é sobre o titular, e não é critério de comunicação

O nível de risco mede o dano possível ao titular. Dado sensível, de criança, adolescente ou idoso,
financeiro, de autenticação, protegido por sigilo ou em larga escala aumenta o impacto. Isso **não**
equivale a dizer que o fato é um incidente comunicável: a comunicação à ANPD é decidida no playbook
de incidentes, com os critérios da Res. CD/ANPD nº 15/2024. Âncoras de nível em
[VALIDACAO-E-RELATORIO.md](VALIDACAO-E-RELATORIO.md). Só achados `confirmado` recebem nível.

### Recomende a menor correção eficaz

Para cada achado confirmado, diga qual invariante o sistema precisa garantir ("o evento enviado ao
pixel nunca contém o conteúdo do carrinho") e a mudança mínima no ponto certo, com teste de
regressão. Correção documental (aviso de privacidade, RoPA, contrato) vai em `acao_dpo`. A auditoria
descreve correções; não altera o código auditado sem pedido.

## Auditoria completa

Copie e acompanhe:

```
Auditoria LGPD:
- [ ] 1. Contexto mínimo e diretório de saída definidos
- [ ] 2. Reconhecimento: inventario-dados.md e unidades de cobertura
- [ ] 3. Caça por unidade e domínio (candidatos em JSON)
- [ ] 4. Verificação independente de cada candidato
- [ ] 5. achados.json gravado e validado
- [ ] 6. Revisão de cobertura (fluxos não examinados)
- [ ] 7. RELATORIO.md e PRECISA-VALIDACAO.md derivados do JSON
```

1. **Reconhecimento** — inventarie dados, fluxos, terceiros e unidades de cobertura com
   [RECONHECIMENTO.md](RECONHECIMENTO.md), que também diz quais domínios e setores carregar.
2. **Caça** — distribua as unidades entre agentes isolados (um por domínio ou subsistema), usando
   [CLASSES-DE-ACHADOS.md](CLASSES-DE-ACHADOS.md) e os arquivos de domínio e setor selecionados.
   Cada agente recebe só: as unidades atribuídas, o trecho relevante do mapa de dados, as classes do
   domínio, as regras de segurança e o formato de candidato de
   [VALIDACAO-E-RELATORIO.md](VALIDACAO-E-RELATORIO.md). Devolve JSON, não prosa.
3. **Verificação** — cada candidato vai a um agente novo, que não o caçou, com a tarefa de
   refutá-lo pelo código.
4. **Saída** — grave `achados.json` e valide:

   ```bash
   node <dir-da-skill>/scripts/validate-findings.cjs <saida>/achados.json
   ```

   Corrija e rode de novo até passar.
5. **Cobertura** — um revisor novo compara o mapa de dados com os achados e aponta fluxos não
   examinados. Examine-os ou registre como lacuna.
6. **Relatório** — gere `RELATORIO.md` e `PRECISA-VALIDACAO.md` a partir de `achados.json`.

**Sem agentes paralelos**, rode as mesmas fases em sequência e faça a verificação numa passada
separada, relendo cada trecho citado como se fosse de outra pessoa. Declare no relatório que a
verificação não foi independente.

**Perfis**: `rapido` (uma passada de caça, verificação por candidato, cobertura declarada como
parcial), `padrao` (o fluxo acima) e `profundo` (unidades por subsistema e por etapa do ciclo de
vida, revisão de cobertura até não sobrar fluxo). O perfil muda a amplitude, nunca o nível de
evidência.

**Saída**: diretório fora do repositório auditado (padrão `~/lgpd-audit/<repo>/run-<N>`), salvo
pedido explícito. Só o coordenador escreve os arquivos compartilhados.

Não termine no meio de uma fase. Os estados finais são: (a) relatório gravado e validador passando,
ou (b) execução marcada como incompleta, com o motivo e a lacuna no topo do relatório.

## Antipadrões

1. Listar artigos da LGPD como checklist e chamar cada ausência de "não conformidade".
2. Afirmar que falta base legal porque o código não a menciona. Base legal é decisão documentada:
   use `precisa_validacao`.
3. Tratar todo dado pessoal como sensível, ou dado sensível inferido (compra, rota, evento) como
   comum.
4. Propor consentimento como solução universal. Muitos tratamentos têm base melhor (obrigação legal,
   execução de contrato, tutela da saúde), e consentimento não afasta vedações legais, como a do
   art. 11, §4.
5. Copiar CPF, nome, telefone ou documento real para o relatório como "evidência".
6. Atribuir nível de risco a `precisa_validacao`, ou tratar nível alto como "incidente comunicável".
7. Dar nota, percentual ou selo de conformidade, declarar que a organização "está em conformidade",
   ou estimar valor de multa.
8. Confundir anonimização com pseudonimização: hash de CPF ou telefone sem segredo é reversível por
   força bruta e continua sendo dado pessoal.
9. Recomendar eliminação de dado que tem guarda legal obrigatória, ou retenção sem prazo de dado que
   não tem.
