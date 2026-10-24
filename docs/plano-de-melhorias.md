# Plano de melhorias da `lgpd-dpo`

Data: 24/10/2026. Resultado de um conselho de quatro modelos (Claude Opus, Codex/GPT, Gemini e
MiniMax, cada um com um ângulo), de um comparativo com seis skills e ferramentas de LGPD que já
existem e de pesquisa na web. Este arquivo é a síntese.

**A skill será pública.** O objetivo é ser a melhor skill de LGPD que existe, e isso precisa ser
demonstrável, não autodeclarado. A seção "Skill pública" abaixo diz o que isso muda.

> **Situação (24/10/2026):** v0.1.0 publicada em https://github.com/pedrogiru/lgpd-dpo-skill.
> - A Fase 0 foi aplicada, com estas exceções: Lei 14.289/2022 em saúde e tabela de retenção completa
>   ficam para a v0.4.
> - Núcleo neutro e reorganização concluídos.
> - 15 evals e uma primeira rodada no Sonnet: 14/15 com a skill, 12/15 sem; ver
>   `evals/RESULTADOS.md`.
> - As referências `arquivo:linha` neste plano apontam para a estrutura antiga, anterior a
>   `skills/lgpd-dpo/`.

## Decisão

**Manter uma skill única, com divulgação progressiva, e transformá-la de "auditoria com viés de
saúde" em "LGPD para qualquer organização brasileira".** A ordem é:

1. corrigir os erros jurídicos;
2. tirar o setor do núcleo;
3. criar evals antes de acrescentar conteúdo;
4. só então ampliar setores, domínios e ferramentas.

O diferencial a preservar é o que nenhuma concorrente tem:
- separar o que o código prova do que só o controlador sabe (`precisa_validacao`);
- a verificação por quem não achou o problema;
- a saída validada por máquina.

## Skill pública: como ser a melhor de forma comprovável

1. **Benchmark público e reproduzível.**
   - Os mesmos evals (Fase 3) rodam em três condições, no mesmo modelo e na mesma data: sem skill,
     com a `lgpd-dpo` e com cada concorrente (goul4rt, lgpd-kit, lgpd-app, Sushegaad).
   - Mede-se: acerto, falso positivo, erro jurídico, citação de dispositivo inexistente e vazamento
     de dado pessoal no relatório.
   - Método, gabarito e resultados ficam em `evals/RESULTADOS.md`, com errata.
   - Para ser justo: usar a versão mais recente de cada concorrente, publicar os prompts e convidar
     os mantenedores a contestar.
   - Nenhuma concorrente compara contra as outras; isso vira o principal argumento.
2. **Revisão jurídica identificada.**
   - Pelo menos um advogado ou DPO revisa o gabarito dos evals e cada release dos arquivos
     normativos.
   - Os arquivos normativos levam "revisado por / em".
   - Nenhuma concorrente tem revisão jurídica declarada.
3. **Funciona em qualquer agente.**
   - Linguagem neutra no núcleo, como a da Cloudflare: "coordenador", "ferramenta de delegação",
     sem nomes de ferramentas de um produto específico.
   - Modo sequencial quando não houver subagentes, e funcionamento sem acesso à web.
   - Testar em Claude Code, Codex, Gemini CLI, Cursor e OpenCode.
   - Instalação por `npx skills add` e por marketplace de plugin do Claude Code.
4. **Segura para quem instala.**
   - Scripts em Node puro, sem dependências, sem rede e sem telemetria.
   - Nada executa código do projeto auditado por padrão.
   - Releases com tag, `SECURITY.md` e testes para todos os scripts.
5. **Sem dado ou marca de ninguém.**
   - Exemplos e fixtures 100% fictícios, sem nome de empresa real.
   - CPFs de teste com dígito verificador inválido, ou na lista de valores fictícios do validador.
6. **Documentação de projeto sério.**
   - README em pt-BR com resumo em inglês, para quem procura "Brazil LGPD" lá fora.
   - Exemplo de relatório gerado a partir de uma fixture.
   - FAQ ("isto não é parecer jurídico").
   - `CHANGELOG.md` com versionamento semântico, `CONTRIBUTING.md` e `CODE_OF_CONDUCT.md`.
   - Modelos de issue: errata normativa, falso positivo e novo setor.
   - Licença MIT.
