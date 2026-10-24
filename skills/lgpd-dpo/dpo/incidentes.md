# Incidentes de segurança com dados pessoais

## Conteúdo
- Regras durante um incidente
- 1. Triagem
- 2. Risco ou dano relevante
- 3. Prazos
- 4. Comunicação à ANPD
- 5. Comunicação aos titulares
- 6. Registro do incidente
- 7. Comunicações a outros reguladores
- 8. Depois do incidente

Base: LGPD, art. 48, e Res. CD/ANPD nº 15/2024 (Regulamento de Comunicação de Incidente de
Segurança). Confira a versão vigente antes de cravar prazos em documento oficial; a situação está em
[../normas/referencias.md](../normas/referencias.md).

## Regras durante um incidente

- Não copie os dados vazados para a conversa, tickets ou relatórios. Descreva por categoria e
  volume ("~3.200 registros com nome, telefone e histórico de compras").
- Não acesse o local do vazamento (fórum, bucket exposto, dump) para "conferir".
- Preserve evidência técnica (logs, horários, hashes de arquivos) sem extrair conteúdo pessoal.
- A decisão de comunicar é do controlador. A skill organiza os fatos, aplica os critérios e redige.

## 1. Triagem

Responda e registre, com data e hora:

1. **O que aconteceu?** Acesso não autorizado, exposição pública, envio ao destinatário errado,
   perda ou roubo de dispositivo, ransomware, erro de configuração, fraude interna.
2. **Afetou dados pessoais?** Se sim, anote **quando o controlador tomou conhecimento disso**: é o
   marco dos prazos (art. 6, §1).
3. **Quais dados e de quem?** Categorias, titulares (clientes, colaboradores, alunos, dependentes),
   volume estimado, quantos são crianças, adolescentes ou idosos.
4. **Está contido?** O que foi feito para parar (revogar credencial, fechar bucket, bloquear conta).
5. **Quem já sabe?** Operador envolvido (que deve avisar o controlador), titulares, imprensa.
6. **O agente é de pequeno porte?** Muda os prazos (item 3).

## 2. Risco ou dano relevante

Há obrigação de comunicar à ANPD e aos titulares quando o incidente puder acarretar risco ou dano
relevante (art. 4). Isso ocorre quando ele puder **afetar significativamente interesses e direitos
fundamentais** dos titulares **e**, cumulativamente, envolver pelo menos um destes critérios (art. 5):

- dados pessoais sensíveis;
- dados de crianças, adolescentes ou idosos;
- dados financeiros;
- dados de autenticação em sistemas;
- dados protegidos por sigilo legal, judicial ou profissional;
- dados em larga escala (número significativo de titulares, considerando volume, duração,
  frequência e extensão geográfica, art. 5, §2).

Afeta significativamente quando, entre outras situações, puder impedir o exercício de direitos ou o
uso de um serviço, ou causar danos materiais ou morais, como discriminação, violação à integridade
física, ao direito à imagem e à reputação, fraude financeira ou roubo de identidade (art. 5, §1).

Pesam contra a comunicação, e precisam de fundamentação registrada: dados cifrados com chave não
comprometida, exposição comprovadamente contida sem acesso, destinatário confiável que comprovou a
eliminação.

## 3. Prazos

| Ação | Prazo | Fonte |
|---|---|---|
| Comunicar à ANPD | 3 dias úteis do conhecimento de que o incidente afetou dados pessoais, ressalvado prazo de legislação específica | art. 6, *caput* e §1 |
| Complementar a comunicação | até 20 dias úteis da data da comunicação, de forma fundamentada | art. 6, §3 |
| Comunicar aos titulares | 3 dias úteis do mesmo marco | art. 9, *caput* |
| Juntar declaração de que os titulares foram comunicados | até 3 dias úteis após o fim do prazo de comunicação aos titulares | art. 9, §4 |
| Agente de pequeno porte | prazos da comunicação à ANPD, da complementação e da comunicação aos titulares contados em dobro, **se** o agente puder usar o regime diferenciado: não pode quem realiza tratamento de alto risco (Res. CD/ANPD nº 2/2022, art. 3, I), e o prazo em dobro não se aplica quando houver potencial comprometimento à integridade física ou moral dos titulares (Res. 2/2022, art. 14) | art. 6, §8; art. 9, §6 |
| Manter o registro do incidente (comunicado ou não) | mínimo de 5 anos da data do registro | art. 10 |

Contagem: exclua o dia do marco e conte apenas dias úteis, pulando sábados, domingos e feriados
nacionais (e, se o controlador quiser margem, também os locais). Mostre a conta: marco, dias
contados e data final. Na dúvida sobre a convenção de contagem, use a data mais cedo.

