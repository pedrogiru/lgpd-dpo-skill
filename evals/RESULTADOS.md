# Resultados

Método e limitações em [README.md](README.md). Leia as ressalvas antes de citar estes números.

## 2026-10-24 — primeira rodada (v0.1, pré-lançamento)

Claude Code 2.1.310, modelo Sonnet, **uma execução por caso** (n=1), gabarito automático (regex)
**não revisado por advogado**.

| Condição | Casos PASS | código (3) | dpo (2) | regressão (10) | deve_conter | violações | Skill acionada |
|---|---|---|---|---|---|---|---|
| Sem skill | 12/15 | 3/3 | 1/2 | 8/10 | 77/80 | 0 | — |
| lgpd-dpo@0.1.0 | 14/15 | 3/3 | 2/2 | 9/10 | 79/80 | 0 | 14/15 |

Onde a linha de base falhou e a skill acertou:
- **`incidente-prazo`**: omitiu "medidas antes e depois do incidente", um dos 12 itens da
  comunicação (Res. CD/ANPD nº 15/2024, art. 6, §2, III).
- **`reg-transferencia-ue-eua`**: não conhecia a adequação da UE (Res. CD/ANPD nº 32/2026).
- **`reg-pequeno-porte-encarregado`**: não citou o fundamento da dispensa com canal ao titular (Res.
  2/2022, art. 11).

Onde a skill falhou: **`reg-ripd-alto-risco`** acertou o critério de alto risco, mas não citou o
art. 38 da LGPD. Em `reg-previdenciario-10-anos`, a skill não foi acionada e a resposta passou mesmo
assim.

## O que mudou durante a rodada

A primeira execução deu **7/15 com a skill contra 9/15 sem**. As causas encontradas e corrigidas:
1. **Leitura negada.** Em `-p`, o agente não tinha permissão para ler os arquivos de apoio fora do
   diretório de trabalho: leu o `SKILL.md` e respondeu o resto de memória. O `rodar.sh` passou a usar
   `--add-dir` com a pasta da skill.
2. **Acionamento em 8/15.** Em perguntas jurídicas curtas, o modelo respondia sem acionar a skill.
   A description ficou mais diretiva e o acionamento subiu para 14–15/15.
3. **Gabarito.** Uma regex não aceitava "execução de contrato", outra reprovava uma resposta correta
   sobre criança e adolescente, e a máscara "correta" de uma fixture deixava 6 dígitos do CPF
   visíveis. Os três foram corrigidos. As respostas da linha de base foram repontuadas com o
   gabarito atual.
4. **Erro jurídico que o gabarito não pegava.** Uma resposta listou "execução de contrato" entre as
   hipóteses do art. 11. O gabarito passou a reprovar isso, e o `SKILL.md` ganhou a regra.

## Ressalvas

- **Otimista para a skill.** Os casos de regressão e a seção "Regras que mais se erram de memória"
  do `SKILL.md` saíram da mesma errata, e a skill foi ajustada depois de ver os resultados. Falta um
  conjunto reservado, escrito por terceiros.
- **n=1 por caso e um modelo só.** Faltam 3 execuções por caso, Haiku e Opus, e a condição 3 (outras
  skills de LGPD).
- **Sonnet já sabe muito de LGPD.** A linha de base acerta 12/15. Para separar as skills, são
  necessários casos mais difíceis (normas recentes, setores regulados, armadilhas de falso positivo)
  e avaliação humana da qualidade do relatório, não só regex.
- As respostas brutas não estão no repositório: podem conter trechos das fixtures, que são
  fictícias, e ocupam espaço. Reproduza com `evals/rodar.sh`.
