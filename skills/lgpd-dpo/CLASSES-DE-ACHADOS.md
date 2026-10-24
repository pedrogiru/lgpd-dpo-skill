# Classes de achados

## Conteúdo
- Disciplina central (inclua em todo prompt de caça)
- Necessidade e finalidade (art. 6, I a III)
- Base legal e consentimento (arts. 7 a 11 e 14)
- Transparência (arts. 6, VI, 9 e 41)
- Segurança (arts. 46 a 49)
- Retenção e eliminação (arts. 15 e 16)
- Direitos do titular (arts. 18 a 20)
- Compartilhamento, operadores e transferência internacional
- Regras de validação

Catálogo base para a fase de caça, organizado pela obrigação violada. Cada classe diz o que procurar
no código e o que separa um achado de uma preferência.

## Disciplina central (inclua em todo prompt de caça)

```
- Um achado exige: titular, dado e categoria, operação de tratamento, obrigação violada (artigo ou
  norma) e resultado concreto. Cite arquivo:linha de cada etapa do fluxo.
- Nunca copie dado pessoal real. Cite campo e tipo. Use dados fictícios em exemplos.
- Base legal, finalidade declarada, contratos, porte do agente e consentimento colhido fora do
  sistema não estão no código. Se forem decisivos, o candidato é precisa_validacao, com o fato
  exato que falta.
- Dado inferido conta: compra, rota, evento de analytics ou campo livre podem revelar dado sensível.
- Siga o dado por todas as cópias: banco, log, cache, índice, fila, export, terceiro, backup.
- Devolva só JSON no formato de candidato. Sem prosa.
```

## Necessidade e finalidade (art. 6, I a III)

**Coleta excessiva**
Formulário ou API exige dado que a finalidade não usa: CPF para newsletter, data de nascimento
completa quando só a maioridade importa, RG e CPF juntos sem motivo, foto obrigatória sem uso.
Prove que o campo é obrigatório e que nenhum fluxo o consome para a finalidade da tela.

**Desvio de finalidade**
Dado coletado para uma finalidade é reutilizado em outra incompatível: telefone do cadastro de
entrega usado em campanha, dados de atendimento alimentando segmentação de anúncios, dados de
colaboradores em ferramenta comercial. Prove o reuso no código; a compatibilidade com o aviso de
privacidade costuma ser `precisa_validacao`.

**Campo livre como depósito de sensível**
`observacao`/`notes` sem orientação nem restrição recebe dado sensível (saúde, religião, situação
familiar) e trafega com as permissões e os destinos de um campo comum (exportações, CRM, logs).

## Base legal e consentimento (arts. 7 a 11 e 14)

**Consentimento inválido no código**
Checkbox pré-marcado; consentimento embutido nos termos de uso sem destaque; uma caixa para várias
finalidades; texto genérico ("para melhorar sua experiência"). Art. 8, §4: autorizações genéricas
são nulas. Condicionar o produto ou serviço ao consentimento **não** é, por si, irregular: o art. 9,
§3 admite isso desde que o titular seja informado com destaque. O achado está na falta de destaque,
na finalidade genérica ou no uso de consentimento onde a finalidade não depende dele.

**Consentimento sem prova**
O tratamento se apoia em consentimento, mas o sistema não guarda quem consentiu, quando, em que
versão do texto e para qual finalidade. Art. 8, §2: o ônus da prova é do controlador.

**Revogação impossível ou ineficaz**
Não há caminho para revogar, ou a revogação grava uma flag que nenhum fluxo consulta (o envio de
marketing continua, a integração continua exportando). Art. 8, §5 e art. 18, IX.

**Sensível sem hipótese do art. 11**
Dado sensível tratado para finalidade que só caberia em hipótese exclusiva do art. 7, que o art. 11
não admite para sensíveis: legítimo interesse, proteção do crédito, execução de contrato (o art. 11
fala em exercício regular de direitos, "inclusive em contrato", que é outra coisa). Ex.: score
comercial usando dado de saúde; biometria de ponto justificada como "execução do contrato". O
enquadramento final é jurídico; o achado é o fluxo.

**Crianças e adolescentes**
Dados de menores de 18 anos devem ser tratados no melhor interesse (art. 14). Pelo Enunciado CD/ANPD
nº 1/2023, a base pode ser qualquer hipótese dos arts. 7 ou 11, observado o melhor interesse. Quando
a base for consentimento para dado de **criança** (até 12 anos incompletos), ele deve ser específico
e dado por pelo menos um dos pais ou responsável (art. 14, §1). Achados típicos: perfilamento ou
publicidade direcionada a menores, coleta além do necessário para jogos e aplicativos (art. 14, §4),
ausência de mecanismo de consentimento parental onde ele é a base. Para produtos digitais com acesso
provável de menores, considere também o ECA Digital (Lei 15.211/2025), conferindo o texto da lei
antes de citar artigo.

## Transparência (arts. 6, VI, 9 e 41)

**Tratamento oculto**
O código coleta ou compartilha algo que o aviso de privacidade versionado no repositório não menciona
(novo terceiro, geolocalização, gravação de sessão). Se o aviso não está no repositório,
`precisa_validacao`.

