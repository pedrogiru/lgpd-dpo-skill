# Auditoria LGPD: API do portal de RH

Li o repositório inteiro: 7 arquivos de código, o `schema.sql` e o `package.json`. **Não recomendo liberar para os gestores antes de corrigir os itens 1 e 2.** O primeiro vaza dado de saúde para os próprios gestores. O segundo expõe biometria a qualquer usuário logado.

Esta é uma revisão técnica do código, não um parecer jurídico. As referências a bases legais e prazos devem passar pelo jurídico e pelo encarregado (DPO).

## Críticos (bloqueiam a liberação)

**1. O gestor vê o CID dos atestados da equipe.** `src/routes/atestados.ts:29-34`
- O painel do gestor devolve `cid` junto com data e dias. O CID é dado pessoal sensível de saúde (arts. 5º II e 11 da LGPD) e viola o princípio da necessidade (art. 6º III). Para planejar escala, o gestor só precisa de `dataInicio` e `dias`.
- **Correção:** remover `cid` da resposta do gestor. Só a medicina do trabalho deve ver o CID, com registro de auditoria.
- Vale perguntar ao jurídico se o sistema deve coletar o CID, hoje opcional no upload (linha 15). Pela regra do CFM, ele costuma depender de consentimento do paciente.

**2. Qualquer usuário autenticado lê a digital de qualquer colaborador.** `src/ponto/biometria.ts:20-27`
- `GET /ponto/biometria/:colaboradorId` exige só `autenticado`, sem papel e sem checagem de dono. Basta um colaborador chamar a rota com o UUID de outro para receber o template biométrico em base64. A rota também não grava auditoria.
- O comentário do arquivo diz que a verificação é 1:1 no relógio. Se for assim, a API provavelmente nem precisa devolver o template.
- **Correção:** restringir a rota (papel `rh` ou conta de serviço dos relógios), registrar auditoria e avaliar remover o endpoint.

## Altos

**3. Base legal da biometria está errada.** `src/ponto/biometria.ts:6`
- O comentário cita o art. 7º V (execução de contrato), mas biometria é dado sensível e cai no art. 11. Esse artigo não tem a base "execução de contrato". As alternativas são consentimento específico, obrigação legal ou prevenção à fraude na autenticação (art. 11, II, "g").
- O jurídico precisa definir e documentar a base. Também não há RIPD (relatório de impacto) para o tratamento biométrico.
- O template fica em `bytea` puro, sem criptografia.

**4. Retenção só existe para a folha.** `src/folha/retencao.ts`, `db/schema.sql`
- Não há prazo nem expurgo para `ponto_biometria`, `atestados`, `aso`, `marcacoes_ponto` e `candidaturas`. Uma digital deveria ser apagada no desligamento.
- O ASO tem prazo próprio de guarda pela NR-7, que acredito ser de 20 anos. Confirmar com a medicina do trabalho.
- `colaboradores` (nome, CPF, e-mail) nunca é anonimizado, mesmo depois dos 5 anos da folha.
- Dúvida técnica: `folha_pagamento.colaborador_id` é `NOT NULL REFERENCES`. Não vejo como `anonimizarPorColaborador` "remove o vínculo" sem quebrar essa coluna. Vale conferir a implementação.

**5. Banco de talentos sem prazo nem consentimento.** `src/recrutamento/candidaturas.ts`
- O formulário público coleta nome, e-mail, telefone, pretensão salarial e currículo. Não há aviso de privacidade nem registro de consentimento.
- Candidaturas reprovadas ficam para sempre e o RH as pesquisa em `/rh/banco-de-talentos`. Guardar para vagas futuras exige consentimento específico ou prazo definido.
- O endpoint público não tem rate limit nem captcha.

**6. Ausência de canal para os direitos do titular (art. 18).** Não há rota de acesso, correção, eliminação ou portabilidade. Também não vi registro de consentimento nem referência ao encarregado.

## Médios

- **`POST /ponto/marcacoes` com `autenticado` apenas** (`biometria.ts:29`). Qualquer usuário registra batida de ponto em nome de outro, o que compromete a integridade dos dados (art. 6º, V).
- **Uploads sem validação de tipo** em atestados e currículos. Só há limite de tamanho. O PDF/foto do atestado também é dado de saúde. Não consigo ver como o bucket controla acesso, então confirme que não é público e que usa URL assinada.
- **`req.file!` e handlers `async` sem tratamento de erro.** No Express 4, uma rejeição não tratada pode derrubar o processo em Node recente. Uma requisição sem arquivo no endpoint público bastaria. Há também `templateBase64` inválido e jobs do cron sem `catch`. Se o expurgo falhar em silêncio, a política de retenção deixa de ser aplicada sem ninguém notar.
- **Auditoria parcial.** Só a leitura da ficha completa do ASO é registrada. Acessos do gestor a atestados e ASO, a leitura de biometria e as alterações de status de candidatura não geram log.
- **`folha_pagamento.descontos` (jsonb).** Se guardar contribuição sindical ou plano de saúde, contém dado sensível. A rota da folha não está no repositório, então não pude verificar.
- **CPF em texto puro** em `colaboradores.cpf`, e `aso.exames` e `anamnese` sem criptografia em campo. Avaliar criptografia em repouso.

## O que está bem

- A separação do ASO é boa. O gestor recebe só `tipo`, `resultado` e `validoAte`, e a ficha completa vai só para `medico_trabalho`, com auditoria.
- A autorização falha fechada: sem `req.usuario`, a resposta é 401. O atestado é gravado com o ID do token, sem IDOR no upload.
- O SQL da biometria é parametrizado, e a política de retenção da folha está documentada com referência ao parecer jurídico.

## Limites da revisão

Não existe `src/app.ts` no repositório. Por isso não consegui verificar:
- Como `req.usuario` é preenchido e se o token do SSO é validado.
- Se há TLS, CORS, rate limit ou helmet.
- O que os logs registram, já que CID e e-mail podem vazar em log de requisição.
- A implementação de `req.db` e `req.storage`.

Se você enviar esses arquivos e o código da folha, eu complemento a auditoria.

Posso aplicar já as correções de código dos itens 1, 2 e 7: tirar o CID da resposta do gestor, travar a rota de biometria com papel e auditoria, e validar o tipo dos uploads. Os itens de retenção e consentimento precisam primeiro de decisões do jurídico e do DPO. Quer que eu comece pelas correções?