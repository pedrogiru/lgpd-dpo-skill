# Evals da `lgpd-dpo` (v0.1)

> **Gabarito NÃO REVISADO por advogado ou DPO.** Ele foi escrito pela equipe da skill a partir do
> texto das normas (fontes em cada caso). Até haver revisão identificada, trate os resultados como
> preliminares. Erratas e contestações são bem-vindas, inclusive de mantenedores de outras skills.

Suíte para medir **acerto** e **falso positivo** de respostas sobre LGPD, com e sem skill. Foi feita
para servir de benchmark público: nenhum caso depende de formato, vocabulário ou campos internos da
`lgpd-dpo`. Qualquer bom relatório ou resposta de LGPD deveria passar.

Todos os dados das fixtures são fictícios: nenhuma empresa real, CPFs com dígito verificador
inválido (`111.222.333-00`) ou máscaras (`000.000.000-00`), e-mails `@example.com`. O
`score.cjs --check` confere isso.

## Conteúdo

| Arquivo | O que é |
|---|---|
| `evals.json` | Os casos (gerado; não edite à mão) |
| `gerar-evals.cjs` | Fonte dos casos, com as regex legíveis. Edite aqui e rode `node evals/gerar-evals.cjs` |
| `score.cjs` | Pontuação determinística (Node puro, sem dependências, sem rede) |
| `fixtures/varejo-checkout/` | E-commerce: CPF na URL, log do corpo do checkout, Meta CAPI com hash sem segredo, checkbox pré-marcado |
| `fixtures/rh-portal/` | RH: CID ao gestor, template biométrico sem controle de acesso e com base errada, currículos sem eliminação |
| `fixtures/fintech-kyc/` | Conta digital: exclusão de conta que apaga também KYC e transações |

Cada caso tem: `id`, `tipo` (`codigo` \| `dpo` \| `regressao`), `query` (o pedido, como um usuário
faria), `files` (fixture, relativa a `evals/`, ou `[]`), `expected_behavior` (frases para avaliação
humana), `deve_conter` e `nao_deve_conter` (regex JS), `armadilhas` (o que **não** deve virar achado
e por quê) e `fontes`.

### Casos

| id | tipo | Mede |
|---|---|---|
| `varejo-checkout` | codigo | 4 achados + 3 armadilhas (log mascarado, cookies de sessão/carrinho, HMAC com pepper) + CPF copiado no relatório |
| `rh-portal` | codigo | 3 achados (CID, biometria, currículos) + 2 armadilhas (ASO apto/inapto, guarda da folha) |
| `fintech-kyc-exclusao` | codigo | Eliminar só o que não tem guarda; manter KYC/transações restritos; prazo setorial a confirmar |
| `incidente-prazo` | dpo | 3 dias úteis, feriado de 20/11, vencimento 25/11/2026, dobro → 30/11 e ressalva de alto risco, 20 dias úteis, 5 anos, 12 incisos do art. 6º, §2º |
| `titular-eliminacao` | dpo | Eliminação parcial, art. 16, I, notas fiscais; não atribuir 15 dias de eliminação ao art. 19 |
| `reg-saude-anuncios-consentimento` | regressao | Consentimento não afasta a vedação do art. 11, §4º |
| `reg-transferencia-ue-eua` | regressao | UE adequada (Res. 32/2026, art. 33, I); EUA exigem mecanismo (Res. 19/2024) |
| `reg-art20-revisao-humana` | regressao | Revisão por pessoa natural foi vetada |
| `reg-ripd-alto-risco` | regressao | RIPD não é automático; critério cumulativo da Res. 2/2022, art. 4º |
| `reg-crianca-adolescente-consentimento` | regressao | Art. 14, §1º vale para criança; Enunciado CD/ANPD nº 1/2023 |
| `reg-protecao-credito-sensivel` | regressao | Proteção do crédito não é hipótese do art. 11 |
| `reg-previdenciario-10-anos` | regressao | 10 anos da Lei 8.212 superados (Súmula Vinculante 8) |
| `reg-pequeno-porte-encarregado` | regressao | Dispensa de encarregado com canal obrigatório (Res. 2/2022, art. 11) |
| `reg-consentimento-condicao` | regressao | Art. 9º, §3º: não há proibição absoluta de condicionar |
| `reg-sem-selo-sem-multa` | regressao | Não declarar conformidade nem estimar multa |

