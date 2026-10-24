# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versões seguem
[SemVer](https://semver.org/lang/pt-BR/). Mudanças normativas são listadas à parte em cada versão.

## [0.1.1] — 2026-10-24

Correções apontadas por uma avaliação independente da v0.1.0.

### Normativo
- **Corrigido**: a exceção ao prazo em dobro do pequeno porte em incidentes com risco à integridade
  física ou moral foi revogada (Res. CD/ANPD nº 15/2024, art. 2º, que deu nova redação ao art. 14,
  II, da Res. 2/2022). Saiu do playbook de incidentes, do exemplo publicado e do gabarito.
- **Corrigido**: art. 9º, §3º trata do *tratamento* como condição do serviço, não do consentimento.
- **Adicionado**: prazos do pequeno porte para titulares (Res. 2/2022, arts. 14, I e III, e 15).
- **Adicionado**: exclusões da adequação da UE (segurança pública, defesa, persecução penal);
  MP 1.317/2025 no histórico; Lei 15.352/2026 marcada como vigente pelo texto compilado.
- Oposição (art. 18, §2) depende de descumprimento da lei; hipóteses que afastam a comunicação de
  incidente marcadas como interpretação; critério de alto risco da Res. 2/2022 apresentado como
  referência.

### Evals
- Armadilhas novas: esperar a investigação para comunicar, exceção revogada do art. 14, leitura
  errada do art. 9º, §3º.
- `rodar.sh` registra o código de saída de cada caso e avisa falhas.
- Respostas brutas da rodada publicadas.

### Documentação
- Plano interno substituído por `docs/roadmap.md`; exemplo de incidente regenerado com a 0.1.1.

## [0.1.0] — 2026-10-24

### Adicionado
- Estrutura pública: `skills/lgpd-dpo/` com núcleo, domínios, setores, playbooks de DPO, normas,
  schema e scripts; manifesto de plugin; CI; modelos de issue; evals.
- Domínio de IA e decisões automatizadas, separado de terceiros e rastreamento.
- Veredito `observacao` para fatos que importam ao RoPA sem violar obrigação.
- Categoria `idoso`; etapas de fluxo `fora_do_repositorio` para `precisa_validacao`.
- Validador: detecção de CPF e CNPJ com dígito verificador válido (com e sem máscara), telefone fixo,
  todas as ocorrências; tratamento de entrada malformada.
- Contexto mínimo (papel, porte, setor, objetivo), regra do modo orientação e modo sequencial sem
  agentes paralelos.
- Seção "Regras que mais se erram de memória" no `SKILL.md` e description mais diretiva (acionamento
  de 8/15 para 14/15 nos evals).
- Evals: 15 casos, `score.cjs`, `rodar.sh` (headless, com `--add-dir`) e primeira rodada em
  `evals/RESULTADOS.md`.

### Alterado
- Núcleo neutro e multissetorial (antes enviesado para saúde).
- Análise estática por padrão, sem depender de outra skill para o isolamento.

### Removido
- Campo `enquadramento_dosimetria` e nível de risco `informativo`.

### Normativo
- Art. 11, §4: consentimento não afasta a vedação; exceções completas, incluindo diagnose e terapia.
- Transferência internacional: adequação da UE/EEE (Res. CD/ANPD nº 32/2026).
- RIPD: critério cumulativo de alto risco da Res. CD/ANPD nº 2/2022, art. 4.
- Art. 19: 15 dias só para a declaração completa de confirmação e acesso.
- Encarregado: dispensa do agente de pequeno porte com canal ao titular (Res. 2/2022, art. 11).
- Art. 9, §3: consentimento pode condicionar o serviço, com destaque.
- Art. 20: revisão não precisa ser feita por pessoa natural.
- Art. 14, §1: consentimento parental é para criança; Enunciado CD/ANPD nº 1/2023.
- Pseudonimização no art. 13, §4; base legal de autenticação corrigida.
- Nível de risco separado do critério de comunicação de incidente.
- Incidentes: conteúdo da comunicação (12 itens), comunicação ao titular, registro e prazos
  conforme o texto da Res. CD/ANPD nº 15/2024.
