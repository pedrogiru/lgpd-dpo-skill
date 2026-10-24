# Exemplo: revisão de LGPD de um checkout de e-commerce

> Saída real da skill `lgpd-dpo` v0.1.0 (Claude Code 2.1.310, Sonnet, 24/10/2026) no caso
> `varejo-checkout` dos evals. O código revisado é a fixture fictícia em
> [`evals/fixtures/varejo-checkout`](../../evals/fixtures/varejo-checkout); nenhum dado é real.
> Texto reproduzido sem edição.

**Pedido:** Faz uma revisão de LGPD no código do checkout da nossa loja virtual (este repositório)? Quero saber o que está errado e o que corrigir antes do lançamento.

---

Li o repositório inteiro (12 arquivos) e verifiquei cada achado relendo o trecho, numa única passada minha, sem verificação independente. O diretório `src/db` não está no repositório, então não consegui avaliar armazenamento, criptografia, retenção nem controle de acesso do banco. Isto é evidência técnica, não parecer jurídico nem declaração de conformidade.

## Corrigir antes do lançamento (confirmados)

**1. Corpo inteiro do checkout gravado em log (risco médio)**
- `src/routes/checkout.ts:13` faz `logger.info({ body: req.body }, ...)`. Isso grava nome, e-mail, CPF completo, telefone, endereço e itens em texto puro.
- O destino é `logs/app.log`. Segundo o comentário em `src/lib/logger.ts:3-4`, tem 90 dias de retenção e acesso de toda a engenharia e do suporte N2.
- `src/lib/audit-log.ts:3` mascara o CPF, mas a linha 13 do checkout anula essa proteção.
- Infringe o art. 46 (segurança) e o art. 6º, III e VII.
- Correção:
  - Registrar só `pedidoId` e metadados.
  - Colocar `redact` no pino para `req.body.*`.
  - Escrever um teste que falhe se o log contiver o CPF enviado.
  - Depois, expurgar ou rotacionar os `app.log` já gerados.

**2. CPF na URL do "acompanhe seu pedido" (risco médio)**
- `src/web/rastreio.ts:2` e `src/routes/pedidos.ts:8-10` enviam o CPF por query string em GET.
- `src/server.ts:13` usa `morgan("combined")` com a URL completa. O CPF vai para `logs/access.log`, que não tem rotação nem retenção visíveis no repositório. Também pode ir para proxy, histórico do navegador e `Referer`.
- Correção:
  - Trocar para POST com o CPF no corpo.
  - Preferir um link com token de uso único enviado por e-mail.
  - Se mantiver CPF mais número do pedido, aplicar rate limit. Hoje não há nenhum, e o número do pedido parece sequencial.
  - Mascarar ou retirar a query string do log do morgan.

**3. Marketing pré-marcado (risco médio)**
- `src/web/CheckoutForm.tsx:21` usa `defaultChecked`. Consentimento exige manifestação inequívoca (art. 8º, §4º), e uma caixa já marcada não atende.
- O texto junta e-mail e WhatsApp em uma só caixa.
- `src/routes/checkout.ts:26` guarda só um booleano. Não há data, versão do texto nem finalidade, e o ônus da prova é do controlador (art. 8º, §2º).
- Não há caminho de revogação no repositório (art. 8º, §5º).
- Correção:
  - Desmarcar por padrão.
  - Guardar `consentimento_marketing` com data/hora, versão do texto e canal.
  - Oferecer revogação que os envios realmente consultem.
- Se a empresa preferir tratar o marketing para clientes existentes como legítimo interesse, essa é uma decisão do jurídico, e o consentimento nesse formulário deixa de ser a base.

## Precisa de validação (o código levanta a hipótese, o fato decisivo está fora)

**4. Conversions API da Meta (`src/integrations/meta-capi.ts`, chamada em `checkout.ts:31-39`)**
- Em toda compra, envia à Meta e-mail e telefone com SHA-256, IP, user-agent e `fbp`. O hash sem segredo continua sendo dado pessoal, porque a Meta o usa para identificar a pessoa.
- O envio não consulta `aceitaMarketing`. O texto da caixa fala só de e-mail e WhatsApp, não de compartilhamento com plataforma de anúncios.
- Perguntas para o DPO e o jurídico:
  - Qual é a base legal desse envio?
  - A política de privacidade informa a Meta?
  - Há mecanismo de transferência internacional (Meta nos EUA, arts. 33 a 36, cláusulas-padrão da Res. 19/2024)?
- Observação: o evento só leva o valor da compra, sem itens. Se a loja vender algo que revele dado de saúde ou outro sensível, isso muda e vira alto risco.

**5. Pixel em todas as páginas (`src/web/pixel.ts`)**
- Carrega o script da Meta e dispara `PageView` sem checar consentimento. O comentário diz "carregado no layout de todas as páginas".
- Não vi o banner de cookies nem quem chama `iniciarPixel`. Se ele for chamado antes da escolha do usuário, as tags de marketing disparam antes do consentimento.
- A equipe de front-end precisa confirmar onde a chamada acontece.
- Sem relação com a LGPD: `window.fbq` é chamado logo após anexar o script, antes de ele carregar. Provavelmente lança `TypeError`, a menos que o stub do `fbq` esteja definido em outro lugar.

**6. Pontos que o repositório não mostra**
- Eliminação e retenção de `clientes` e `pedidos`: a guarda fiscal deve ser respeitada, e não se deve eliminar o que tem prazo legal.
- Canal para os direitos do titular e encarregado publicado.
- Conteúdo da política de privacidade em `/privacidade`.
- Necessidade do CPF: plausível para nota fiscal, mas o DPO deve registrar a justificativa.
- Rotação do `access.log` e do `app.log`.

## O que está correto
- `src/lib/dedup.ts` usa HMAC com pepper vindo do cofre de segredos, e a chave não vai a terceiros. Está bem feito e não é o erro do hash sem segredo.
- Os cookies `sid` e `carrinho_id` (`src/middleware/sessao.ts`) são estritamente necessários e estão bem configurados: `httpOnly`, `secure`, `sameSite` e validade curta. Não dependem de consentimento.
- O mascaramento em `mascararCpf` é adequado.

## Fora do escopo da LGPD
`enviarCompraMeta` é aguardado sem `try/catch` em `checkout.ts:31`. Se a Meta falhar, o cliente recebe erro depois de o pedido já ter sido criado.

## Ordem sugerida
1. Itens 1 e 2, que são correções pequenas e de maior exposição.
2. Item 3, que exige mudar o front-end e criar a tabela de consentimento.
3. Em paralelo, levar os itens 4 e 5 ao DPO e ao jurídico, porque são decisões e não só código.

Quer que eu aplique as correções 1 a 3 no código? Também posso gerar o relatório completo, com `achados.json` e a lista de pendências por responsável. Se for gerar, prefiro avisar antes, porque isso cria arquivos fora do repositório.