Além disso, **todo caso** reprova respostas que declarem a organização "em conformidade com a LGPD"
(sem negação) ou estimem valor de multa (`GLOBAIS` em `gerar-evals.cjs`).

## Método

Três condições, **mesmo modelo, mesma data, mesma versão do Claude Code e mesmas ferramentas**:

1. **sem skill** (linha de base);
2. **com `lgpd-dpo`** (registre a versão/commit);
3. **com cada outra skill de LGPD** (uma por vez, versão mais recente, registre o commit).

Modelos: Haiku, Sonnet e Opus (aliases `haiku`, `sonnet`, `opus` do `--model`; registre o nome
completo do modelo que respondeu). Respostas de LLM variam: rode cada caso **3 vezes** por
condição e reporte a taxa de PASS, não uma execução isolada.

Regras para não contaminar:

- Rode os casos de código numa **cópia** da fixture fora deste repositório, para o modelo não ler
  `evals.json` (o gabarito). Os casos `dpo` e `regressao` rodam num diretório vazio.
- Sem `CLAUDE.md`, memória ou outras skills de LGPD ativas além da que está sendo medida.
- A `query` vai exatamente como está no `evals.json`, sem dicas.
- Registre, em cada execução da condição 2 e 3, se a skill foi de fato acionada. Uma skill que não
  aciona sozinha é um resultado, não um erro do benchmark.

## Como rodar com Claude Code headless

As opções abaixo foram conferidas em `claude --help` (Claude Code 2.1.310, em 24/10/2026).
Confira de novo na sua versão.

- `-p` / `--print`: responde e sai. A pergunta pode ir por stdin.
- `--model <alias|nome>`.
- `--no-session-persistence`: não grava a sessão.
- `--output-format text|json|stream-json`: `stream-json` permite ver se a skill foi acionada.
- `--disable-slash-commands`: "Disable all skills and commands" (útil para a linha de base).
- `--safe-mode`: desliga customizações (CLAUDE.md, skills, plugins instalados, hooks, MCP...).
- `--tools`, `--allowedTools`, `--disallowedTools`: restringem ferramentas. Se restringir, use o
  mesmo conjunto nas três condições e garanta que a ferramenta que carrega skills continue
  disponível nas condições 2 e 3 (o nome dela varia por versão; confira).

**Instalar e desinstalar a skill.** Skills pessoais ficam em `~/.claude/skills/<nome>/` (é onde a
`lgpd-dpo` está instalada na máquina em que esta suíte foi escrita). Para a condição 2, a pasta
`~/.claude/skills/lgpd-dpo` deve existir; para as condições 1 e 3, mova-a para fora antes de rodar
e confira com uma pergunta de teste que ela não aparece. A forma mais simples e verificável de
garantir a linha de base é `--disable-slash-commands` **e** a skill desinstalada.

**Script pronto.** `evals/rodar.sh` faz tudo isso:
- copia a fixture para um diretório descartável;
- roda `claude -p` com `stream-json`;
- grava `<id>.md` (resposta), `<id>.jsonl` (transcrição) e `<id>.skill` (skills acionadas).

```bash
evals/rodar.sh sem sonnet respostas/sonnet-sem          # condição 1
evals/rodar.sh com sonnet respostas/sonnet-com          # condição 2
SKILL_DIR=/caminho/da/outra-skill evals/rodar.sh com sonnet respostas/sonnet-outra   # condição 3
node evals/score.cjs --all respostas/sonnet-com
```

**Leitura dos arquivos da skill.** Em `-p`, o agente só lê fora do diretório de trabalho o que
estiver em `--add-dir`. Sem isso, ele lê o `SKILL.md` mas tem a leitura dos arquivos de apoio
negada, como um usuário que negou a permissão. Na primeira rodada desta suíte, foi o que aconteceu.
O `rodar.sh` passa `--add-dir` com a pasta real da skill na condição `com`. Na condição 3, aponte
`SKILL_DIR` para a pasta da outra skill e instale só ela.

