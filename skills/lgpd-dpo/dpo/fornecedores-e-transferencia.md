# Fornecedores, contratos, transferência internacional e aviso de privacidade

## Conteúdo
- Operador ou controlador?
- Due diligence de fornecedor
- Cláusulas mínimas do contrato de operador
- Transferência internacional
- Aviso de privacidade

## Operador ou controlador?

- **Operador**: trata dados em nome do controlador e segundo as instruções dele (art. 39):
  hospedagem, ERP ou sistema de gestão contratado, envio de SMS e e-mail, folha de pagamento
  terceirizada, provedor de IA usado via API sem uso próprio dos dados.
- **Controlador independente ou conjunto**: decide finalidades próprias: plataformas de anúncios
  que usam os dados para fins próprios, birôs de crédito, parceiros que atendem o titular por conta
  própria, bancos.

O papel muda o contrato e a responsabilidade (art. 42: o operador responde solidariamente quando
descumpre a lei ou as instruções lícitas do controlador). Classifique pelo uso real que o fornecedor
faz dos dados, não pelo nome no contrato. O operador também deve manter registro das operações
(art. 37) e pode indicar encarregado (art. 5, VIII; Res. CD/ANPD nº 18/2024).

## Due diligence de fornecedor

Copie e acompanhe:

```
Due diligence:
- [ ] Dados recebidos e finalidade; uso para fins próprios (treino de modelo, publicidade, benchmark)?
- [ ] Países de processamento e armazenamento, inclusive suboperadores
- [ ] Lista de suboperadores e regra de aviso de mudanças
- [ ] Segurança: criptografia, controle de acesso, certificações (ISO/IEC 27001/27701, SOC 2), testes de intrusão
- [ ] Incidentes: prazo para avisar o controlador (precisa caber nos 3 dias úteis dele; peça 24 a 48 h)
- [ ] Retenção e devolução ou eliminação ao fim do contrato
- [ ] Apoio ao atendimento de direitos dos titulares
- [ ] Encarregado ou contato de privacidade
```

## Cláusulas mínimas do contrato de operador

- Objeto, duração, natureza e finalidade do tratamento; categorias de dados e de titulares.
- Tratamento só conforme instruções documentadas do controlador.
- Confidencialidade das pessoas autorizadas.
- Medidas de segurança (art. 46) descritas ou anexadas.
- Suboperadores só com autorização e com as mesmas obrigações.
- Apoio a direitos dos titulares, RIPD e respostas à ANPD.
- Aviso de incidente em prazo definido, com o conteúdo que o controlador precisa para cumprir a
  Res. CD/ANPD nº 15/2024 (ver [incidentes.md](incidentes.md)).
- Eliminação ou devolução ao fim, com confirmação.
- Auditoria e prestação de informações.
- Transferência internacional: mecanismo aplicável (abaixo).
- Responsabilidade e indenização.

## Transferência internacional

Arts. 33 a 36 da LGPD. Primeiro veja o destino, depois o mecanismo:

1. **União Europeia e Espaço Econômico Europeu**: a Res. CD/ANPD nº 32/2026 reconheceu adequação
   (art. 33, I). A transferência para esses destinos não exige cláusulas-padrão. Confira a situação
   vigente em [../normas/referencias.md](../normas/referencias.md).
2. **Outros destinos sem decisão de adequação** (inclusive EUA): use outro mecanismo do art. 33,
   como:
   - cláusulas-padrão contratuais aprovadas pela Res. CD/ANPD nº 19/2024, incorporadas
     **integralmente e sem alteração**;
   - cláusulas contratuais específicas ou normas corporativas globais aprovadas pela ANPD;
   - outras hipóteses do art. 33, como a transferência necessária para execução de contrato a pedido
     do titular, ou o consentimento específico e destacado.

Na avaliação de um SaaS estrangeiro fora da UE/EEE, verifique se o contrato tem anexo com as
cláusulas-padrão brasileiras; as cláusulas da União Europeia sozinhas não bastam.

## Aviso de privacidade

Conteúdo (art. 9, mais o que se aplicar):

```
Aviso de privacidade:
- [ ] Identidade e contato do controlador
- [ ] Identidade e contato do encarregado, ou canal do titular para pequeno porte dispensado (art. 41, §1)
- [ ] Finalidades específicas, com a base legal de cada uma
- [ ] Dados tratados por finalidade (destaque sensíveis e dados de crianças e adolescentes)
- [ ] Forma e duração do tratamento (prazos ou critérios de retenção)
- [ ] Compartilhamentos: com quem (categorias ou nomes) e por quê
- [ ] Transferência internacional, quando houver
- [ ] Cookies e tecnologias de rastreamento (ou link para a política de cookies)
- [ ] Direitos do titular e como exercê-los
- [ ] Decisões automatizadas e direito de revisão, quando houver
- [ ] Data da última atualização
```

Linguagem clara, em camadas (resumo no topo, detalhe abaixo), sem "podemos compartilhar com
parceiros" genérico. Compare o aviso com o mapa de dados: todo terceiro e toda finalidade encontrados
no código precisam aparecer.
