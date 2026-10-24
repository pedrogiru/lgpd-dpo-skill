# Terceiros e rastreamento

## Conteúdo
- Quando usar
- Disciplina do domínio
- Rastreamento e publicidade
- Mensageria e CRM
- Transferência internacional
- Regras de validação

## Quando usar

Sempre que o mapa de dados tiver pixel, tag, SDK de analytics ou marketing, mensageria (WhatsApp,
SMS, e-mail), CRM, gateway, birô, BI externo ou serviço hospedado fora do Brasil. É onde mais
acontece compartilhamento sem que ninguém perceba: o código de marketing raramente passa pela mesma
revisão que o código do produto. Provedores de IA estão em
[ia-e-decisoes-automatizadas.md](ia-e-decisoes-automatizadas.md).

## Disciplina do domínio (inclua no prompt)

```
- Para cada terceiro: quais campos recebe, em que momento (antes ou depois da escolha no banner),
  com que identificador (cookie, e-mail com hash, telefone, device id) e se o contexto do evento
  revela dado sensível (URL, título da página, nome do evento, parâmetros, texto da mensagem).
- Hash SHA-256 de e-mail ou telefone enviado a plataforma de anúncios é dado pessoal: a plataforma
  faz o pareamento justamente para identificar a pessoa.
- Ser operador ou controlador independente é questão contratual. Sem contrato no repositório, o
  papel do terceiro é precisa_validacao; o fluxo de dados não.
- Região de processamento só é prova quando está em config/IaC; caso contrário, precisa_validacao.
```

## Rastreamento e publicidade

**Evento de rastreamento que revela dado sensível**
Pixel ou tag (Meta, Google Ads/GA4, TikTok e similares) em páginas cujo endereço, título ou evento
revela dado sensível: especialidade médica agendada, compra de medicamento, doação a organização
religiosa ou política, conteúdo de orientação sexual, filiação sindical. O evento transmite dado
sensível inferido a uma plataforma de publicidade.
- **Dado de saúde**: o art. 11, §4 veda o compartilhamento entre controladores com objetivo de
  vantagem econômica, salvo exceções taxativas (prestação de serviços de saúde, assistência
  farmacêutica e assistência à saúde em benefício do titular; portabilidade pedida por ele;
  transações financeiras e administrativas do próprio serviço). Publicidade não está nas exceções.
  **Consentimento não afasta a vedação**: não o proponha como solução. A correção é não enviar o
  dado de saúde (evento genérico, sem especialidade, procedimento ou página). Trate como alto risco.
- **Outros dados sensíveis** (religião, opinião política, vida sexual, filiação, biometria): não há
  vedação equivalente à do §4, e a única hipótese do art. 11 compatível com publicidade é o
  consentimento específico e destacado (art. 11, I). Se o código não o colhe antes do disparo, é
  achado; se colhe, a validade é `precisa_validacao` para o jurídico.

**Conversões server-side com dados do cliente**
Envio server-side (Conversions API da Meta, conversões otimizadas do Google, upload de listas) de
e-mail, telefone, CPF ou nome com hash, junto com evento de compra ou cadastro. Prove os campos
enviados e o evento. Se o evento revelar dado sensível, aplique a classe anterior.

**Tags disparando antes da escolha**
Banner de cookies que não bloqueia tags não necessárias até a escolha, aceite pré-marcado, ou botão
de rejeitar menos visível que o de aceitar. Referência: guia orientativo de cookies da ANPD. Cookies
estritamente necessários (sessão, carrinho, segurança, preferência de idioma) não dependem de
consentimento.

**Session replay e heatmap**
Ferramenta de gravação de sessão capturando formulários com documentos, dados de pagamento ou dados
sensíveis sem mascarar os campos.

**Públicos personalizados a partir da base**
Exportação da base (inclusive inadimplentes, cancelados ou grupos definidos por dado sensível) para
criar públicos ou lookalikes. Segmentar por dado sensível é o caso mais grave.

## Mensageria e CRM

**Conteúdo sensível em canal de terceiro**
Lembretes, resultados ou cobranças enviados por WhatsApp, SMS ou e-mail com dado sensível ou
financeiro no texto, em canal que fica em aparelho compartilhado e no provedor. Prefira mensagens
neutras com link autenticado ("Você tem uma atualização. Veja no app.").

**API não oficial de WhatsApp**
Bibliotecas que automatizam o WhatsApp Web por sessão, sem contrato com o provedor: sem operador
formal, sem garantia de segurança, com sessão e conversas guardadas em disco.

**CRM, planilhas e BI como cópia sem dono**
Integração que replica clientes, leads ou colaboradores para CRM, planilha compartilhada ou BI sem
controle de acesso equivalente nem rotina de eliminação.

## Transferência internacional

Arts. 33 a 36 da LGPD; Res. CD/ANPD nº 19/2024 (cláusulas-padrão contratuais); Res. CD/ANPD
nº 32/2026 (adequação da União Europeia).

**Fluxo para outro país sem mecanismo visível**
Banco, bucket, função ou SaaS configurado em região fora do Brasil, ou provedor estrangeiro, recebendo
dados pessoais. Antes de pedir mecanismo, veja o destino:
- **União Europeia e Espaço Econômico Europeu**: reconhecidos como adequados pela Res. CD/ANPD
  nº 32/2026 (art. 33, I). Não exigem cláusulas-padrão; confira a situação vigente em
  [../normas/referencias.md](../normas/referencias.md).
- **Demais países** (inclusive EUA): exigem outro mecanismo do art. 33, como as cláusulas-padrão
  contratuais da Res. 19/2024, incorporadas sem alteração, ou outra hipótese do art. 33.

O achado técnico é o fluxo e o destino. A existência do mecanismo é contratual: `precisa_validacao`
para o DPO ou o jurídico.

## Regras de validação

1. Prove os campos e o contexto do evento no código ou na configuração de tags versionada. GTM
   configurado só no painel é `precisa_validacao`, com o plano: exportar o container e revisar.
2. Distinga cookie estritamente necessário de marketing ou analytics.
3. Não acesse painéis de anúncios, gerenciadores de tags ou contas de terceiros para "confirmar".