Informação ainda não apurada não justifica atraso: comunique o que se sabe e use a complementação.

## 4. Comunicação à ANPD

Feita por formulário eletrônico da ANPD (art. 6, §4), pelo encarregado com comprovante de vínculo,
ou por representante com procuração, apresentados junto com a comunicação (art. 6, §§5 e 6).

Conteúdo mínimo (art. 6, §2):

1. Natureza e categoria dos dados pessoais afetados.
2. Número de titulares afetados, discriminando crianças, adolescentes e idosos, quando aplicável.
3. Medidas técnicas e de segurança usadas para proteger os dados, antes e depois do incidente,
   observados os segredos comercial e industrial.
4. Riscos relacionados ao incidente, com os possíveis impactos aos titulares.
5. Motivos da demora, se a comunicação não for feita no prazo.
6. Medidas adotadas ou a adotar para reverter ou mitigar os efeitos sobre os titulares.
7. Data da ocorrência (quando possível) e data do conhecimento pelo controlador.
8. Dados do encarregado ou de quem represente o controlador.
9. Identificação do controlador e, se for o caso, declaração de que é agente de pequeno porte.
10. Identificação do operador, quando aplicável.
11. Descrição do incidente, incluindo a causa principal, se for possível identificá-la.
12. Total de titulares cujos dados são tratados nas atividades de tratamento afetadas.

Informação protegida por lei (segredo comercial, por exemplo) pode ter sigilo pedido de forma
fundamentada (art. 7). A ANPD pode pedir depois o RoPA, o RIPD e o relatório de tratamento do
incidente (art. 8): mantenha-os prontos.

## 5. Comunicação aos titulares

Conteúdo mínimo (art. 9):

1. Natureza e categoria dos dados afetados.
2. Medidas técnicas e de segurança usadas para proteger os dados.
3. Riscos e possíveis impactos.
4. Motivos da demora, se houver.
5. Medidas adotadas ou a adotar para reverter ou mitigar os efeitos, quando cabíveis.
6. Data do conhecimento do incidente.
7. Contato para informações e, quando aplicável, do encarregado.

Forma: linguagem simples, direta e individual quando os titulares forem identificáveis, pelos meios
usuais (telefone, e-mail, mensagem, carta) (art. 9, §§1 e 2). Se a comunicação individual for
inviável, divulgue no site, aplicativo, redes sociais e canais de atendimento, com visualização fácil,
por pelo menos três meses (art. 9, §3). Incluir recomendações para o titular se proteger pode ser
considerado boa prática (art. 9, §5).

Modelo base:

```text
Assunto: Aviso importante sobre seus dados

Olá, <nome>.

Em <data do conhecimento>, identificamos <descrição curta e verdadeira do ocorrido>. Os dados
envolvidos foram: <categorias que se aplicam a esta pessoa>.

O que já fizemos: <medidas de contenção e mitigação>.
Riscos para você: <riscos em linguagem simples>.
O que recomendamos: <ações práticas>. Não pedimos senha, código ou pagamento por mensagem.
Desconfie de contatos que digam o contrário.

Dúvidas: <canal de contato e do encarregado>.
```

## 6. Registro do incidente

Registre todo incidente com dados pessoais, mesmo os não comunicados, por pelo menos 5 anos
(art. 10). Conteúdo mínimo (art. 10, §1):

1. Data de conhecimento.
2. Descrição geral das circunstâncias.
3. Natureza e categoria dos dados afetados.
4. Número de titulares afetados.
5. Avaliação do risco e possíveis danos aos titulares.
6. Medidas de correção e mitigação, quando aplicável.
7. Forma e conteúdo da comunicação, se houve.
8. Motivos da ausência de comunicação, quando for o caso.

## 7. Comunicações a outros reguladores

O prazo da ANPD é ressalvado quando houver prazo em legislação específica (art. 6, *caput*). Setores
regulados podem ter comunicações próprias e paralelas: instituições do sistema financeiro (BCB),
seguradoras (SUSEP), telecomunicações (ANATEL), órgãos da administração pública federal (CTIR Gov),
saúde suplementar (ANS). Marque cada uma como `confirmar` e verifique prazo e canal na norma setorial
vigente antes de informar ao controlador. Não cite prazo setorial de memória.

## 8. Depois do incidente

- Causa-raiz técnica: se for código, rode uma auditoria focada no componente ([../SKILL.md](../SKILL.md)).
- Atualize o RoPA e o RIPD afetados.
- Revise o contrato se o incidente ocorreu no operador.
- Treinamento, se a causa foi humana.