7. **Manutenção normativa como processo.**
   - Ação agendada no CI (mensal) roda `check-normas` e abre issue quando uma verificação vence ou
     um link oficial quebra.
   - As notas de release listam as normas novas.
8. **Nome e descoberta.**
   - `lgpd-dpo` não colide com as existentes (`lgpd-audit`, `lgpd-check`, `lgpd-kit`, `lgpd`).
   - A description deve ter os termos que as pessoas buscam: LGPD, ANPD, DPO, encarregado, RIPD,
     RoPA, privacidade, dados pessoais, Brasil.
9. **Comunidade.**
   - PRs de errata nas concorrentes, como cortesia técnica.
   - Divulgação em comunidades de DPOs e de privacidade.
   - Convite a contribuições setoriais, cada uma com revisor do setor.

## Consenso do conselho

- **Uma skill, não 18.** Todos rejeitaram o modelo de uma skill coordenadora com sub-skills, usado
  pela goul4rt (18) e pela lgpd-kit (14). Cada sub-skill injeta sua description em toda sessão,
  elas competem pelo acionamento, a delegação entre skills não é garantida e as regras (vereditos,
  proibição de copiar dados pessoais) teriam de ser repetidas e iriam divergir. Setores e domínios
  entram como arquivos linkados direto do `SKILL.md`.
- **Corrigir o direito antes de crescer.** Os quatro acharam erros no texto atual; os principais
  coincidem (lista na Fase 0).
- **Cobertura verificável, mas leve.** Um `cobertura.json` com validador de 60 a 200 linhas, não o
  ledger de 872 linhas da Cloudflare.
- **Evals são a maior lacuna.** Hoje há zero; a boa prática da Anthropic pede pelo menos três, com
  linha de base sem a skill e testes em Haiku, Sonnet e Opus.
- **Nunca dar nota, selo de conformidade nem valor de multa.**

## Divergências e como resolvi

| Tema | Posições | Decisão |
|---|---|---|
| Profundidade setorial | Gemini: dois arquivos grandes com normas de todos os setores. Opus: um arquivo por setor, cada um com eval. MiniMax: uma matriz única para não virar biblioteca. | **Matriz `setores/INDICE.md`** (setor, dados típicos, normas que cruzam com a LGPD, retenção, regulador, classes de código) **+ arquivo próprio só para o setor que tiver classes verificáveis no código e um eval aprovado.** Começar por trabalho e RH, financeiro, educação, setor público e saúde. |
| Campo `enquadramento_dosimetria` | MiniMax: remover, porque o art. 52, §1 tem critérios (boa-fé, cooperação) que o código não mostra. Os outros não comentaram. | **Remover.** |
| Nível `informativo` | Opus e MiniMax: contradiz a regra de que achado viola uma obrigação. | **Virar `observacao`, sem nível de risco.** |
| Dividir em skill de código e skill de DPO | MiniMax: não agora; dividir só se os evals mostrarem uso de DPO quase sempre sem repositório. | **Não dividir.** Reavaliar com dados dos evals. |
| Sandbox | MiniMax: dependência frágil da `security-audit`, sendo que a auditoria de privacidade é quase toda estática. | **Declarar "análise estática por padrão"** e escrever na própria skill a regra mínima para quando precisar executar. |

Afirmações do conselho que conferi e **descartei**:
- O MiniMax disse que a ANPD não fiscaliza o ECA Digital. Na verdade, o Decreto 12.622/2025 a
  designa como a autoridade autônoma prevista na lei.
- O MiniMax também disse que a Lei 15.352/2026 criou o dever de o operador indicar encarregado. A
  redação "indicada pelo controlador e operador" já vem da Lei 13.853/2019.

## Fase 0: errata jurídica (P0, esforço pequeno)

Cada item vira também um caso de teste de regressão (ver Fase 3).

1. **Art. 11, §4 — consentimento não afasta a vedação.** `TERCEIROS-RASTREAMENTO-E-IA.md:31` diz
   que a "única hipótese plausível seria consentimento". O §4 é vedação com exceções taxativas
   (serviços de saúde, assistência farmacêutica e à saúde, inclusive diagnose e terapia, em
   benefício do titular; portabilidade pedida pelo titular; transações financeiras e
   administrativas do próprio serviço). Reescrever; se alguém alegar consentimento, o achado vira
   `precisa_validacao` para o jurídico. Completar `SAUDE.md` com "diagnose e terapia". (Todos)
