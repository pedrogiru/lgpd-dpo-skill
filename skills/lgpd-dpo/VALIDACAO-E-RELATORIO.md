# Validação, saída estruturada e relatório

## Conteúdo
- Formato de candidato
- Verificação independente
- Vereditos
- Nível de risco
- Arquivos de saída
- Estrutura do relatório

## Formato de candidato

Cada agente de caça devolve um único JSON:

```json
{
  "unidades": [{"id": "checkout/compartilhamento/terceiros", "estado": "coberta", "notas": "..."}],
  "candidatos": [ { "veredito": "confirmado", "...": "registro no formato de schemas/achados.schema.json" } ]
}
```

`estado` de unidade: `coberta`, `lacuna` (não deu para examinar; diga por quê) ou `fora_do_escopo`.
Cada candidato já vem no formato final do schema, com o veredito proposto e o campo `unidade`
apontando para a unidade de cobertura.

## Verificação independente

Cada candidato vai a um agente novo, que não o caçou. Ele recebe o candidato, os trechos do mapa de
dados necessários, as regras de validação do domínio e o schema. Não recebe a conclusão de outro
verificador.

```text
Você não escreveu este candidato. Tente refutá-lo pelo código do repositório.
Não acesse produção, painéis de terceiros nem dados reais. Não copie dados pessoais.

1. Abra cada arquivo:linha do fluxo e confirme que o dado chega de fato a cada etapa.
2. Procure controles no caminho: mascaramento, allowlist de campos, verificação de papel,
   consulta de consentimento, bloqueio de tags, jobs de eliminação, proxies.
3. Confirme a categoria do dado pelo contexto, não pelo nome do campo.
4. Confirme que a obrigação citada se aplica e que o artigo existe e diz o que o candidato afirma.
5. Se o resultado depende de base legal, contrato, porte, região, configuração fora do repositório
   ou decisão do controlador, o veredito é precisa_validacao, com o fato exato que falta.
6. Se o fato é verdadeiro mas não viola obrigação, o veredito é observacao.
7. Ajuste probabilidade, impacto e nível ao que a evidência mostra.
8. Mantenha o fingerprint.

Devolva exatamente um objeto JSON e nada mais:
{"veredito": "confirmado|precisa_validacao|observacao|rejeitado", "registro": { ... }}
```

Sem agentes paralelos, faça a verificação numa passada separada, depois da caça, relendo cada
trecho citado, e declare no relatório que ela não foi independente.

## Vereditos

- **`confirmado`**: o fluxo está provado no repositório do início ao fim e a obrigação se aplica sem
  depender de fato externo. Recebe nível de risco.
- **`precisa_validacao`**: hipótese sustentada pelo código, bloqueada por um fato que só o
  controlador, um fornecedor ou a infraestrutura conhecem. Etapas fora do repositório (painel de
  tags, contrato, conta do provedor) entram no fluxo com `origem: "fora_do_repositorio"`. Sem nível
  de risco. Indique o responsável e um plano de validação que não envolva acessar dado real.
- **`observacao`**: fato confirmado que não viola obrigação, mas importa para o RoPA ou como contexto
  de outro achado (ex.: "CRM recebe cadastro de clientes"). Sem nível de risco.
- **`rejeitado`**: refutado pelo código (`tipo_rejeicao: "refutado"`) ou fora do escopo da LGPD
  (`"fora_do_escopo"`). Fica no JSON para não ser caçado de novo.

## Nível de risco

Só para `confirmado`. Mede o dano possível ao titular e não pode passar do `impacto`. **Não** indica
se há incidente a comunicar: isso é decidido em [dpo/incidentes.md](dpo/incidentes.md).

- **critico** — dado sensível, de criança ou adolescente, financeiro ou de autenticação exposto
  publicamente ou a qualquer usuário do sistema; ou compartilhado em larga escala com terceiro para
  finalidade sem hipótese legal possível.
- **alto** — violação concreta com dado sensível, de criança, adolescente ou idoso, financeiro ou em
  larga escala: evento de rastreamento que revela dado sensível, gestor lendo atestado com CID,
  revogação de consentimento que não interrompe o tratamento, dado sensível enviado para outro país
  sem mecanismo.
- **medio** — violação real com dado comum ou alcance restrito: CPF em logs lidos pela equipe
  técnica, coleta excessiva em formulário, leads sem eliminação, exclusão que deixa cópias.
- **baixo** — falha com dano improvável: registro de consentimento sem a versão do texto, aviso que
  omite um terceiro de baixo risco.

Discriminador entre alto e médio: o titular pode sofrer dano concreto (discriminação, exposição,
fraude, perda de controle sobre dado sensível)? Se você não consegue descrever o dano, o nível é
menor do que parece.

Nunca estime multa nem enquadramento de dosimetria: a dosimetria (art. 52, §1) depende de fatores
que o código não mostra, como boa-fé, cooperação e reincidência.

## Arquivos de saída

No diretório de saída:

- `inventario-dados.md` — do reconhecimento.
- `achados.json` — todos os registros finais. Valide:

  ```bash
  node <dir-da-skill>/scripts/validate-findings.cjs <saida>/achados.json
  ```

  O validador também reprova CPF, CNPJ, e-mail e telefone que pareçam reais. Corrija e rode de novo
  até passar.
- `RELATORIO.md` — derivado do JSON (estrutura abaixo).
- `PRECISA-VALIDACAO.md` — uma seção por registro, agrupada por responsável, com a pergunta exata a
  responder e o plano de validação.
- `ROPA-rascunho.md` — opcional, quando pedido, a partir do inventário, com
  [dpo/inventario-e-ripd.md](dpo/inventario-e-ripd.md).

Prosa e JSON não podem divergir. Se corrigir um achado no relatório, corrija no JSON e valide de
novo.

## Estrutura do relatório

1. **Escopo e limites**: repositório, commit, data, perfil, setores e domínios aplicados, se a
   verificação foi independente, e o aviso de que não é parecer jurídico nem declaração de
   conformidade.
2. **Resumo para a diretoria**, em até 10 linhas: quantos achados por nível, os 3 mais importantes
   em linguagem simples, o que fazer primeiro e quais decisões dependem do controlador.
3. **Mapa de dados resumido**: categorias, terceiros, fluxos de dado sensível.
4. **Achados confirmados**, do mais grave ao menos grave: título, nível, artigos, titulares, fluxo
   com `arquivo:linha`, dano possível, correção (invariante, mudança, teste) e ação de DPO.
5. **Precisa de validação**: contagem por responsável, com link para `PRECISA-VALIDACAO.md`.
6. **Observações** relevantes para o RoPA.
7. **Cobertura**: unidades cobertas, lacunas com motivo, fora do escopo. Uma execução nunca esgota
   o sistema; diga isso.
