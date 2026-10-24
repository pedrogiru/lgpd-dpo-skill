# Exemplo: prazo e conteúdo da comunicação de incidente

> Saída real da skill `lgpd-dpo` v0.1.1 (Claude Code 2.1.310, Sonnet, 24/10/2026) no caso
> `incidente-prazo` dos evals. Cenário fictício. Texto reproduzido sem edição.

**Pedido:** Sou o encarregado. Na quinta-feira, 19/11/2026, confirmamos que um acesso indevido ao nosso sistema expôs dados de saúde de cerca de 3.000 clientes. Até quando temos que comunicar a ANPD e os titulares, e o que a comunicação precisa conter? Se formos agente de pequeno porte, muda alguma coisa?

---

**Atenção à data.** Hoje é 24/10/2026 e você informou 19/11/2026, que ainda não chegou. Pode ser erro de digitação ou de data de sistema. Se o certo for a quinta-feira anterior (22/10), o prazo vence na terça, 27/10. Confirme a data de conhecimento antes de agir. Os cálculos abaixo usam 19/11/2026 como você escreveu.

## Prazos (Res. CD/ANPD nº 15/2024)

O marco é o momento em que vocês souberam que o incidente afetou dados pessoais, que você diz ser 19/11 (arts. 6, §1, e 9). Conte só dias úteis e exclua o dia do marco. **20/11/2026 (sexta) é feriado nacional**, o Dia da Consciência Negra, então não conta.

| Ação | Prazo | Data final |
|---|---|---|
| Comunicar à ANPD | 3 dias úteis (23, 24 e 25/11) | **25/11/2026 (quarta)** |
| Comunicar aos titulares | 3 dias úteis, mesmo marco | **25/11/2026 (quarta)** |
| Declaração à ANPD de que os titulares foram comunicados | até 3 dias úteis depois do prazo aos titulares | 30/11/2026 |
| Complementar a comunicação | 20 dias úteis **da data em que comunicar** | 23/12/2026, se comunicar em 25/11 |
| Registro interno do incidente | guardar por no mínimo 5 anos | — |

Não espere a investigação terminar. Comunique o que já sabem e use a complementação para o resto.

**Precisa comunicar?** Provavelmente sim. Dado de saúde é sensível, e o art. 5 da Res. 15/2024 pede um critério como esse junto com o risco de afetar significativamente os direitos dos titulares. A exposição de dado de saúde pode causar discriminação e fraude. Se concluírem que não é comunicável, por exemplo porque os dados estavam cifrados e a chave não foi comprometida, a decisão é do controlador e precisa de fundamentação no registro. Na dúvida, comunique.

## Conteúdo da comunicação

**À ANPD** (formulário eletrônico, enviado por você com comprovante de vínculo; art. 6, §2):
1. Natureza e categoria dos dados afetados.
2. Número de titulares, separando crianças, adolescentes e idosos.
3. Medidas de segurança usadas antes e depois do incidente.
4. Riscos e possíveis impactos aos titulares.
5. Motivos da demora, se houver.
6. Medidas adotadas ou a adotar para mitigar.
7. Data da ocorrência (se possível) e data do conhecimento.
8. Dados do encarregado.
9. Identificação do controlador e, se for o caso, declaração de pequeno porte.
10. Identificação do operador, se houver.
11. Descrição do incidente e causa principal, se identificada.
12. Total de titulares cujos dados são tratados nas atividades afetadas.

**Aos titulares** (art. 9): os itens 1 a 5 acima, mais a data do conhecimento e o contato para dúvidas (com o encarregado, quando aplicável). A forma é linguagem simples e comunicação individual (e-mail, mensagem, telefone ou carta). Só se a individual for inviável, divulguem no site, no aplicativo e nos canais de atendimento por pelo menos 3 meses. Orientações de autoproteção, como desconfiar de contato pedindo senha, código ou pagamento, são boa prática.

Não copiem dados vazados para tickets ou relatórios. Descrevam por categoria e volume.

## Pequeno porte

Muda, mas só se vocês puderem usar o regime diferenciado da Res. CD/ANPD nº 2/2022. Se puderem, os prazos de comunicação à ANPD, de complementação e de comunicação aos titulares dobram: 6 dias úteis, ou **30/11/2026**.

- **Quem não pode usar o regime:** quem faz tratamento de alto risco, ou ultrapassa os limites de receita sozinho ou no grupo econômico (art. 3).
- **Risco do critério de alto risco:** o art. 4 combina um critério geral (larga escala ou efeito significativo nos direitos) com um específico (dado sensível, por exemplo). Dado de saúde cumpre o específico. Se 3.000 clientes configurarem larga escala no tratamento de vocês, vale o regime comum.
- **O que faço:** trate **25/11** como data-limite e só use o dobro se o jurídico confirmar o enquadramento por escrito. O prazo em dobro não muda o conteúdo da comunicação.
- **Outros efeitos:** o pequeno porte pode ser dispensado de ter encarregado, mas você já foi indicado e a comunicação sai por você. O registro de 5 anos também não muda.

## Fora da LGPD

Se a empresa for operadora de plano de saúde ou se enquadrar em outro setor regulado, pode haver comunicação paralela, por exemplo à ANS. Não conferi prazo nem canal setorial. Vejam isso com o jurídico.

Não substitui parecer jurídico. A decisão de comunicar, o enquadramento como pequeno porte e a aceitação de risco são do controlador, com você e o jurídico. Consultei a Res. 15/2024 e a Res. 2/2022 nas referências da skill (verificadas em 24/10/2026), mas não reabri o texto oficial na ANPD ou no DOU. Confira lá antes de protocolar.

Se quiser, redijo o rascunho do e-mail aos titulares e o roteiro do formulário da ANPD. Para isso preciso das categorias de dados afetados, do que já foi contido e se há menores ou idosos entre os 3.000.