2. **Adequação da UE.** A Res. CD/ANPD nº 32/2026 (26/01/2026) reconhece UE e EEE como adequados
   (art. 33, I). Cláusulas-padrão da Res. 19/2024 continuam valendo para destinos sem adequação,
   como os EUA. Corrigir `DPO-FORNECEDORES-E-CONTRATOS.md`, `TERCEIROS-RASTREAMENTO-E-IA.md` e
   `REFERENCIAS-NORMATIVAS.md`. (Codex, Opus, Gemini; conferido na web)
3. **RIPD e alto risco.** Usar a regra cumulativa da Res. 2/2022, art. 4: pelo menos um critério
   geral (larga escala ou afetar significativamente direitos) **e** um específico (tecnologia
   emergente, vigilância de área pública, decisão unicamente automatizada, dado sensível ou de
   criança, adolescente ou idoso). Não apresentar RIPD como obrigação automática. (Opus, Codex,
   Gemini)
4. **Prazo de 15 dias.** Vale só para a declaração completa de confirmação ou acesso (art. 19, II).
   Os demais direitos seguem o art. 18, §§ 3 a 5, e o regulamento de direitos dos titulares em
   consulta. Ajustar a tabela de `DPO-TITULARES.md` linha a linha. (Opus, Codex)
5. **Canal do encarregado.** O agente de pequeno porte pode ser dispensado de indicar encarregado,
   mas deve manter canal com o titular (Res. 2/2022, art. 11). A ausência de página no repositório
   é `precisa_validacao`, não achado. Incluir a Res. 18/2024. (Codex, Opus)
6. **Consentimento como condição.** O art. 9, §3 permite condicionar o serviço ao consentimento se
   o titular for informado com destaque. O achado está na falta de destaque ou no uso de
   consentimento onde cabia outra base. (Opus)
7. **Art. 20.** A revisão não precisa ser feita por pessoa natural (trecho vetado na Lei
   13.853/2019). Não apresentar "revisão humana" como obrigação legal. (Opus, Gemini)
8. **Crianças, adolescentes e idosos.** O consentimento parental do art. 14, §1 vale para
   **criança** (até 12 anos incompletos). Citar o Enunciado CD/ANPD nº 1/2023. Incluir `idoso` nas
   categorias, porque a Res. 15/2024 o trata como agravante. Tratar menores também como titulares
   principais (alunos, jogadores), não só como dependentes. (Opus, Gemini)
9. **Pseudonimização.** Está definida no art. 13, §4, não no art. 5, III. (Opus)
10. **Base legal de autenticação.** `RECONHECIMENTO.md:37` põe "segurança (art. 46)" como base
    legal. O art. 46 é dever de segurança. Usar art. 7 (V ou IX) para credenciais comuns e
    art. 11, II, "g" para biometria antifraude. (Gemini)
11. **Severidade não é critério de comunicação.** `SKILL.md:82` reaproveita os critérios de "risco
    ou dano relevante" da Res. 15/2024 como régua de nível. Esse é o gatilho de comunicação de
    incidente. Separar as duas coisas para o relatório não parecer dizer que o achado é
    comunicável. (MiniMax)
12. **Conteúdo mínimo da comunicação à ANPD.** Faltam: identificação do operador, causa
    principal, total de titulares das atividades afetadas e declaração de agente de pequeno porte.
    Conferir no art. 6 da Res. 15/2024. (Opus)
13. **Remover `enquadramento_dosimetria`** do schema e do relatório (ver divergências).
14. **Prontuário eletrônico.** Citar a Res. CFM 1.821/2007 com aviso de "confirme"; a interação com
    a Lei 13.787/2018 é controversa. (Opus)

## Fase 1: multissetorial (P0, esforço médio)

- **Núcleo neutro.** Tirar "paciente" e os exemplos de saúde de `SKILL.md`, da description, dos
  antipadrões e dos playbooks de DPO. Os exemplos passam a variar (cliente, aluno, colaborador,
  cidadão). Critério de pronto: `grep -ri paciente` só encontra resultados em `setores/saude.md`.
- **Dicionário de campos multissetorial** em `RECONHECIMENTO.md`, com campos de vários setores:
  - RH: `aso`, `ctps`, `ponto`, `sindicato`, `cid_atestado`;
  - financeiro: `chave_pix`, `scr`, `pep`, `renda`;
  - telecom: `imei`, `imsi`, `cdr`, `erb`;
  - educação: `ra`, `inep`, `historico_escolar`;
  - condomínio e imobiliário: `visitante`, `placa`, `unidade`;
  - setor público: `nis`, `cad_unico`.
