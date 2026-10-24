# Inventário (RoPA), RIPD e teste de legítimo interesse

## Conteúdo
- Inventário de operações de tratamento (art. 37)
- Relatório de impacto (art. 38)
- Teste de balanceamento de legítimo interesse (art. 10)

## Inventário de operações de tratamento (art. 37)

Controlador e operador devem manter registro das operações de tratamento que realizarem. O RoPA é
organizado por **processo** (cadastro de clientes, vendas, cobrança, recrutamento, folha, marketing,
atendimento), não por tabela do banco. Uma auditoria de código produz o mapa técnico; o RoPA junta o
que só as áreas sabem (finalidade, base legal, prazo acordado).

Para agentes de pequeno porte, a ANPD publicou um modelo de registro simplificado; ele é ponto de
partida também para organizações maiores.

| Campo | Fonte |
|---|---|
| Processo e área responsável | área de negócio |
| Papel (controlador, operador, controlador conjunto) | DPO/jurídico |
| Finalidades específicas | área de negócio + DPO |
| Base legal por finalidade (art. 7 ou art. 11) | DPO/jurídico |
| Categorias de titulares | mapa de dados |
| Categorias de dados (marcar sensíveis, de crianças, adolescentes e idosos) | mapa de dados |
| Origem dos dados | mapa de dados |
| Sistemas onde ficam | mapa de dados |
| Compartilhamentos (com quem, o quê, por quê, papel do terceiro) | mapa de dados + contratos |
| Transferência internacional e mecanismo | mapa de dados + jurídico |
| Prazo de retenção e fundamento | área + norma aplicável |
| Medidas de segurança | TI/segurança |
| RIPD necessário? | critérios abaixo |

Ao gerar `ROPA-rascunho.md` a partir de `inventario-dados.md`, preencha só o que o código prova e
marque o resto como `[A PREENCHER: <quem>]`. Nunca invente base legal ou prazo.

## Relatório de impacto (art. 38)

A ANPD pode determinar ao controlador que elabore o RIPD, inclusive de dados sensíveis (art. 38),
e pode solicitá-lo quando o tratamento se basear em legítimo interesse (art. 10, §3). Não há, até a
última verificação, regulamento específico de RIPD: confira em
[../normas/referencias.md](../normas/referencias.md).

Recomende o RIPD como boa prática quando o tratamento for de **alto risco**, usando o único critério
normativo disponível, o da Res. CD/ANPD nº 2/2022, art. 4. É de alto risco o tratamento que atende,
**cumulativamente**, a pelo menos um critério geral e a pelo menos um específico:

- **Gerais**: tratamento em larga escala; ou tratamento que possa afetar significativamente
  interesses e direitos fundamentais dos titulares.
- **Específicos**: uso de tecnologias emergentes ou inovadoras; vigilância ou controle de zonas
  acessíveis ao público; decisões tomadas unicamente com base em tratamento automatizado, inclusive
  de perfilamento; uso de dados sensíveis ou de dados de crianças, adolescentes ou idosos.

Também é boa prática fazer RIPD quando o legítimo interesse for a base de um tratamento relevante.

Conteúdo mínimo do art. 38, parágrafo único: descrição dos tipos de dados coletados, metodologia de
coleta e de garantia da segurança, e análise do controlador sobre medidas, salvaguardas e mecanismos
de mitigação de risco. Estrutura sugerida:

1. **Identificação** — controlador, encarregado, versão, data, participantes.
2. **Por que este RIPD** — critérios de alto risco atendidos, ou pedido da ANPD.
3. **Descrição do tratamento** — natureza, escopo, contexto e finalidade; tipos de dados;
   metodologia de coleta; fluxo (diagrama do mapa de dados); operadores; retenção.
4. **Necessidade e proporcionalidade** — base legal, minimização (por que cada dado é necessário),
   qualidade, transparência, como os direitos são atendidos.
5. **Riscos aos titulares** — para cada risco: descrição, probabilidade, impacto, nível. Pense em
   acesso indevido, vazamento, uso para outra finalidade, discriminação, reidentificação,
   impossibilidade de exercer direitos, erro em decisão automatizada.
6. **Medidas, salvaguardas e mitigação** — o que reduz cada risco, com responsável e prazo. Achados
   confirmados da auditoria entram aqui como medidas pendentes.
7. **Risco residual e aprovação** — o que sobra, quem aceita, parecer do encarregado.
8. **Revisão** — quando revisar (mudança no tratamento, incidente, prazo fixo).

## Teste de balanceamento de legítimo interesse (art. 10)

Legítimo interesse **não** serve para dado sensível (o art. 11 não o prevê). Para os demais dados,
documente as três etapas do guia orientativo da ANPD sobre legítimo interesse:

1. **Finalidade** — o interesse é legítimo, lícito, concreto e atual? É do controlador ou de
   terceiro? Descreva a situação concreta (art. 10, *caput*), não "melhorar serviços".
2. **Necessidade** — só os dados estritamente necessários (art. 10, §1)? Há forma menos invasiva de
   chegar ao mesmo resultado?
3. **Balanceamento e salvaguardas** — o titular esperaria esse uso, dada a relação com a
   organização? Há impacto em direitos e liberdades? Quais salvaguardas existem: transparência
   (art. 10, §2), oposição fácil, minimização, prazo curto, pseudonimização.

Conclusão: aplicável, aplicável com salvaguardas (listar), ou não aplicável (buscar outra base ou não
tratar). Registre e guarde a análise.
