# Como contribuir

Obrigado pelo interesse. Esta skill só é útil se estiver juridicamente correta, então as regras
abaixo existem para proteger quem a usa.

## Regras para conteúdo normativo

1. **Toda norma nova ou alterada entra com fonte oficial** (planalto.gov.br, gov.br/anpd, DOU ou site
   do regulador) e data de verificação em `skills/lgpd-dpo/normas/referencias.md`. Fonte secundária
   (escritório, blog, imprensa) só com a marca "fonte secundária".
2. **Tema em consulta pública não vira obrigação.** Vai para "Temas em elaboração".
3. **Toda mudança de regra jurídica vem com um caso em `evals/`**, de regressão ou de cenário, que
   falharia com a regra errada.
4. **Prazos e números ficam fora do `SKILL.md`.** Moram em `normas/` e nos playbooks, com fonte.
5. **Nada de dados reais.** Exemplos e fixtures usam dados fictícios: CPF com dígito verificador
   inválido ou `000.000.000-00`, e-mails `@example.com`, nenhuma empresa real.

## Errata

Encontrou um erro jurídico? Abra uma issue com o modelo "Errata normativa", citando o dispositivo e a
fonte oficial. Errata tem prioridade sobre qualquer funcionalidade.

## Novo setor

Abra uma issue com o modelo "Novo setor" antes de escrever. Um setor só ganha arquivo próprio em
`skills/lgpd-dpo/setores/` quando tiver:
- classes de achado verificáveis no código;
- normas setoriais com fonte oficial;
- pelo menos um eval aprovado.

Revisão de alguém que atua no setor é muito bem-vinda.

## Revisão jurídica

Advogados e DPOs que queiram revisar o gabarito dos evals ou os arquivos normativos podem se
apresentar numa issue. Revisores identificados são creditados no README e nos arquivos revisados.

## Antes do pull request

```bash
node --test tests/*.test.cjs
node evals/score.cjs --check
```

Mantenha o estilo: português claro e direto, frases curtas, sem jargão desnecessário, terminologia
consistente com os arquivos existentes (veredito, achado, candidato, setor, domínio).