- **Seletor de setor por sinais** (ideia da lgpd-kit): na fase 1, sinais no código (campos,
  dependências, rotas) e uma entrevista curta escolhem os arquivos de setor e domínio.
- **Entrevista inicial** de até 4 perguntas: papel (controlador ou operador), porte (pequeno porte
  ou não), setor e objetivo. Só quando o contexto não responder.
- **Domínios transversais**, que valem para todos os setores e têm o maior retorno:
  - `dominios/terceiros-e-rastreamento.md` (já existe; tirar IA de dentro);
  - `dominios/ia-e-decisoes-automatizadas.md` (art. 20, LLMs, embeddings, tracing de prompt);
  - `dominios/colaboradores-e-rh.md`:
    - ponto biométrico, com base no art. 11, II, "a" ou "g", e nunca execução de contrato;
    - CID em atestado, ASO e PCMSO com guarda de 20 anos e acesso restrito;
    - recrutamento, eSocial e desconto sindical;
  - `dominios/criancas-e-adolescentes.md`, com regras do ECA Digital verificáveis no código:
    - privacidade máxima por padrão;
    - vedação de perfilamento para publicidade;
    - dado de verificação de idade usado só para isso;
    - vinculação a responsável abaixo de 16 anos;
    - caixas de recompensa (*loot boxes*).
    Cada regra ganha o artigo depois de conferido no texto da lei;
  - `dominios/biometria-e-identidade.md` (selfie, reconhecimento facial em portaria, KYC).
- **Matriz `setores/INDICE.md`** e, nesta ordem, arquivos para:
  1. `financeiro.md` (sigilo bancário LC 105/2001, Res. CMN 4.893/2021, Open Finance, PLD/KYC);
  2. `varejo-e-consumo.md` (CDC art. 43, cadastro positivo, telemarketing, CPF no caixa);
  3. `educacao.md` (acervo acadêmico, menores como titulares, Lei 14.289/2022);
  4. `setor-publico.md` (arts. 23 a 32, LAI, Decreto 10.046/2019, Lei 14.129/2021);
  5. `saude.md` (o atual `SAUDE.md`, mais Lei 14.289/2022 e normas da Anvisa).

  Seguros, telecom, condomínios e imobiliário ficam só na matriz até ganharem eval.
- **Incidente com reguladores setoriais**: matriz de comunicações paralelas (ANPD, BCB, SUSEP,
  ANATEL, CTIR Gov), com cada prazo marcado "confirmar" até revisão.
- **Tabela de retenção multissetorial** com fonte e data em cada linha, e a regra "sem data, não
  use":
  - Marco Civil: 6 meses para registros de aplicação, 1 ano para registros de conexão;
  - tributário: 5 anos (com o alerta da Súmula Vinculante 8, que derruba os 10 anos da Lei 8.212);
  - trabalhista;
  - ASO, PPP e LTCAT;
  - PLD/KYC;
  - negativação;
  - acervo acadêmico;
  - prontuário.

## Fase 2: ferramentas determinísticas (P1, esforço médio)

Todas em Node puro (`scripts/*.cjs`), sem dependências, executadas pelo modelo e nunca lidas por ele.