**Acionamento.** Confira o `<id>.skill` de cada caso. Skill que não foi acionada é falha da
description, não do conteúdo, e deve ser reportada como métrica própria.

Exemplo manual (bash), linha de base, um caso de regressão:

```bash
id=reg-art20-revisao-humana
mkdir -p respostas/sonnet-sem-skill
tmp=$(mktemp -d) && cd "$tmp"
node -e 'const c=require(process.argv[1]).find(x=>x.id===process.argv[2]);process.stdout.write(c.query)' \
  /caminho/para/evals/evals.json "$id" \
  | claude -p --model sonnet --no-session-persistence --disable-slash-commands \
  > /caminho/para/respostas/sonnet-sem-skill/$id.md
```

Caso de código (copie a fixture antes):

```bash
id=varejo-checkout
tmp=$(mktemp -d) && cp -R /caminho/para/evals/fixtures/varejo-checkout/. "$tmp" && cd "$tmp"
node -e '...mesma extração da query...' /caminho/para/evals/evals.json "$id" \
  | claude -p --model sonnet --no-session-persistence \
  > /caminho/para/respostas/sonnet-com-lgpd-dpo/$id.md
```

A cópia é descartável, então alterações feitas pelo agente não importam. Em `-p`, ações que pedem
aprovação podem ser negadas; se a skill gravar o relatório num arquivo em vez de respondê-lo, junte
esse arquivo à resposta salva. Na condição com skill, **não** use `--disable-slash-commands`.

## Como pontuar

```bash
node evals/score.cjs --check                                # valida evals.json e fixtures
node evals/score.cjs incidente-prazo resposta.md            # um caso
node evals/score.cjs --all respostas/sonnet-sem-skill       # todos (<id>.md)
node evals/score.cjs --all respostas/x --tipo regressao     # só um tipo
node evals/score.cjs --all respostas/x --json > x.json      # para consolidar
```

Saída: `PASS`/`FAIL` por caso, as regex de `deve_conter` que faltaram e as de `nao_deve_conter`
que casaram (com o trecho), e um resumo. Código de saída: 0 tudo passou; 1 algum caso falhou ou
faltou resposta; 2 erro de uso (caso inexistente, arquivo ausente).

Antes de comparar, o texto da resposta é normalizado: sem acentos, sem `*` de Markdown, sem o ponto
de abreviações (`art.`, `Res.`), e a busca ignora maiúsculas.

Métricas por condição:

- **acerto**: casos PASS e fração de `deve_conter` atendidos;
- **falso positivo**: violações de `nao_deve_conter` nos casos de código (armadilhas) e em geral;
- **avaliação humana** (amostra ou tudo), com `expected_behavior` e `armadilhas`: erro jurídico,
  dispositivo citado que não existe, dado pessoal copiado no relatório, achado sem evidência.

## Limitações

- **Regex é proxy.** Uma resposta pode citar o termo certo com a conclusão errada, ou acertar com
  outra redação. As regex foram calibradas com respostas boas e ruins escritas à mão e com algumas
  respostas reais de linha de base, mas vão errar. Leia os `FAIL` antes de concluir, e a avaliação
  humana prevalece sobre o score.
- A detecção de negação ("não exige", "nunca") é heurística, olha só a mesma frase e só português.
- Casos de código pontuam o relatório inteiro: um achado citado de passagem conta como achado.
- Poucos casos (15), um idioma, um país. Bom para regressão e comparação grosseira, não para
  ranking fino.
- O gabarito foi escrito por quem escreve a `lgpd-dpo` (conflito de interesse). Por isso ele é
  público, as fontes estão em cada caso e os mantenedores de outras skills podem contestar.
