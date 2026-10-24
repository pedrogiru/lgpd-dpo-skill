# Respostas brutas

Uma pasta por rodada, com uma subpasta por condição e um arquivo `<id-do-caso>.md` por resposta, como
o modelo a devolveu (texto final de `claude -p`). As fixtures e cenários são fictícios.

Para repontuar com o gabarito atual:

```bash
node evals/score.cjs --all evals/resultados/2026-10-24-sonnet/lgpd-dpo-0.1.1
node evals/score.cjs --all evals/resultados/2026-10-24-sonnet/sem-skill
```

Encontrou uma resposta pontuada errado (falso positivo ou falso negativo do gabarito)? Abra uma issue
citando o caso e o trecho.
