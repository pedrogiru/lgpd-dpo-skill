# Segurança

## O que a skill faz e não faz na sua máquina

- Os scripts em `skills/lgpd-dpo/scripts/` e `evals/` são Node.js puro, **sem dependências**, **sem
  acesso à rede** e **sem telemetria**. Eles só leem os arquivos que você passa como argumento.
- As instruções da skill mandam o agente **não executar o código auditado** por padrão, não acessar
  produção e nunca copiar dado pessoal real para relatórios.
- A saída de auditoria fica fora do repositório auditado, salvo pedido explícito.

## Como relatar uma vulnerabilidade

Use o [relato privado de vulnerabilidade do GitHub](https://github.com/pedrogiru/lgpd-dpo-skill/security/advisories/new).
Não abra issue pública para falhas de segurança. Exemplos do que relatar:
- instrução da skill que possa levar um agente a vazar dados ou executar código não confiável;
- script que leia ou escreva fora do esperado;
- caminho que faça o validador aceitar dado pessoal real.

Erro jurídico não é vulnerabilidade: use o modelo de issue "Errata normativa".
