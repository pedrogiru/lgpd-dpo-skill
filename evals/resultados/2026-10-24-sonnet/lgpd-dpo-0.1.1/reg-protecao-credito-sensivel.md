**Não com essa base legal.** O art. 7º, X (proteção do crédito) está no rol dos dados pessoais comuns, e dado de saúde é sensível. O art. 11 tem rol próprio e taxativo, que não inclui proteção do crédito, legítimo interesse nem execução de contrato. Citar o art. 7º, X, para esse dado é um erro de enquadramento. Esta resposta não substitui parecer jurídico e é orientação técnica para levar ao jurídico e ao encarregado.

**Por que o problema vai além da base legal**

1. **Art. 11.** O tratamento só se sustenta com consentimento específico e destacado (II, "a" não se aplica aqui, e sim o inciso I) ou com uma das hipóteses do inciso II. Nenhuma delas descreve "estimar risco de inadimplência". O art. 11, II, "g" (prevenção à fraude) é restrito à segurança do titular e à autenticação em cadastro, e não cobre score de crédito.
2. **Consentimento não resolve de forma segura.**
   - Se o score ou a oferta dependerem dele, é difícil sustentar que seja livre (art. 5º, XII).
   - Mesmo com consentimento, o tratamento continua sujeito aos princípios do art. 6º.
3. **Não discriminação (art. 6º, IX).** Usar doença crônica para precificar ou negar crédito é o caso típico de uso discriminatório. Também é questionável pela finalidade e pela necessidade (art. 6º, I e III), porque o nexo entre a doença e a capacidade de pagamento é frágil e difícil de justificar.
4. **Lei do Cadastro Positivo (Lei 12.414/2011).** Pelo que me lembro, o art. 3º, §3º, II veda anotar informações sensíveis, incluindo saúde, em bancos de dados de score e histórico de crédito. Não conferi o texto vigente nesta resposta, então confirme na fonte oficial antes de citar. Como é norma setorial, trate como ponto a validar com o jurídico.
5. **Art. 20.** O score é decisão automatizada. O titular pode pedir revisão e explicação dos critérios, e a empresa precisa informar os critérios e procedimentos. Se o critério incluir saúde, isso fica exposto, e a ANPD pode auditar o modelo.
6. **Proxies.** Mesmo sem o campo de saúde, variáveis que o substituam (por exemplo, gastos com farmácia ou medicamentos de uso contínuo) podem ser tratadas como dado sensível inferido, com o mesmo problema.

**O que recomendo**

- Tire o campo de saúde do modelo e dos dados de treino.
- Se o cadastro coleta esse dado, revise a necessidade. Se não há finalidade legítima para ele, não colete (minimização, art. 6º, III).
- Se já existe base histórica, faça um inventário de onde o dado entrou (features, logs, bases de treino) e defina o descarte. Antes de eliminar, confira se há guarda legal.
- Faça um RIPD. A ANPD pode exigi-lo, e o caso reúne dado sensível e decisão automatizada, que são critérios de alto risco.
- Leve ao jurídico e ao encarregado as dúvidas sobre a Lei 12.414, as normas do BACEN sobre crédito e o uso de proxies.

Se você me indicar o repositório do modelo ou do cadastro, consigo verificar em quais pontos o dado de saúde entra (campo, feature, pipeline de treino) e apontar o que precisa sair.