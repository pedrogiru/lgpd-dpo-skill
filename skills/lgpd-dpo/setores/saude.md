# Saúde

#### Quando usar este arquivo

Sempre que o sistema tratar dado referente à saúde: clínicas, consultórios, laboratórios,
telemedicina, prontuário eletrônico, agendamento por especialidade, farmácias, operadoras de planos,
cartões de desconto ou de benefício em saúde, e qualquer CRM ou marketing alimentado por esses
sistemas. Dado de saúde é sensível (art. 5, II) e tem regras próprias no art. 11, §§ 4º e 5º, além
do sigilo profissional.

## Disciplina do domínio (inclua no prompt)

```
- Saúde inclui o inferido: especialidade, procedimento, exame, medicamento, unidade especializada,
  dependente com condição crônica, uso de um benefício específico.
- A base usual para atendimento é tutela da saúde (art. 11, II, "f"), só para procedimento
  realizado por profissionais de saúde, serviços de saúde ou autoridade sanitária. Ela não cobre
  marketing, venda de produtos ou análise comercial.
- Art. 11, §4: é vedado comunicar ou compartilhar dado de saúde entre controladores com objetivo de
  vantagem econômica, salvo nas hipóteses de prestação de serviços de saúde, de assistência
  farmacêutica e de assistência à saúde, incluídos os serviços auxiliares de diagnose e terapia, em
  benefício dos interesses dos titulares, para permitir a portabilidade pedida pelo titular ou as
  transações financeiras e administrativas resultantes do uso e da prestação desses serviços.
  Consentimento não está entre as exceções.
- Art. 11, §5: operadoras de planos não podem usar dado de saúde para seleção de risco na
  contratação nem na exclusão de beneficiários.
- Prontuário tem guarda mínima legal. "Eliminar a pedido do titular" não se aplica a ele enquanto
  durar a obrigação; aplica-se a dados acessórios (marketing, leads, cadastros sem atendimento).
```

## Classes

**Dado clínico acessível fora da equipe assistencial**
Telemarketing, vendas, cobrança ou financeiro com acesso a prontuário, laudos, CID ou histórico de
atendimentos. A permissão deve seguir a necessidade de cada função (art. 6, III) e o sigilo
profissional. Prove o papel e o endpoint.

**Uso comercial de dado assistencial**
Histórico de consultas ou exames alimentando segmentação de campanhas, oferta de produtos,
priorização de vendas, renovação ou retenção ("clientes que fizeram exame X recebem oferta Y").
Cruza art. 11, §4, desvio de finalidade e, se envolver terceiros de publicidade,
[../dominios/terceiros-e-rastreamento.md](../dominios/terceiros-e-rastreamento.md).

**Seleção de risco**
Regras de elegibilidade, preço, carência ou cancelamento que usam idade combinada a condição de
saúde, CID ou histórico de uso. Para operadoras de planos é vedado (art. 11, §5). Para cartões de
desconto ou benefício, o produto não é plano de saúde, mas o tratamento ainda exige hipótese do art.
11 e não pode ser discriminatório (art. 6, IX).

**Resultado e documento clínico expostos**
Laudos, exames e receitas em links públicos, previsíveis ou sem expiração; PDF enviado por e-mail ou
WhatsApp como anexo; download sem verificação de titularidade (incluindo dependentes).

**Dependentes e representantes**
Responsável enxerga dados de dependente maior de idade; titular de cartão familiar acessa
atendimentos de outros membros adultos; ausência de regra quando o dependente atinge 18 anos.

**Prontuário: integridade e guarda**
Prontuário editável sem trilha (quem alterou, quando, valor anterior), exclusão física de registro
clínico, ou rotina de limpeza que alcança prontuário dentro do prazo legal. Para prontuário digital,
verifique assinatura e certificação exigidas pela norma vigente (ver referências).

**Telemedicina**
Gravação de teleconsulta sem finalidade e guarda definidas, plataforma de vídeo genérica sem
contrato de operador, chat clínico em ferramenta de terceiro, envio de imagem clínica por canal não
controlado.

**Integrações com sistemas públicos e laboratórios**
Envio de dados à RNDS, a laboratórios de apoio ou a operadoras: verifique escopo mínimo dos campos,
credenciais de integração e registro de envio. São compartilhamentos legítimos quando restritos à
prestação do serviço; o achado está em excesso de campos ou em reaproveitamento para outro fim.

**Pesquisa e indicadores**
Bases para estudos, BI ou "dados anonimizados" que mantêm data de nascimento, CEP completo,
unidade e procedimento raro juntos — reidentificáveis. Art. 13 trata de estudos em saúde pública;
para análise interna, avalie agregação e pseudonimização com segredo separado.

## Retenção típica (confirme a vigência)

| Dado | Referência | Observação |
|---|---|---|
| Prontuário (papel ou digitalizado) | Lei 13.787/2018, art. 6º | mínimo de 20 anos do último registro |
| Prontuário eletrônico | Res. CFM nº 1.821/2007 (confirme a vigência e a interação com a Lei 13.787/2018) | requisitos de certificação e guarda; tema controverso |
| Registros de acesso a aplicação | Marco Civil (Lei 12.965/2014), art. 15 | 6 meses, para provedores de aplicação |
| Documentos fiscais e contábeis | legislação tributária | em regra, 5 anos |
| Leads sem atendimento, campanhas | sem guarda legal | definir prazo curto e eliminar |

## Regras de validação

1. Mostre que o dado do fluxo é de saúde (campo, contexto da tela, evento ou rota) — não basta o
   sistema "ser de saúde".
2. Para acesso indevido, mostre o papel que acessa e o endpoint que não restringe.
3. Para retenção, separe o que tem guarda legal do que não tem antes de recomendar eliminação.
