# Revisão de LGPD do checkout

Li os 12 arquivos do repositório. A camada `src/db`, a página `/privacidade` e qualquer banner de cookies não estão aqui, então não consegui avaliar retenção no banco, criptografia do CPF em repouso nem o texto da política. Isto é uma revisão técnica, não parecer jurídico.

## Bloqueantes (corrigir antes do lançamento)

**1. O checkout grava todos os dados pessoais em log aberto**
- `src/routes/checkout.ts:13` faz `logger.info({ body: req.body }, ...)`. Isso grava nome, e-mail, CPF completo, telefone e endereço em `logs/app.log`.
- Segundo `src/lib/logger.ts:3-5`, esse log tem 90 dias de retenção e é acessível a todo o time de engenharia e ao suporte N2.
- A máscara de CPF em `audit-log.ts` fica sem efeito, porque o CPF já foi gravado inteiro na linha 13.
- Isso fere a minimização (art. 6º, III) e a segurança (art. 46).
- **Correção:** remova a linha 13. Se precisar de log de diagnóstico, registre só `pedidoId` e `clienteId`. Depois, apague ou rotacione os logs que já tenham sido gerados em dev e staging.

**2. Dados vão para a Meta sem consentimento**
- `checkout.ts:31` chama `enviarCompraMeta` em todo pedido, sem olhar `aceitaMarketing` nem nenhum consentimento de rastreamento.
- Em `meta-capi.ts`, o envio inclui e-mail e telefone com hash, IP, user-agent e `_fbp`. Hash é pseudonimização, não anonimização, então continuam sendo dados pessoais.
- Isso é compartilhamento com terceiro para publicidade e transferência internacional (art. 33).
- **Correção:**
  - Envie o evento só se houver consentimento específico para publicidade e rastreamento. Não reaproveite o `aceitaMarketing`, que é de comunicação.
  - Cite a Meta e a transferência internacional na política de privacidade.
  - Coloque a chamada em `try/catch`. Hoje, se a Meta falhar, o cliente recebe erro depois de o pedido já ter sido criado.

**3. O Pixel carrega em todas as páginas sem consentimento**
- `src/web/pixel.ts` injeta o `fbevents.js` e dispara `PageView` para qualquer visitante. Isso grava o cookie `_fbp` e envia IP e navegação à Meta.
- Não encontrei banner nem gerenciador de consentimento no repositório.
- Há também um bug: `window.fbq` é chamado antes de existir, porque falta o stub do snippet oficial. Isso lança `TypeError`.
- **Correção:** só chame `iniciarPixel` depois do aceite explícito na categoria "marketing". Ofereça recusa tão fácil quanto o aceite.

**4. A caixa de marketing vem pré-marcada**
- `CheckoutForm.tsx:21` usa `defaultChecked`. Consentimento precisa ser livre, informado e inequívoco (art. 5º, XII, e art. 8º), e caixa pré-marcada não vale.
- O mesmo checkbox cobre e-mail e WhatsApp, que são finalidades distintas.
- **Correção:**
  - Desmarque por padrão.
  - Separe e-mail de WhatsApp, ou deixe claro que o consentimento cobre os dois.
  - Guarde data/hora, versão do texto e canal junto com o consentimento. Hoje só é salvo um booleano, em `pedidos` (linha 26) em vez do cliente, e isso não serve de prova.

**5. O CPF vai na URL do rastreio e acaba nos logs**
- `src/routes/pedidos.ts:9` e `src/web/rastreio.ts:2` mandam o CPF em `?cpf=...`.
- O `morgan("combined")` em `src/server.ts:11-13` grava a URL completa em `logs/access.log`. Esse arquivo não tem retenção definida, e a URL também pode aparecer em proxy, histórico do navegador e `Referer`.
- A autenticação é fraca: CPF mais número de pedido sequencial (`100234`) é enumerável, e não há rate limit.
- **Correção:**
  - Troque por `POST` com corpo, ou melhor, por um link com token opaco enviado por e-mail.
  - Aplique rate limit.
  - Configure o morgan para não registrar query string.
  - Limpe o `access.log` existente.

## Importantes

**6. Acesso e retenção dos logs**
- Defina quem pode ler `app.log` e `access.log` e por quanto tempo. O acesso de "todo o time de engenharia" é amplo demais.
- Os logs de acesso com IP provavelmente devem ficar guardados (Marco Civil, art. 15, 6 meses), mas com acesso restrito. Confirme esse prazo com o jurídico.
- Não vi rotação de log no código.

**7. Minimização de campos**
- Confira se o CPF é mesmo necessário para todos os pedidos, por exemplo se é exigido na nota fiscal. Se for, documente a base legal (obrigação legal ou execução de contrato).
- Garanta que o CPF seja criptografado em repouso. `checkout.ts:20` o grava em claro via `db.clientes.create`, mas não vejo o schema.

**8. Direitos do titular e retenção**
- Não há nada no código para acesso, correção, exclusão ou portabilidade (art. 18), nem política de retenção de pedidos e clientes.
- Pelo menos o processo precisa existir e estar na política de privacidade, com o contato do encarregado (DPO).

## O que está correto

- `src/lib/dedup.ts` usa HMAC-SHA256 com pepper vindo do cofre, e a chave não sai do banco. Está bom, só lembre que continua sendo dado pessoal.
- Os cookies `sid` e `carrinho_id` (`sessao.ts`) são estritamente necessários, têm `httpOnly`, `secure` e `sameSite`, e dispensam consentimento.
- O `.env.example` não traz segredos.
- O link para a política de privacidade existe no formulário.

## Ordem sugerida
1. Remover o log do body (item 1). É uma linha só.
2. Tirar o CPF da URL e limpar os logs (item 5).
3. Colocar um gate de consentimento no Pixel e na CAPI (itens 2 e 3).
4. Desmarcar o checkbox e registrar a prova do consentimento (item 4).
5. Tratar os itens 6 a 8 e atualizar a política de privacidade.

Posso aplicar as correções dos itens 1, 4 e 5 e esboçar o gate de consentimento para os itens 2 e 3 (o item 3 também inclui o fix do stub do `fbq`). Quer que eu faça?