- **Gabarito não revisado por advogado.**
- **Sem conjunto reservado.** Os casos de regressão e a seção "Regras que mais se erram de memória"
  do `SKILL.md` saíram da mesma errata. A nota da `lgpd-dpo` nesses casos é otimista. Antes da v1.0:
  um conjunto reservado (*held-out*), escrito por pessoas que não escrevem a skill e mantido fora do
  repositório até a rodada de benchmark.

## Pontos pendentes ou a confirmar

Fatos usados no gabarito que foram conferidos apenas em fonte secundária, ou que são interpretação:

- **Res. CD/ANPD nº 32/2026**: texto conferido em compilação secundária (Legismap) e na versão em
  espanhol publicada no gov.br; o parágrafo único do art. 1º inclui os três países do EEE. Confirmar
  no DOU.
- **Enunciado CD/ANPD nº 1/2023**: conteúdo conferido só em fontes secundárias concordantes.
- **Circular BCB nº 3.978/2020, art. 67 (10 anos)**: não conferido no texto oficial. O caso
  `fintech-kyc-exclusao` só exige que o prazo seja tratado como algo a confirmar; não exige o número.
- **Contagem do prazo de incidente** excluindo o dia do conhecimento: a Res. 15/2024 não diz como
  contar; o gabarito usa a regra geral de exclusão do dia do começo (Lei 9.784/1999, art. 66, por
  analogia). Feriados estaduais e municipais não foram considerados.
- **Art. 9º, §3º**: há divergência sobre consentimento condicionado ser "livre". O caso só reprova a
  afirmação de proibição absoluta.
- Res. CFM nº 1.658/2002 (CID no atestado), NR-07 (ASO) e Lei 12.414/2011, art. 3º, §3º, II, estão
  só em `fontes`, não nas regex; conferir.

Conferidos no texto oficial (DOU ou planalto.gov.br) em 24/10/2026: Res. CD/ANPD nº 15/2024
(arts. 2º, 5º, 6º, 9º e 10), Res. CD/ANPD nº 2/2022 (arts. 2º a 16 do Anexo, com o art. 14, II, na
redação dada pela Res. 15/2024; a versão 0.1.0 deste gabarito usava a redação antiga, já corrigida), Lei 14.759/2023, LGPD
(arts. 9º, 11, 14, 16, 18, 19, 20, 33 e 38) e Lei 15.211/2025 (não altera o art. 14 da LGPD).

Casos previstos no plano e ainda não criados (próximas versões): edtech com menores, prefeitura
com portal da transparência, saúde com pixel de especialidade, RIPD como entregável de DPO,
prontuário com guarda legal e pequeno porte sem encarregado mas com canal (como armadilha de código).

## Resultados

Rodadas registradas em [RESULTADOS.md](RESULTADOS.md). Para novas rodadas, preencha uma linha por
modelo × condição, com taxa de PASS sobre 3 execuções por caso.

| Data | Claude Code | Modelo | Condição (skill@versão) | codigo (3) | dpo (2) | regressao (10) | deve_conter | violações nao_deve_conter | Erros jurídicos (humano) | Skill acionada |
|---|---|---|---|---|---|---|---|---|---|---|
| | | Haiku | sem skill | | | | | | | — |
| | | Haiku | lgpd-dpo@ | | | | | | | |
| | | Haiku | outra@ | | | | | | | |
| 2026-10-24 (n=1) | 2.1.310 | Sonnet | sem skill | 3/3 | 1/2 | 8/10 | 77/80 | 0 | não revisado | — |
| 2026-10-24 (n=1) | 2.1.310 | Sonnet | lgpd-dpo@0.1.0 | 3/3 | 2/2 | 9/10 | 79/80 | 0 | não revisado | 14/15 |
| 2026-10-24 (n=1) | 2.1.310 | Sonnet | lgpd-dpo@0.1.1 | 3/3 | 2/2 | 10/10 | 80/80 | 0 | não revisado | 14/15 |
| | | Sonnet | outra@ | | | | | | | |
| | | Opus | sem skill | | | | | | | — |
| | | Opus | lgpd-dpo@ | | | | | | | |
| | | Opus | outra@ | | | | | | | |
