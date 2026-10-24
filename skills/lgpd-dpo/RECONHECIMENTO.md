# Reconhecimento e mapa de dados

## Conteúdo
- Frente 1: modelo de dados e dicionário de campos
- Frente 2: fluxos e terceiros
- Frente 3: armazenamento derivado e ciclo de vida
- Frente 4: direitos e transparência
- Seleção de domínios e setores
- Saídas

Objetivo: antes de procurar problemas, saber **quais dados pessoais existem, de quem são, por onde
entram, onde ficam, para onde vão e quando saem**. O mapa de dados é a base da cobertura e, depois,
do RoPA.

Rode as quatro frentes em paralelo (ou em sequência, sem agentes) e consolide no coordenador.

## Frente 1: modelo de dados

Procure em esquemas, migrations, ORMs, DTOs, tipos e validações: `schema.prisma`, `migrations/`,
`models/`, `entities/`, `.sql`, validadores do MongoDB, regras do Firestore, esquemas do Supabase,
zod/yup/joi, OpenAPI, GraphQL, protobuf e formulários do front.

### Dicionário de campos (português e inglês)

| Grupo | Nomes de campo típicos |
|---|---|
| Identificação | `nome`, `name`, `cpf`, `rg`, `cnh`, `passaporte`, `titulo_eleitor`, `pis`, `nis`, `cns`, `ctps`, `foto`, `selfie` |
| Contato | `email`, `telefone`, `phone`, `celular`, `whatsapp`, `endereco`, `address`, `cep` |
| Demografia | `nascimento`, `birth_date`, `idade`, `sexo`, `genero`, `estado_civil`, `nacionalidade` |
| Sensíveis (art. 5, II) | `raca`, `etnia`, `religiao`, `opiniao_politica`, `sindicato`, `filiacao`, `orientacao_sexual`, `biometria`, `template_biometrico`, `face`, `digital`, `dna`, `cid`, `diagnostico`, `laudo`, `exame`, `deficiencia`, `pcd`, `gestante`, `medicamento`, `alergia` |
| Trabalho e RH | `matricula`, `cargo`, `salario`, `ponto`, `marcacao`, `atestado`, `aso`, `afastamento`, `dependentes`, `pensao`, `desconto_sindical`, `avaliacao_desempenho`, `curriculo`, `antecedentes` |
| Financeiro | `cartao`, `card`, `conta`, `agencia`, `chave_pix`, `renda`, `score`, `limite`, `inadimplencia`, `scr`, `pep` |
| Educação | `ra`, `matricula_aluno`, `inep`, `boletim`, `nota`, `frequencia`, `historico_escolar`, `responsavel` |
| Telecom e dispositivo | `imei`, `imsi`, `msisdn`, `cdr`, `erb`, `ip`, `device_id`, `advertising_id`, `fcm_token`, `user_agent` |
| Localização | `lat`, `lng`, `geo`, `gps`, `rota`, `placa`, `checkin` |
| Comportamento | `eventos`, `historico_navegacao`, `compras`, `interesses`, `segmento`, `perfil_marketing` |
| Acesso a espaços | `visitante`, `unidade`, `bloco`, `crachá`, `cftv`, `entrada`, `saida` |
| Autenticação | `senha`, `password`, `hash`, `token`, `otp`, `mfa`, `pergunta_secreta` |

Campos livres (`observacao`, `notes`, `anotacoes`, `descricao`, `mensagem`, `motivo`) recebem dado
sensível digitado à mão. Marque como potencialmente sensíveis.

Arquivos também contam: upload de documentos, comprovantes, atestados, fotos, áudios, PDFs gerados.

### Categorias

| Categoria | Exemplos | Bases legais a considerar |
|---|---|---|
| `comum` | nome, e-mail, telefone, endereço | art. 7 |
| `identificador_governamental` | CPF, RG, CNH, CNS, PIS, NIS | art. 7 (atenção à necessidade) |
| `sensivel_saude` | CID, exame, atestado, medicamento, gestação, deficiência | art. 11 |
| `sensivel_outros` | raça/etnia, religião, opinião política, sindicato, vida sexual, genético, biométrico | art. 11 |
| `crianca_adolescente` | dados de menores de 18 anos, como titulares ou dependentes | arts. 7 ou 11, observado o art. 14; ECA Digital |
| `idoso` | dados de pessoas com 60 anos ou mais | arts. 7 ou 11 (agrava risco em incidente) |
| `financeiro` | cartão, conta, renda, inadimplência | art. 7 (proteção do crédito, contrato, obrigação legal) |
| `autenticacao` | senha, token, OTP | art. 7 (execução de contrato, legítimo interesse); biometria para autenticação: art. 11, II, "g" |
| `localizacao` | GPS, IP, rota, placa | art. 7 |
| `comportamental` | navegação, compras, perfil de marketing | art. 7 (atenção ao art. 20) |

