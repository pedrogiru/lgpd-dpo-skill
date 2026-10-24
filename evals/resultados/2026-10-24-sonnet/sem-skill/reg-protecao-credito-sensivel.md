**Não. A proteção do crédito não serve de base legal para esse uso, e o mais seguro é não usar dados de saúde no score.**

**Por que a base legal não funciona**
- Dado de saúde é dado pessoal sensível (LGPD, art. 5º, II). Seu tratamento só pode se apoiar nas hipóteses do art. 11, que são mais restritas que as do art. 7º.
- A "proteção do crédito" está no art. 7º, X, e só vale para dados pessoais comuns. Ela não consta do art. 11.
- O legítimo interesse (art. 7º, IX) também não vale para dados sensíveis.
- A hipótese do art. 11, II, "g" (prevenção à fraude) é restrita à identificação e autenticação em sistemas eletrônicos. Ela não cobre a análise de risco de crédito.

**Obstáculo adicional: Lei do Cadastro Positivo**
A Lei 12.414/2011, art. 3º, §3º, II, veda o registro de informações sensíveis, e cita expressamente as de saúde, nas bases usadas para análise de risco. Se o score usa dados do cadastro positivo, o uso é proibido, qualquer que seja a base da LGPD. Vale confirmar o alcance exato com seu jurídico, porque ele depende de a informação entrar ou não nessas bases.

**A única base teórica é o consentimento**
Seria o consentimento específico e destacado, para finalidade determinada (art. 11, I). Na prática, ele é frágil por três motivos:
- Quem pede crédito dificilmente consente de forma livre quando a recusa significa perder a concessão.
- Isso fere o princípio da não discriminação (art. 6º, IX), e o risco de discriminação por saúde é alto. Há também o CDC e a possível atuação da ANPD e do Ministério Público.
- O titular pode revogar o consentimento a qualquer momento. Isso afeta o modelo e as decisões já tomadas.

**Outros pontos**
- **Minimização (art. 6º, III):** coletar a informação sobre doença crônica no cadastro já é questionável se ela não for estritamente necessária.
- **Decisão automatizada (art. 20):** o titular tem direito a revisão e a explicação dos critérios. Seria difícil justificar a saúde como critério.
- **Proxies:** variáveis que inferem saúde, como gastos em farmácia ou plano de saúde, também podem ser tratadas como dado sensível ou gerar discriminação indireta. Vale auditar o modelo.

**O que eu faria**
1. Remover os dados de saúde das features do score e parar de coletá-los se não houver outra finalidade legítima.
2. Se já foram coletados, avaliar a eliminação ou segregação deles e registrar isso.
3. Rodar um RIPD (relatório de impacto) sobre o modelo e testar a presença de proxies.
4. Usar variáveis permitidas, como renda, histórico de pagamento e comprometimento de renda.

Esta é uma análise geral. Antes de decidir, vale validar com seu DPO ou advogado de proteção de dados.