## Resposta curta

- **Nuvem na Irlanda: em regra, não precisa das cláusulas-padrão (CCP) da ANPD.** A Irlanda é da UE, e a Res. CD/ANPD nº 32/2026 reconheceu a adequação da UE e do EEE como mecanismo do art. 33, I da LGPD.
- **E-mail marketing com servidores nos EUA: sim, precisa de um mecanismo do art. 33.** Os EUA não têm decisão de adequação da ANPD. As CCP da Res. CD/ANPD nº 19/2024 são o caminho mais direto.

A situação da Res. 32/2026 consta como "vigente (fonte secundária)" na base que consultei, com verificação em 24/10/2026. Antes de documentar isso oficialmente, confira o texto no gov.br/anpd ou no DOU. Esta resposta é orientação técnica e não substitui parecer jurídico.

## 1. Nuvem na Irlanda

- A adequação cobre transferências para UE/EEE. Não há CCP para assinar por causa do destino.
- A adequação não cobre transferências feitas exclusivamente para segurança pública, defesa nacional, segurança do Estado ou investigação e persecução penal. Isso não costuma ser o caso aqui.
- **Verifique onde os dados realmente ficam.** "Região Irlanda" não elimina o problema se o provedor usa suboperadores, backup, suporte ou monitoramento fora da UE/EEE. Um acesso remoto de suporte nos EUA também pode ser transferência internacional. Peça ao provedor a lista de países de processamento e de suboperadores.
- O contrato de operador (art. 39) continua necessário, independente das CCP. Ele deve ter instruções, segurança, suboperadores, aviso de incidente com prazo curto e eliminação ao fim.

## 2. E-mail marketing nos EUA

**Papel da ferramenta.** Normalmente ela é operadora. Se ela usar os dados para fins próprios (publicidade, benchmark, treino de modelo), pode ser controladora, e isso muda o contrato. Classifique pelo uso real.

**Mecanismos do art. 33 possíveis:**

1. **CCP da Res. 19/2024.** Devem ser incorporadas integralmente e sem alteração. Os prazos de adaptação dos contratos antigos já acabaram (ago/2025).
2. Cláusulas específicas ou normas corporativas globais aprovadas pela ANPD.
3. Outras hipóteses do art. 33, como execução de contrato a pedido do titular ou consentimento específico e destacado. Para uma ferramenta contratada pela empresa, são frágeis.

**Ponto prático:** muitos SaaS americanos oferecem só as cláusulas-padrão da UE no DPA. Elas sozinhas não bastam. Peça um anexo com as CCP brasileiras. Se o fornecedor não oferecer, pergunte se ele aceita assinar ou se há alternativa de contratar com processamento na UE/EEE.

## Fatos que mudam a resposta

- **Que dados vão para a ferramenta?** Se houver dado de saúde, as exigências sobem. O art. 11 não admite legítimo interesse, e o art. 11, §4 veda compartilhar dado de saúde com vantagem econômica. Segmentar campanha por condição de saúde é um ponto para levar ao jurídico. Se for só nome e e-mail, o risco é menor.
- **Qual a base legal do marketing?** Consentimento, legítimo interesse ou outra. Isso é decisão sua, documentada, e o código não prova.
- **Qual o seu porte?** A condição de agente de pequeno porte (Res. 2/2022) muda prazos e documentação, não a necessidade de mecanismo para os EUA.

## Documentação

- Atualize o aviso de privacidade com a transferência internacional (art. 9).
- Registre as duas operações no RoPA (art. 37), com país de destino e mecanismo usado.
- Guarde o contrato e as CCP assinadas como prova de responsabilização.

Se me disser qual ferramenta de e-mail e qual provedor de nuvem vão usar, posso montar uma checklist de due diligence específica para cada um.