**Canal do titular e encarregado**
O controlador deve divulgar a identidade e o contato do encarregado (art. 41, §1; Res. CD/ANPD
nº 18/2024). O agente de pequeno porte pode ser dispensado de indicar encarregado, mas deve manter
canal de comunicação com o titular (Res. CD/ANPD nº 2/2022, art. 11). A ausência dessa informação no
repositório **não** prova a ausência no site ou no app publicado: registre `precisa_validacao`.

## Segurança (arts. 46 a 49)

**Dado pessoal em log, APM ou erro**
Middleware loga body/headers/query com CPF, telefone, token ou conteúdo sensível; exceções enviadas a
rastreador de erros com payload; `console.log` de objeto de cliente. Prove que o campo chega ao sink e
quem lê o sink.

**Dado pessoal em URL**
CPF, e-mail, nome ou id de documento em query string ou caminho: vai para logs de proxy, histórico do
navegador, cabeçalho `Referer` e ferramentas de analytics.

**Controle de acesso largo demais**
Qualquer usuário autenticado lê dados de qualquer titular; atendente ou gestor vê dado que sua
função não exige (atestado com CID, avaliação de outro time); unidade A lê clientes da unidade B;
endpoint administrativo sem verificação. Para a parte técnica de autorização, use também uma skill
de segurança, se houver, e registre aqui o impacto ao titular.

**Exposição excessiva na resposta**
API devolve o objeto completo (CPF inteiro, nascimento, endereço) quando a tela usa só nome e
horário. Mascarar só no front não protege.

**Criptografia e armazenamento**
Documentos em bucket público ou com URL previsível; links assinados sem expiração; dado sensível em
`localStorage`; backups sem criptografia configurados no IaC; senhas sem hash adequado.

**Pseudonimização tratada como anonimização**
Hash de CPF, e-mail ou telefone sem segredo (reversível por dicionário) enviado a terceiros ou
guardado como "anônimo". Dado pseudonimizado continua sendo dado pessoal: a pseudonimização está no
art. 13, §4, e o dado só é anonimizado quando não puder ser revertido por meios razoáveis (art. 5,
III, e art. 12).

**Sem trilha de acesso a dado sensível**
Leitura de dado sensível ou financeiro sem registro de quem acessou e quando. Prejudica a apuração de
incidente e a prestação de contas (art. 6, X; art. 37).

**Dados reais fora de produção**
Seeds, fixtures, dumps ou scripts que copiam produção para homologação ou para máquinas locais.

## Retenção e eliminação (arts. 15 e 16)

**Sem fim de tratamento**
Nenhum job, TTL ou rotina elimina ou anonimiza dados após o fim da finalidade (leads que não
converteram, currículos de processos encerrados, logs, carrinhos abandonados). Diferencie de dados com
guarda legal obrigatória (fiscais, trabalhistas, regulatórios, prontuário): ver
[normas/referencias.md](normas/referencias.md).

**Eliminação incompleta**
A exclusão apaga a linha principal, mas mantém cópias em índice de busca, cache, CRM, planilha, data
lake, terceiro ou fila de reprocessamento, ou o soft delete continua visível em algum caminho.

**Eliminação indevida**
A exclusão apaga dado que tem obrigação legal ou regulatória de guarda (notas fiscais, registros
trabalhistas, registros exigidos por regulador setorial). O certo é eliminar o que não tem guarda,
bloquear o resto até o fim do prazo e informar o titular (art. 16, I).

## Direitos do titular (arts. 18 a 20)

**Direito sem caminho técnico**
Não há como localizar todos os dados de um titular (sem chave comum entre sistemas), exportar em
formato legível, corrigir dados replicados ou informar com quem foram compartilhados (art. 18, VII).
Avalie se a declaração completa de confirmação e acesso em até 15 dias (art. 19, II) é atingível.

**Decisão automatizada sem revisão**
Aprovação, recusa, preço, score ou priorização decididos unicamente por tratamento automatizado,
afetando interesses do titular, sem caminho para pedir revisão nem informação sobre critérios e
procedimentos (art. 20, *caput* e §1). A lei não exige que a revisão seja feita por pessoa natural
(esse trecho foi vetado na Lei 13.853/2019). Ver
[dominios/ia-e-decisoes-automatizadas.md](dominios/ia-e-decisoes-automatizadas.md).

## Compartilhamento, operadores e transferência internacional

Ver [dominios/terceiros-e-rastreamento.md](dominios/terceiros-e-rastreamento.md) e
[dpo/fornecedores-e-transferencia.md](dpo/fornecedores-e-transferencia.md).

## Regras de validação

1. O dado chega de fato ao ponto apontado? Siga o fluxo até o sink; não presuma pelo nome do campo.
2. Existe controle no caminho que você não viu (mascaramento, allowlist de campos, verificação de
   papel, consulta de consentimento, bloqueio de tags, job de eliminação, proxy)? Procure antes.
3. O resultado depende de fato fora do código? Então é `precisa_validacao`.
4. O impacto descrito é o demonstrado, não o pior cenário imaginável.
5. O artigo citado existe e diz o que você afirma? Na dúvida, confira em
   [normas/referencias.md](normas/referencias.md) ou na fonte oficial.