| Script | O que faz | Por quê |
|---|---|---|
| `validate-findings.cjs` (endurecer) | Trata JSON malformado sem exceção; detecta CPF sem máscara com dígito verificador, CNPJ, CNS e telefone fixo; examina **todas** as ocorrências; confere artigos contra uma tabela de dispositivos válidos ("LGPD art. 70" reprova); exige ligação com uma unidade de cobertura; aceita `origem: fora_do_repositorio` no fluxo de `precisa_validacao` (GTM só no painel, contrato) | Pega alucinação jurídica e vazamento de forma determinística; corrige a contradição entre schema e skill apontada pelo Opus |
| `validate-coverage.cjs` + `cobertura.schema.json` | IDs únicos, estados válidos, toda unidade fechada, lacuna com motivo, todo fingerprint ligado a uma unidade, sem alegação de cobertura completa com pendências | Torna a cobertura auditável |
| `scan-pistas.cjs` | Varredura local e opcional de identificadores brasileiros (com dígito verificador), SDKs, pixels, CAPI, GTM, LLMs e ferramentas de observabilidade de prompts. Reporta tipo, arquivo, linha e confiança, **nunca o valor** | Acelera a fase 1. A pista é candidata a exame, nunca achado |
| `extract-inventory.cjs` | Inventário inicial a partir de Prisma, migrations SQL, OpenAPI e GraphQL; campos jurídicos ficam `[A PREENCHER]` | Base do RoPA |
| `generate-ropa.cjs` | RoPA por processo, exportável no modelo simplificado da ANPD para pequeno porte | Entregável que o DPO usa |
| `prazos.cjs` | Dias úteis a partir do marco (incidente: 3 + 20; dobro para pequeno porte) e 15 dias corridos do art. 19; feriados entram como arquivo, nunca embutidos no código; mostra marco, regra, vencimento e fonte | Contar dias úteis à mão é erro clássico |
| `render-report.cjs` | Gera tabelas, contagens e `PRECISA-VALIDACAO.md` a partir do JSON; o modelo escreve só o resumo executivo | Prosa e JSON deixam de divergir |
| `lint-report.cjs` | Reprova frases proibidas ("em conformidade", "cumpre a LGPD", "multa de", "não há risco", "comunicável"), exige as seções obrigatórias e confere se a contagem bate com o JSON | Combate a falsa sensação de conformidade |
| `check-normas.cjs` + `normas/normas.json` | Cada norma tem id, status (vigente, em consulta, fonte secundária), URL oficial e `verificado_em`; avisa quando a verificação passa de 180 dias | Normas mudam; tira datas do corpo da skill |

## Fase 3: evals (P0 em paralelo com a Fase 1; esforço médio a grande)

- `evals/evals.json` no formato da Anthropic (query, arquivos, comportamento esperado), com 8 a 10
  casos e repositórios-fixture pequenos:
  - varejo com pixel e CPF no checkout;
  - RH com API que devolve CID ao gestor;
  - fintech com KYC e pedido de exclusão (a resposta certa é **não** apagar dentro da guarda
    legal);
  - edtech com menores;
  - prefeitura com portal da transparência expondo CPF completo;
  - saúde com pixel de especialidade;
  - DPO sem código: incidente com contagem de prazo, pedido de eliminação, RIPD.
- **Armadilhas negativas**, para medir falso positivo:
  - log com máscara;
  - hash com segredo (pepper);
  - cookie estritamente necessário;
  - prontuário com guarda legal;
  - pequeno porte sem encarregado mas com canal.
- **Regressão normativa**: os 14 itens da Fase 0 e os erros encontrados nas outras skills viram
  casos. Exemplos: "consentimento legaliza pixel de saúde", "10 anos previdenciários pela Lei
  8.212", "revisão por pessoa natural", "proteção do crédito como base para dado sensível".
- Rodar com e sem a skill em Haiku, Sonnet e Opus, medindo acerto e falso positivo. Método inspirado
  no benchmark da coleção Sushegaad (com e sem skill, asserções verificáveis por caso). Corrigir a
  fragilidade dele com gabarito revisado por um DPO ou advogado.
- CI: `node --test`, validadores, evals determinísticos (verificação por grep e JSON) e
  `check-normas`.

## Fase 4: entregáveis de DPO e diretoria (P1, esforço médio)

- **Modo manual nos playbooks**, para o DPO que não é desenvolvedor: questionário de 8 a 12
  perguntas que gera o documento.
- **Pasta `modelos/`**:
  - RoPA no modelo da ANPD;
  - RIPD;
  - teste de legítimo interesse;
  - registro de incidente;
  - comunicação à ANPD e aos titulares;
  - respostas a titulares;
  - DPA;
  - resumo para diretoria;
  - plano 30/60/90.
  Campos jurídicos sempre como `[A PREENCHER: quem]`.
- **`dpo/encarregado-e-governanca.md`**:
  - Res. 18/2024;
  - pequeno porte (Res. 2/2022, inclusive startups da LC 182/2021, a confirmar);
  - programa de governança (art. 50);
  - calendário de revisões;
  - SLA de titulares e registro de incidentes.
- **`dpo/aviso-e-cookies.md`**, separado de fornecedores: banner com "rejeitar" na primeira camada,
  com o mesmo destaque que "aceitar", e comparação do aviso com o mapa de dados.
- **Checklists copiáveis** em fluxos longos: triagem de incidente, due diligence e atendimento a
  titular.
