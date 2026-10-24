# Exemplo: prazo e conteúdo da comunicação de incidente

> Saída real da skill `lgpd-dpo` v0.1.0 (Claude Code 2.1.310, Sonnet, 24/10/2026) no caso
> `incidente-prazo` dos evals. Cenário fictício. Texto reproduzido sem edição.

**Pedido:** Sou o encarregado. Na quinta-feira, 19/11/2026, confirmamos que um acesso indevido ao nosso sistema expôs dados de saúde de cerca de 3.000 clientes. Até quando temos que comunicar a ANPD e os titulares, e o que a comunicação precisa conter? Se formos agente de pequeno porte, muda alguma coisa?

---

**Resumo:** o prazo é até **quarta-feira, 25/11/2026**, tanto para a ANPD quanto para os titulares. O prazo em dobro de pequeno porte dificilmente vale para você. O que o texto vigente diz está abaixo.

**Antes de tudo: a data.** O calendário desta sessão marca 24/10/2026, anterior a 19/11. Se a data do conhecimento digitada estiver errada, os prazos mudam. Por exemplo, se o marco fosse quinta 22/10, o prazo seria 27/10. Confirme a data e registre-a com hora, porque é ela que dá início à contagem.

## Prazos (Res. CD/ANPD nº 15/2024)

O marco é o dia em que o controlador soube que o incidente afetou dados pessoais (art. 6, §1). Conta-se em dias úteis, sem o dia do marco.

| Ação | Prazo | Data |
|---|---|---|
| Comunicar à ANPD | 3 dias úteis (art. 6) | **25/11/2026** |
| Comunicar aos titulares | 3 dias úteis (art. 9) | **25/11/2026** |
| Juntar à ANPD a declaração de que os titulares foram comunicados | 3 dias úteis após o fim do prazo aos titulares (art. 9, §4) | 30/11/2026 |
| Complementar a comunicação | 20 dias úteis da data em que você comunicar (art. 6, §3) | 23/12/2026, se comunicar em 25/11 |
| Registro interno do incidente | guardar por pelo menos 5 anos (art. 10) | — |

**Como contei:**
- 20/11 (sexta) é feriado nacional (Consciência Negra, Lei 14.759/2023).
- Por isso os dias úteis são 23, 24 e 25/11.
- Sugiro protocolar até **24/11**, para ter margem caso alguém conte de outro jeito.
- Não espere ter tudo apurado. Comunique o que já sabe e use a complementação para o resto.

## Conteúdo da comunicação à ANPD (art. 6, §2)

Ela é feita pelo formulário eletrônico da ANPD. O encarregado deve juntar o comprovante de vínculo (ou o representante, a procuração).

1. Natureza e categoria dos dados afetados.
2. Número de titulares, discriminando crianças, adolescentes e idosos.
3. Medidas técnicas e de segurança usadas antes e depois do incidente.
4. Riscos e possíveis impactos aos titulares.
5. Motivos da demora, se houver.
6. Medidas adotadas ou a adotar para reverter ou mitigar os efeitos.
7. Data da ocorrência (se possível) e data do conhecimento.
8. Dados do encarregado ou do representante.
9. Identificação do controlador e, se for o caso, declaração de que é agente de pequeno porte.
10. Identificação do operador, se houver.
11. Descrição do incidente e, se possível, a causa principal.
12. Total de titulares cujos dados são tratados nas atividades afetadas.

## Conteúdo da comunicação aos titulares (art. 9)

1. Natureza e categoria dos dados afetados.
2. Medidas técnicas e de segurança usadas para proteger os dados.
3. Riscos e possíveis impactos.
4. Motivos da demora, se houver.
5. Medidas adotadas ou a adotar para reverter ou mitigar os efeitos.
6. Data do conhecimento do incidente.
7. Contato para dúvidas e, quando aplicável, o do encarregado.

Escreva em linguagem simples e direta, de forma individual quando os titulares forem identificáveis (e-mail, mensagem, carta). Se a comunicação individual for inviável, divulgue no site, no aplicativo e nos canais de atendimento por pelo menos 3 meses. Recomendações de proteção ao titular são boa prática. A skill tem um modelo de mensagem em `dpo/incidentes.md`.

## Se for agente de pequeno porte

- **Prazos:** passam a 6 dias úteis para a ANPD e para os titulares e a 40 dias úteis para a complementação (art. 6, §8; art. 9, §6). Isso só vale se o regime diferenciado puder ser usado. Dificilmente é o seu caso, por dois motivos:
  1. O regime não vale para quem faz tratamento de alto risco (Res. 2/2022, art. 3, I). Dado de saúde é sensível, e esse é um dos critérios específicos de alto risco. Falta saber se há também o critério geral, de larga escala ou de afetar significativamente direitos. Isso é avaliação sua, com o jurídico.
  2. O prazo em dobro não se aplica quando há potencial comprometimento da integridade física ou moral dos titulares (Res. 2/2022, art. 14). Vazamento de dado de saúde pode gerar discriminação e dano à reputação.
- **Recomendação:** trabalhe com 3 dias úteis. Se quiser usar o dobro, registre a fundamentação por escrito.
- **O que não muda:** o conteúdo das comunicações e o registro de 5 anos continuam iguais. Você só precisa declarar o porte no formulário.

## Se a comunicação é obrigatória

Ela é obrigatória quando o incidente puder afetar significativamente direitos dos titulares e envolver ao menos um critério do art. 5. Dado de saúde (sensível) cumpre o critério, e 3.000 titulares reforçam o caso. Tudo indica que há dever de comunicar.

Quem decide é o controlador, com o jurídico. Se decidirem não comunicar, registre a fundamentação (art. 10, §1, item 8). Cifra com chave não comprometida ou exposição comprovadamente sem acesso podem pesar a favor.

## Outros pontos

- **Outros reguladores:** verifique se há comunicação paralela com prazo próprio, por exemplo à ANS, se houver operação de saúde suplementar, ou a conselhos profissionais. Não cite prazo setorial de memória. Confirme na norma vigente.
- **Operador:** se um fornecedor estava envolvido, ele deve avisar o controlador. Identifique-o no formulário.
- **Evidências:** preserve logs, horários e hashes sem copiar dado pessoal para tickets ou e-mails.
- **ANPD pode pedir depois:** RoPA, RIPD e o relatório de tratamento do incidente (art. 8). Deixe-os prontos.

**Ressalvas:**
- Isto é apoio técnico, não parecer jurídico. A decisão de comunicar é do controlador.
- Os dados desta resposta vêm do material da skill. A Res. 15/2024 foi conferida na cópia do DOU em 24/10/2026, mas a revisão jurídica da skill ainda não foi feita. Confira o texto vigente em gov.br/anpd antes de protocolar. Não consegui acessar a internet para isso.

Se quiser, redijo o rascunho do formulário à ANPD e da mensagem aos titulares. Para isso preciso do tipo de dado, do que foi feito para conter o acesso, de quem foi o responsável e do que já se sabe sobre o acesso.