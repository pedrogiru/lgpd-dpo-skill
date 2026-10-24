Li o repositório inteiro: 7 arquivos TypeScript, o `schema.sql` e o `package.json`, cerca de 257 linhas. Fiz a caça e a verificação eu mesmo, relendo cada trecho citado, então a verificação **não foi independente**. A análise é estática, e isto é evidência técnica, não parecer jurídico nem declaração de conformidade.

**Resumo: eu não liberaria para os gestores antes de corrigir os achados 1 e 2.**

## Confirmados (o código prova)

**1. Gestor lê o CID dos atestados da equipe — risco alto**
- `src/routes/atestados.ts:33` devolve `cid: a.cid` no painel do gestor.
- O CID é dado de saúde, ou seja, dado sensível (art. 5, II, e art. 11). O gestor só precisa saber as datas e os dias de ausência para planejar a escala (art. 6, III, necessidade).
- Dano possível: o gestor passa a saber o diagnóstico do subordinado, o que abre espaço para discriminação.
- Correção mínima: remover `cid` da projeção do gestor. O invariante é que nenhuma rota de gestor devolve diagnóstico. Adicione um teste que falha se a resposta tiver o campo `cid`.
- O `aso.ts:7-11` já faz o certo, devolvendo só tipo, resultado e validade. Use esse padrão.

**2. Qualquer usuário autenticado lê a digital de qualquer colaborador — risco crítico**
- `src/ponto/biometria.ts:20` protege `GET /ponto/biometria/:colaboradorId` só com `autenticado`, sem papel e sem `daEquipe`.
- O template biométrico é dado sensível. Qualquer colaborador ou gestor logado pode baixar o de qualquer pessoa. Não há registro de auditoria da leitura.
- Dano possível: biometria vazada não se troca, e a pessoa fica exposta a fraude de identidade para sempre.
- Correção mínima: restringir a uma conta de serviço dos relógios, e ao RH se a tela de suporte realmente precisar. Registrar cada leitura em `auditoria`, como o `aso.ts:17` faz. Avaliar também se a tela de suporte precisa devolver o template, ou se basta indicar que existe cadastro.

**3. Qualquer usuário autenticado grava marcações de ponto de outro colaborador — risco médio**
- `biometria.ts:29-30` aceita `colaboradorId` vindo do body, só com `autenticado`.
- Isso compromete a integridade do registro de jornada (art. 6, V, e art. 46).
- Correção: exigir a conta de serviço do relógio ou validar que o `colaboradorId` é o do usuário logado.

## Precisa de validação (bloqueados por fato fora do repositório)

| Tema | Pergunta exata | Quem responde |
|---|---|---|
| Base legal da biometria | O comentário em `biometria.ts:6` cita execução de contrato (art. 7, V). Para dado sensível o art. 11 não admite essa base. Qual base se aplica (por exemplo, o art. 11, II, "g", ou consentimento) e por quê? | Jurídico e encarregado |
| Eliminação da biometria | O template é apagado no desligamento? O job de `agendador.ts` só trata folha e sessões, e o repositório não mostra nenhuma rotina para a biometria. | TI e encarregado |
| Retenção de atestados, ASO e candidaturas | Não há prazo nem job para esses dados. O PCMSO/ASO tem guarda longa pela NR-07, que o material que usei marca como "confirmar". **Não recomendo eliminar o ASO sem o jurídico.** | Jurídico e SST |
| Banco de talentos | `candidaturas.ts:28` guarda candidaturas antigas sem prazo, para reuso em outras vagas. O candidato é informado dessa finalidade? Por quanto tempo se mantém? | Encarregado e RH |
| Aviso e transparência na candidatura | A rota pública (`candidaturas.ts:9`) coleta nome, e-mail, telefone, pretensão salarial e currículo. O repositório não mostra aviso nem registro de ciência. | Encarregado |
| Folha: `descontos` (jsonb) | O campo pode revelar filiação sindical (dado sensível), pensão alimentícia ou plano de saúde. O `anonimizarPorColaborador` limpa o conteúdo desse jsonb, e não só o vínculo? | TI e RH |
| Folha: prazo de 5 anos | `retencao.ts:6-9` cita o parecer JUR-2026-014. O código não contradiz o parecer, mas o prazo precisa ser confirmado contra as obrigações trabalhistas, previdenciárias e fiscais. | Jurídico |
| Bucket de atestados e currículos | Quem acessa os arquivos? São privados? Há criptografia? O código só mostra `storage.put`. | Infraestrutura |
| `daEquipe` | `permissoes.ts:22` chama `ehDaEquipe`, que não está no repositório. Ele considera só a equipe atual? Trata desligados e transferidos? | TI |
| Coleta do CID | `atestados.ts:15` coleta o CID do colaborador. Isso é necessário para a finalidade? A norma setorial precisa de conferência. | Jurídico e SST |

## Pontos positivos (observações para o RoPA)
- `aso.ts`: o gestor vê só apto/inapto e a validade, e a ficha completa é restrita ao médico do trabalho, com auditoria da leitura.
- `retencao.ts`: a folha tem política de guarda documentada, com anonimização, e não eliminação, após o prazo.
- A verificação biométrica é 1:1 no relógio, o que reduz a circulação do template.

## Limites e lacunas
- **`src/app.ts` não existe**, embora o `package.json` o use no `dev`. Não vi a montagem das rotas, o middleware que preenche `req.usuario` (SSO), a camada `req.db`, o `req.storage`, os logs, o CORS nem rate limiting.
- Por isso não avaliei criptografia em repouso, vazamento de dado pessoal em logs, controle de acesso dos buckets nem a cobertura da auditoria.
- Uma execução nunca esgota o sistema. Se você me indicar onde está o restante, eu amplio o escopo.

## Próximos passos
Posso corrigir os achados 1 a 3, com testes de regressão. Também posso gerar `achados.json`, `RELATORIO.md` e `PRECISA-VALIDACAO.md` com o fluxo completo, gravados fora do repositório. Qual dos dois você prefere? Não alterei nem criei nenhum arquivo.