- **Regra para o modo orientação**: não responder sim ou não a uma pergunta jurídica. Listar as
  hipóteses, dizer o que depende do controlador e quando levar ao jurídico.

## Fase 5: forma e manutenção (P1/P2, esforço pequeno)

- Índice no topo de todo arquivo com mais de 100 linhas.
- Terminologia única:
  - `veredito` em todo lugar (hoje o verificador devolve `decisao`);
  - "achado" para o registro final e "candidato" antes da verificação;
  - "setor" para ramo de atividade e "domínio" para tema transversal.
- Teto de agentes por perfil e contagem de unidades no relatório.
- Perfil `diff` (escopo = PR) e reaproveitamento de execuções anteriores pelo fingerprint.
- LINDDUN como lente opcional do revisor de cobertura, sem criar vocabulário novo de saída.
- `STATUS.md` no diretório de saída (nunca no repositório auditado) para retomar uma execução.
- Licença (sugestão: MIT, como as concorrentes), `CONTRIBUTING.md` com a regra "toda norma nova
  entra com fonte oficial, data e eval".

## O que não fazer

- Quebrar em várias skills ou gravar `.lgpd/` dentro do repositório auditado.
- Portar o ledger de 872 linhas, as ondas de revisores e o isolamento por descritor de arquivo da
  Cloudflare.
- Dar nota, percentual de conformidade, selo, valor de multa ou "exposição em R$".
- Tratar como obrigação o que ainda está em consulta: regulamentos de IA, biometria, RIPD,
  dosimetria e fiscalização com medidas cautelares, e aferição etária do ECA Digital.
- Pôr no corpo da skill datas de consulta pública, números de processos ou estatísticas da ANPD.
- Criar setor sem eval, ou tabela de retenção sem fonte e data.
- Reimplementar Bearer, HoundDog ou Fides; no máximo, apontar para eles.
- Instalar dependências; manter Node puro.

## Reaproveitar e contribuir

- **lgpd-kit** (Gabriel-Oliveir4, MIT, a mais sólida juridicamente e atualizada em 21/10/2026):
  - estudar o catálogo de 55 requisitos (vira a matriz requisito → artigo → arquivo:linha, gerada
    do `achados.json`);
  - estudar o modo de verificação rápida com semáforo;
  - estudar os scripts de anonimização com risco medido (k-anonimato).
  É a melhor candidata a parceria.
- **goul4rt/lgpd-skills** (MIT): modelos de comunicação à ANPD e aos titulares, de teste de
  legítimo interesse e de DPA, como ponto de partida, **reescritos e revisados**. Ela tem erros (10
  anos previdenciários, larga escala com número inventado, consulta prévia que não existe no
  art. 38).
- **lgpd-app/skills** (Apache-2.0): a ideia de um schema legível por máquina e a checagem de dark
  patterns no banner.
- **Sushegaad** (MIT): o método de eval com e sem skill e o teste de "data de verificação vencida".
- Abrir PRs de errata nas concorrentes com os erros encontrados. É contribuição para o ecossistema
  e dá visibilidade à nossa.

## Estrutura final

```text
lgpd-dpo/
├── SKILL.md                      # modos, regras, princípios, fases, tabelas de setores/domínios/DPO
├── README.md  CONTRIBUTING.md  LICENSE  SECURITY.md  CHANGELOG.md  CODE_OF_CONDUCT.md
├── .github/                      # CI (testes, evals determinísticos, check-normas mensal), modelos de issue
├── .claude-plugin/               # manifesto de marketplace
├── RECONHECIMENTO.md             # mapa de dados, dicionário multissetorial, seletor, cobertura
├── CLASSES-DE-ACHADOS.md         # catálogo por obrigação, com índice
├── VALIDACAO-E-RELATORIO.md
├── dominios/
│   ├── terceiros-e-rastreamento.md
│   ├── ia-e-decisoes-automatizadas.md
│   ├── colaboradores-e-rh.md
│   ├── criancas-e-adolescentes.md
│   └── biometria-e-identidade.md
├── setores/
│   ├── INDICE.md                 # matriz de todos os setores
│   ├── _MOLDE.md
│   ├── financeiro.md  varejo-e-consumo.md  educacao.md  setor-publico.md  saude.md
├── dpo/
│   ├── inventario-e-ripd.md  incidentes.md  titulares.md
│   ├── fornecedores-e-transferencia.md  aviso-e-cookies.md  encarregado-e-governanca.md
├── modelos/                      # ropa, ripd, lia, incidente, comunicacoes, titular, dpa, diretoria
├── normas/
│   ├── REFERENCIAS-NORMATIVAS.md # com seção "Histórico"
│   ├── normas.json
│   └── retencao.md               # tabela com fonte e data por linha
├── schemas/                      # achados, cobertura
├── scripts/                      # validate-findings, validate-coverage, scan-pistas, extract-inventory,
│                                 # generate-ropa, prazos, render-report, lint-report, check-normas
├── tests/
└── evals/                        # evals.json + fixtures/ (varejo, rh, fintech, edtech, prefeitura, saude, negativos)
```

