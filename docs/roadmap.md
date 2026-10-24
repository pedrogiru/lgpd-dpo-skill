# Roadmap

O objetivo é ser a skill de LGPD mais confiável disponível, com qualidade **demonstrada**:
- evals reproduzíveis;
- comparação com outras skills;
- revisão jurídica identificada.

Ordem de prioridade: errata jurídica antes de funcionalidade, e eval antes de conteúdo novo.

## v0.2: avaliação séria e ferramentas

- **Evals que medem conclusões, não palavras:**
  - juiz cego por rubrica, além das regex;
  - 3 execuções por caso, com Haiku, Sonnet e Opus;
  - respostas brutas publicadas;
  - conjunto reservado, escrito por pessoas que não escrevem a skill;
  - condição 3: comparação com outras skills de LGPD.
- **Teste de ponta a ponta da auditoria completa** (seis fases, com e sem agentes paralelos).
- **Ferramentas:**
  - validador de cobertura (`cobertura.json`);
  - calculadora de prazos com feriados recebidos como entrada;
  - `normas.json` com verificação automática de datas e links oficiais no CI.
- Pacote `.zip` na release, para enviar a skill ao Claude.ai.

## v0.3: domínios que valem para todo setor

- Colaboradores e RH: ponto biométrico, atestados e CID, saúde ocupacional, recrutamento, eSocial.
- Crianças, adolescentes e ECA Digital.
- Biometria e identidade (selfie, reconhecimento facial, KYC).

## v0.4: setores

Financeiro, varejo e consumo, educação e setor público. Cada um entra com:
- normas setoriais com fonte oficial;
- classes verificáveis no código;
- guarda legal com fonte e data;
- pelo menos um eval.

Os demais setores ficam numa matriz até ganharem eval.

## v0.5: entregáveis de DPO

- Modelos: RoPA no formato da ANPD, RIPD, teste de legítimo interesse, registro e comunicação de
  incidente, respostas a titulares, DPA, resumo para diretoria.
- Modo sem código, por questionário.
- Relatório de auditoria gerado por script a partir de `achados.json`.

## v1.0

- Benchmark publicado contra outras skills, reproduzível por terceiros.
- Revisão jurídica identificada dos arquivos normativos e do gabarito.
- Testes em Claude Code, Codex, Cursor, Gemini CLI e OpenCode.

## Fora do escopo

- Nota, selo ou percentual de conformidade.
- Estimativa de multa.
- Varredura de sites ao vivo e acesso a painéis de terceiros.
- Tratar como obrigação norma ainda em consulta pública.