Dado inferido conta: compras de medicamentos, frequência a um templo, rota até uma clínica ou o nome
de um evento de analytics podem revelar dado sensível.

## Frente 2: fluxos e terceiros

- Integrações de saída: clientes HTTP, SDKs, webhooks, filas, e-mail, SMS, WhatsApp, gateways de
  pagamento, CRMs, ERPs, BI, ferramentas de suporte, birôs de crédito, órgãos públicos.
- Front e apps: tags e pixels (Meta, Google Ads/GA4, TikTok, LinkedIn), Google Tag Manager, SDKs
  mobile (Firebase, AppsFlyer, Adjust, OneSignal), session replay, chat widgets.
- IA: chamadas a provedores de LLM, transcrição, OCR, embeddings e bancos vetoriais.
- Para cada terceiro: campos recebidos, se recebe dado sensível, onde processa (só se visível em
  config/IaC), e se age como operador ou controlador independente (papel é questão contratual).

## Frente 3: armazenamento derivado e ciclo de vida

- Logs (`console.log`, `logger.info`, middlewares que logam body/query), APM, rastreadores de erro,
  traces.
- Caches, índices de busca, réplicas, data lake, planilhas e relatórios exportados.
- Backups e snapshots configurados no repositório (IaC, scripts de dump).
- Jobs de limpeza, TTLs, soft delete, rotinas de anonimização, prazos codificados.
- Seeds e fixtures: dados reais copiados para homologação ou para a máquina de desenvolvedores.

## Frente 4: direitos e transparência

- Telas e endpoints de conta: ver, editar, excluir, exportar, revogar consentimento, preferências,
  descadastro.
- Registro de consentimento: quem, quando, versão do texto, canal e finalidade.
- Aviso de privacidade e banner de cookies no código: texto, versão, se o banner bloqueia tags não
  necessárias antes da escolha.
- Canal do titular e identificação do encarregado, quando publicados no próprio sistema.
- Trilhas de auditoria de acesso a dados sensíveis.

## Seleção de domínios e setores

Carregue na fase de caça:

| Sinal no mapa de dados | Arquivo |
|---|---|
| Pixel, tag, SDK de analytics/marketing, mensageria, CRM, provedor em outro país | [dominios/terceiros-e-rastreamento.md](dominios/terceiros-e-rastreamento.md) |
| Chamada a LLM, OCR, transcrição, embeddings; regra ou modelo que aprova, recusa, precifica ou classifica pessoas | [dominios/ia-e-decisoes-automatizadas.md](dominios/ia-e-decisoes-automatizadas.md) |
| `sensivel_saude` em volume, ou o produto é de saúde | [setores/saude.md](setores/saude.md) |

Sinais de outros setores (banco, seguradora, operadora de telecom, escola, órgão público, RH,
condomínio) ainda não têm arquivo próprio. Registre o setor em "Fatos fora do código" e trate como
`precisa_validacao` as conclusões que dependem da norma setorial.

## Saídas

Grave `inventario-dados.md` com:

1. **Tabela de dados**: entidade, campo, categoria, titular, origem, arquivo de definição.
2. **Mapa de fluxo**: `origem → processamento → destino`, marcando terceiros e armazenamentos
   derivados (Mermaid `flowchart LR` quando ajudar).
3. **Terceiros**: nome, campos recebidos, categoria mais sensível, papel provável, país (se visível).
4. **Unidades de cobertura**: uma por `fluxo × etapa do ciclo de vida × domínio`, com id estável
   (ex.: `checkout/coleta/geral`, `checkout/compartilhamento/terceiros`, `leads/retencao/geral`).
   Cada unidade termina como `coberta`, `lacuna` (com motivo) ou `fora_do_escopo`.
5. **Domínios e setores selecionados**, com o sinal que motivou cada um.
6. **Fatos fora do código** a confirmar com DPO, jurídico ou infra: bases legais, contratos,
   regiões de nuvem, política de retenção, porte, setor regulado.