## Ordem de execução sugerida

Nada vai a público antes da errata e dos primeiros evals: uma skill de LGPD pública com erro
jurídico perde credibilidade de saída.

| Release | Conteúdo | Resultado verificável |
|---|---|---|
| — | Decisões de publicação: dono do repositório, revisor jurídico, licença | registradas no README |
| **v0.1** (primeira pública) | Fase 0 completa; núcleo neutro e agnóstico de agente; reorganização de pastas; 3 primeiros evals (varejo, RH, incidente) + armadilhas + regressão normativa; README, LICENSE, CONTRIBUTING, SECURITY, CHANGELOG; CI com testes | `grep paciente` limpo; linha de base com e sem skill publicada; instalável com `npx skills add` |
| v0.2 | Validador endurecido, cobertura, `prazos.cjs`, `normas.json` + `check-normas` no CI agendado | `node --test` cobre os casos novos; ação mensal ativa |
| v0.3 | Domínios transversais (RH, crianças, IA, biometria) + `setores/INDICE.md` | um eval por domínio |
| v0.4 | Setores financeiro, varejo, educação, setor público, cada um com eval | eval do setor aprovado antes do merge |
| v0.5 | Modelos, modo manual de DPO, render/lint do relatório, scanner e inventário | DPO sem repositório produz RoPA e resposta a titular |
| **v1.0** | Benchmark contra as concorrentes publicado, revisão jurídica identificada, testes nos 5 agentes, PRs de errata nas concorrentes | `evals/RESULTADOS.md` reproduzível por terceiros |

## Pendências de verificação jurídica

Confirmar no texto oficial (DOU, planalto.gov.br, gov.br/anpd) e, de preferência, com advogado,
antes de escrever na skill:

- Res. CD/ANPD nº 32/2026 (só fontes secundárias, todas concordantes).
- Res. 15/2024, art. 6 (campos da comunicação) e art. 10 (registro por 5 anos).
- Prazos setoriais de comunicação de incidente: SUSEP (Circular 638/2021, "5 dias úteis" segundo o
  Gemini), BCB (Res. CMN 4.893/2021, Res. BCB 85/2021), ANATEL (Res. 740/2020).
- Circular BCB 3.978/2020, art. 67 (guarda de 10 anos), NR-07 item 7.5.19 (20 anos), Portarias MEC
  sobre acervo acadêmico, Lei 14.289/2022.
- Artigos do ECA Digital (Lei 15.211/2025) citados pelo Gemini e pelo MiniMax (arts. 9, 12, 13, 17,
  20, 22, 24, 26), que divergem entre si em alguns números.
- Situação das consultas da ANPD: direitos dos titulares, anonimização e pseudonimização,
  dosimetria e fiscalização.
- Res. 2/2022 e startups (LC 182/2021).

## Fontes principais

- Boas práticas de skills da Anthropic: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- Cloudflare security-audit-skill: https://github.com/cloudflare/security-audit-skill
- Skills de LGPD analisadas: https://github.com/goul4rt/lgpd-skills,
  https://github.com/Gabriel-Oliveir4/LGPD-Skills, https://github.com/lgpd-app/skills,
  https://github.com/Sushegaad/Claude-Skills-Governance-Risk-and-Compliance,
  https://github.com/mukul975/privacy-data-protection-skills
- Adequação Brasil–UE (Res. 32/2026): https://www.bakermckenzie.com/en/insight/publications/2026/01/brazil-and-european-union-mutual-data-protection-adequacy-decision
- Decreto 12.622/2025 (ANPD e ECA Digital): https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/Decreto/D12622.htm
- Lei 15.352/2026: https://www2.camara.leg.br/legin/fed/lei/2026/lei-15352-25-fevereiro-2026-798731-norma-pl.html
- LGPD compilada: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
