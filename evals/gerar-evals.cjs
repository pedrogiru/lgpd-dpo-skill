#!/usr/bin/env node
"use strict";
// Fonte dos casos: gera evals/evals.json. Edite este arquivo, não o JSON, e rode
//   node evals/gerar-evals.cjs            (grava evals/evals.json)
//   node evals/gerar-evals.cjs <saida>    (grava em outro lugar)
// Depois: node evals/score.cjs --check
//
// As regex são casadas por score.cjs contra texto normalizado (NFKD, sem acentos, sem "*",
// sem o ponto de "art."/"Res."), com flag "i". Por isso aqui se escreve "nao", "uteis" etc.
//
// Ajudantes:
//   NEG     lookbehind: não pode haver negação (nao, nunca, nem, jamais) nas ~60 posições
//           anteriores da mesma frase. Usado no início das regex de nao_deve_conter, para
//           "não exige X" não ser lido como "exige X".
//   G(n)    lacuna de até n caracteres na mesma frase sem atravessar negação.
//   CH      caractere da mesma frase (tudo menos quebra de linha, ";" e ponto final).
//   GLOBAIS regex acrescentadas a nao_deve_conter de todos os casos: declarar conformidade
//           com a LGPD e estimar valor de multa.
const fs = require("fs");
const path = require("path");
const r = String.raw;

const NEGW = r`(?:nao|nunca|nem|jamais)`;
// Caractere "da mesma frase": qualquer um, exceto fim de linha, ";" e ponto final (ponto seguido
// de espaço ou fim). Ponto dentro de número ("8.212") não encerra a frase.
const CH = r`(?:[^;.\n]|\.(?=\S))`;
// Não pode haver negação nas ~60 posições anteriores, na mesma frase.
const NEG = r`(?<!\b${NEGW}\b${CH}{0,60})`;
// Lacuna de até n caracteres, na mesma frase, sem passar por negação.
const G = (n) => r`(?:(?!\b${NEGW}\b)${CH}){0,${n}}`;

const DATA = (d, m, mes) => r`\b${d}\s*[\/.-]\s*${m}\b|\b${d}\s+de\s+${mes}`;
const DIAS_UTEIS = (num, extenso) => r`\b(?:${num}|${extenso})\s*(?:\(${extenso}\)\s*)?dias?\s+uteis`;
const ART = (n) => r`\bart(?:igo)?s?\.?\s*${n}o?\b`;
const PAR = (art, par) =>
  r`\bart(?:igo)?\.?\s*${art}o?\s*,?\s*(?:§|par(?:agrafo)?\.?)\s*${par}o?\b|§\s*${par}o?\s*(?:,\s*)?do\s+art(?:igo)?\.?\s*${art}\b`;

const GLOBAIS = [
  // declarar conformidade
  r`${NEG}\b(?:esta|estao|estara|estarao|estaria|estariam|fica|ficam|ficara|ficarao|ficaria|ficariam|encontra-se|encontram-se|e\s+considerad[ao]s?|pode\s+ser\s+considerad[ao]s?)\s+(?:\w+\s+){0,2}(?:em\s+(?:plena\s+|total\s+|integral\s+)?conformidade|totalmente\s+adequad[ao]s?|plenamente\s+adequad[ao]s?|adequad[ao]s?|conformes?)\s+(?:com\s+)?(?:a\s+)?lgpd`,
  r`${NEG}\b(?:cumpre|cumprem|atende|atendem)\s+(?:integralmente|totalmente|plenamente|100%)\s+(?:a\s+)?lgpd`,
  r`${NEG}\b100\s*%\s+(?:em\s+conformidade|conformes?|adequad[ao]s?|compliance)`,
  // estimar multa
  r`${NEG}\b(?:multa|penalidade|sancao|exposicao)\s+(?:\w+\s+){0,2}(?:estimad[ao]|provavel|esperad[ao]|calculad[ao]|projetad[ao]|potencial\s+de)${G(60)}(?:r\$|\d+(?:[.,]\d+)?\s*%|\d+\s*(?:mil|milhoes|milhao))`,
  r`${NEG}\b(?:estimamos|estimo|estimativa|calculamos|projetamos|estimada\s+em)${G(60)}\bmulta`,
  r`${NEG}r\$\s*[\d.,]+\s*(?:mil|milhoes|milhao|mi|bi)?${G(30)}\b(?:de|em|na)\s+multa`,
  r`${NEG}\b(?:pagariam|pagaria|pagarao|pagara|seriam\s+multad[ao]s|seria\s+multad[ao])${G(40)}(?:r\$|\d+(?:[.,]\d+)?\s*%)`,
];

const casos = [];
const add = (c) => casos.push(c);

// ---------------------------------------------------------------- código
add({
  id: "varejo-checkout",
  tipo: "codigo",
  query:
    "Faz uma revisão de LGPD no código do checkout da nossa loja virtual (este repositório)? Quero saber o que está errado e o que corrigir antes do lançamento.",
  files: ["fixtures/varejo-checkout"],
  expected_behavior: [
    "Aponta que o CPF trafega na query string da URL de rastreio (src/routes/pedidos.ts e src/web/rastreio.ts) e acaba no log de acesso combined do morgan (src/server.ts), histórico do navegador e eventuais referers; recomenda POST ou identificador opaco.",
    "Aponta que o logger do checkout grava req.body inteiro (CPF, telefone, e-mail, endereço) em logs/app.log, acessível a toda a engenharia e ao suporte e retido por 90 dias (src/routes/checkout.ts + src/lib/logger.ts); recomenda lista de campos permitidos ou mascaramento.",
    "Aponta que o evento Purchase vai para a API de Conversões da Meta com e-mail e telefone em SHA-256 sem segredo, junto com IP, user agent, fbp e valor da compra (src/integrations/meta-capi.ts), e explica que o hash simples continua sendo dado pessoal (é pseudonimização, não anonimização; serve justamente para casar o titular).",
    "Aponta que o envio à Meta (e o Pixel em src/web/pixel.ts) ocorre sem verificar consentimento ou outra base e sem relação com a escolha de marketing do cliente; trata base legal e transparência como algo que o controlador precisa validar.",
    "Aponta que o checkbox de marketing vem pré-marcado (defaultChecked em src/web/CheckoutForm.tsx), o que não configura manifestação inequívoca (LGPD art. 5º, XII, e art. 8º).",
    "Cita arquivo e linha (ou trecho) como evidência de cada achado, sem copiar para o relatório o CPF de exemplo que aparece no código.",
    "Não aponta como problema o log de auditoria que mascara o CPF, os cookies sid e carrinho_id nem a chave HMAC com pepper usada para deduplicação interna.",
    "Não declara que a loja fica em conformidade depois das correções nem estima multa.",
  ],
  deve_conter: [
    r`cpf[^\n]{0,160}(?:query\s*string|querystring|\burl\b|\?cpf|req\.query|parametros?\s+(?:de\s+)?(?:url|consulta|get))|(?:query\s*string|querystring|\burl\b|req\.query)[^\n]{0,160}\bcpf`,
    r`(?:req\.body|\bbody\b|corpo\s+(?:da\s+)?(?:requisicao|request)|payload)[^\n]{0,160}(?:\blog|logger|logad|registrad|gravad)|(?:\blog|logger|loga|registra|grava)[^\n]{0,160}(?:req\.body|\bbody\b|corpo\s+(?:da\s+)?(?:requisicao|request)|payload)`,
    r`\bmeta\b|facebook|\bcapi\b|conversions?\s+api|api\s+de\s+conversoes`,
    r`(?:hash|sha-?256)[^\n]{0,240}(?:\bnao\s+(?:e|torna|significa|equivale|garante|configura)\b[^\n]{0,40}anonim|continua(?:m)?\s+(?:sendo\s+)?(?:um\s+)?dados?\s+pesso|seguem?\s+sendo|permanece(?:m)?|ainda\s+(?:e|sao)\s+dados?|pseudonim|reversivel|reidentific)|(?:pseudonim|\bnao\s+(?:e|sao)\s+anonim)[^\n]{0,240}(?:hash|sha)`,
    r`pre-?\s*marcad|pre-?\s*selecionad|marcad[oa]\s+por\s+padrao|defaultchecked|ja\s+vem\s+marcad|vem\s+marcad|checked\s+por\s+padrao`,
  ],
  nao_deve_conter: [
    r`${NEG}(?:audit-log|registrarpedido|mascararcpf|log\s+de\s+auditoria|trilha\s+de\s+auditoria)${G(150)}(?:\bvaza|vazamento|exposicao\s+do\s+cpf|sem\s+mascar|em\s+claro|texto\s+(?:puro|claro)|cpf\s+completo|\bnao\s+mascara|\bviola)`,
    r`${NEG}(?:\bsid\b|carrinho_id|cookies?\s+de\s+(?:sessao|carrinho))${G(120)}(?:exige|exigem|requer|requerem|depende(?:m)?\s+de|precisa(?:m)?\s+de|dependeria(?:m)?\s+de)\s+(?:de\s+)?(?:o\s+|um\s+)?consentimento`,
    r`${NEG}(?:dedup|pepper|hmac|chavededuplicacao)${G(150)}(?:insegur|fraco|insuficiente|deve\s+ser\s+removid|\bviola|e\s+um\s+problema)`,
    // copiar o CPF de exemplo do código para o relatório (mesmo fictício, mede vazamento)
    r`111\.?222\.?333-?00`,
  ],
  armadilhas: [
    "src/lib/audit-log.ts mascara o CPF (***.***.***-00, só os 2 últimos dígitos) antes de logar: é a correção que se espera do outro logger, não um achado.",
    "Os cookies sid e carrinho_id (src/middleware/sessao.ts) são estritamente necessários para login e carrinho, httpOnly, secure e de curta duração; exigir consentimento para eles é falso positivo.",
    "src/lib/dedup.ts usa HMAC-SHA256 com pepper vindo do cofre de segredos, só para deduplicação interna, sem envio a terceiros. Continua sendo dado pessoal pseudonimizado, mas é boa prática; não é achado. O contraste com o SHA-256 sem segredo enviado à Meta é o ponto do caso.",
  ],
  fontes: [
    "LGPD art. 5º, XII (consentimento livre, informado e inequívoco) e art. 8º",
    "LGPD art. 6º, III (necessidade) e art. 46 (segurança)",
    "LGPD art. 12 e art. 13, §4º (anonimização x pseudonimização)",
    "LGPD art. 7º, I e IX, e art. 10 (base para envio a plataforma de anúncios; decisão do controlador)",
    "LGPD art. 9º (transparência sobre compartilhamento)",
  ],
});

add({
  id: "rh-portal",
  tipo: "codigo",
  query:
    "Preciso de uma auditoria de LGPD da API do nosso portal de RH (este repositório) antes de liberar para os gestores. O que você encontra?",
  files: ["fixtures/rh-portal"],
  expected_behavior: [
    "Aponta que GET /gestor/equipe/:colaboradorId/atestados devolve o CID do atestado ao gestor (src/routes/atestados.ts); CID é dado de saúde (sensível) e o gestor só precisa de período e dias de afastamento.",
    "Aponta que o template biométrico do ponto (tabela ponto_biometria, src/ponto/biometria.ts) pode ser lido por qualquer usuário autenticado (GET /ponto/biometria/:colaboradorId usa só o middleware autenticado) e fica sem cifragem específica.",
    "Aponta que a base declarada no comentário, 'execução do contrato (art. 7º, V)', não serve para dado biométrico, que é sensível: as hipóteses são as do art. 11 (ex.: II, 'a' ou 'g'), e a escolha é do controlador (precisa de validação).",
    "Aponta que currículos e candidaturas (incluindo o banco de talentos) não têm prazo nem rotina de eliminação: o agendador só limpa sessões e a folha.",
    "Não aponta como problema o endpoint do gestor que mostra apenas apto/inapto e validade do ASO, com a ficha clínica restrita ao médico do trabalho.",
    "Não aponta como problema a guarda da folha de pagamento com prazo definido pelo jurídico e anonimização posterior; no máximo pede para confirmar o prazo.",
    "Não declara conformidade nem estima multa.",
  ],
  deve_conter: [
    r`\bcid\b[^\n]{0,160}gestor|gestor[^\n]{0,160}\bcid\b`,
    r`biometri|template`,
    r`execucao\s+(?:d[eo]\s+)?contrato[^\n]{0,220}(?:\bnao\b|inadequad|incorret|insuficiente|invalid|equivocad|art(?:igo)?\.?\s*11)|(?:\bnao\b|inadequad|incorret|equivocad)[^\n]{0,120}execucao\s+(?:d[eo]\s+)?contrato`,
    ART(11),
    r`(?:biometri|template)[^\n]{0,220}(?:qualquer\s+(?:usuario|colaborador|pessoa|um)|autenticad|sem\s+restricao|controle\s+de\s+acesso|acesso\s+(?:irrestrito|amplo|aberto|indevido)|exigirpapel|papel|autoriza|criptograf|cifr)|(?:qualquer\s+(?:usuario|colaborador)\s+autenticad|sem\s+restricao\s+de\s+acesso)[^\n]{0,220}(?:biometri|template)`,
    r`(?:curricul|candidat|banco\s+de\s+talentos)[^\n]{0,220}(?:elimina|exclus|retencao|prazo|descart|expurg|indefinid|indetermin|apag)|(?:elimina|exclus|retencao|descart|expurg)[^\n]{0,220}(?:curricul|candidat)`,
  ],
  nao_deve_conter: [
    r`${NEG}(?:resultado\s+do\s+aso|\baso\b|apto\s*\/\s*inapto)${G(150)}(?:indevid|\bviola\b|violacao|vazamento|\bvaza\b|excessiv|nao\s+deveria)`,
    r`${NEG}(?:folha(?:\s+de\s+pagamento)?|retencao_folha|expurgarfolhavencida)${G(120)}(?:\bviola\b|excessiv|ilegal|deve(?:m)?\s+ser\s+(?:eliminad|apagad|excluid)|sem\s+base\s+legal)`,
  ],
  armadilhas: [
    "src/routes/aso.ts entrega ao gestor só tipo, resultado (apto/inapto) e validade; exames e anamnese ficam para o papel medico_trabalho, com registro de auditoria. É o desenho correto (NR-07 e necessidade); apontar como vazamento de dado de saúde é falso positivo.",
    "src/folha/retencao.ts guarda a folha por prazo definido pelo jurídico para obrigações trabalhistas, previdenciárias e fiscais (art. 16, I) e depois anonimiza. Pedir para confirmar o prazo é aceitável; dizer que a guarda viola a LGPD não é.",
  ],
  fontes: [
    "LGPD art. 5º, II (dado sensível: saúde e biometria) e art. 11 (hipóteses; não inclui execução de contrato)",
    "LGPD art. 6º, III (necessidade) e art. 46 (segurança)",
    "LGPD art. 15 e art. 16 (término do tratamento e conservação)",
    "Res. CFM nº 1.658/2002 (CID no atestado só com autorização do paciente) — confirmar redação vigente",
    "NR-07 (PCMSO e ASO) — confirmar itens",
  ],
});

add({
  id: "fintech-kyc-exclusao",
  tipo: "codigo",
  query:
    "Nosso app de conta digital (este repositório) tem o botão 'Excluir minha conta'. Revisa se o fluxo de exclusão está certo do ponto de vista da LGPD?",
  files: ["fixtures/fintech-kyc"],
  expected_behavior: [
    "Aponta que excluirContaCompleta (src/services/exclusao-conta.ts) apaga KYC (kyc_documentos, kyc_verificacoes e os arquivos no S3) e transações sem considerar a guarda exigida pela regulação de prevenção à lavagem de dinheiro.",
    "Explica que a eliminação a pedido do titular tem exceção para cumprimento de obrigação legal ou regulatória (LGPD art. 16, I, e art. 18, VI).",
    "Propõe eliminar o que não tem guarda obrigatória (sessões, preferências de marketing, dados de contato não exigidos) e conservar o restante com acesso restrito ou segregado até o fim do prazo, eliminando depois.",
    "Cita a regulação setorial de PLD/FT (Circular BCB nº 3.978/2020 e/ou Lei 9.613/1998) e marca o prazo de guarda (10 anos, art. 67 da Circular) como algo a confirmar com o jurídico ou compliance.",
    "Recomenda informar ao titular o que foi mantido e por quê (art. 18, §4º, II).",
    "Não declara conformidade nem estima multa.",
  ],
  deve_conter: [
    r`(?:guarda|retencao|conserva|manter|mantid|preserv)[^\n]{0,180}(?:kyc|pld|lavagem|conhe(?:ca|cer)\s+(?:seu|o)\s+cliente|transac|operac)|(?:kyc|pld|lavagem|transac)[^\n]{0,180}(?:guarda|retencao|conserv|manter|mantid|preserv)`,
    r`3\.?978|\bpld\b|lavagem\s+de\s+dinheiro|9\.?613`,
    r`${ART(16)}|obrigacao\s+(?:legal|regulatoria)`,
    r`bloque|segreg|restring|restrit|isol|arquiv`,
    r`(?:prazo|periodo|10\s+anos|dez\s+anos)[^\n]{0,140}(?:confirm|verific|valid|checar|consultar|jurid|compliance)|(?:confirm|verific|valid)[^\n]{0,140}(?:prazo|periodo|10\s+anos|dez\s+anos)`,
    r`(?:elimin|apag|exclu)[^\n]{0,160}(?:demais|restante|marketing|preferencias|sessoes|sem\s+(?:obrigacao|guarda|exigencia))`,
  ],
  nao_deve_conter: [
    r`${NEG}(?:excluircontacompleta|exclusao\s+(?:completa|total)|apagar\s+tudo|endpoint\s+de\s+exclusao)${G(100)}(?:esta\s+corret|esta\s+adequad|e\s+(?:o\s+)?corret|atende\s+(?:a|ao)\s+(?:lgpd|direito|art))`,
  ],
  armadilhas: [
    "Eliminar dados de marketing e sessões imediatamente é correto; não é achado.",
    "Exigir saldo zero antes de encerrar a conta é regra de negócio, não problema de LGPD.",
  ],
  fontes: [
    "LGPD art. 16, I (conservação para cumprimento de obrigação legal ou regulatória)",
    "LGPD art. 18, VI, e §4º, II (eliminação e resposta com razões de direito)",
    "LGPD art. 5º, XIII (bloqueio) e art. 6º, III (necessidade)",
    "Lei 9.613/1998 (lavagem de dinheiro)",
    "Circular BCB nº 3.978/2020, art. 67 (guarda de 10 anos) — CONFIRMAR no texto vigente",
  ],
});

// ---------------------------------------------------------------- DPO
add({
  id: "incidente-prazo",
  tipo: "dpo",
  query:
    "Sou o encarregado. Na quinta-feira, 19/11/2026, confirmamos que um acesso indevido ao nosso sistema expôs dados de saúde de cerca de 3.000 clientes. Até quando temos que comunicar a ANPD e os titulares, e o que a comunicação precisa conter? Se formos agente de pequeno porte, muda alguma coisa?",
  files: [],
  expected_behavior: [
    "Informa o prazo de 3 dias úteis contados do conhecimento de que o incidente afetou dados pessoais, para a ANPD e para os titulares (Res. CD/ANPD nº 15/2024, art. 6º, caput e §1º, e art. 9º).",
    "Considera 20/11/2026 (sexta-feira) feriado nacional (Dia Nacional de Zumbi e da Consciência Negra, Lei 14.759/2023) e conclui que o prazo vence em 25/11/2026 (quarta-feira), excluído o dia do conhecimento; ressalva feriados locais.",
    "Para agente de pequeno porte, prazo em dobro (art. 6º, §8º, e art. 9º, §6º): 6 dias úteis, até 30/11/2026; ressalva que o benefício não se aplica a quem faz tratamento de alto risco (Res. 2/2022, art. 3º) ou quando houver potencial comprometimento à integridade física ou moral (Res. 2/2022, art. 14, II), o que é plausível com dados de saúde.",
    "Menciona a complementação em até 20 dias úteis contados da comunicação (art. 6º, §3º) e o registro do incidente por no mínimo 5 anos (art. 10).",
    "Lista o conteúdo mínimo da comunicação à ANPD (art. 6º, §2º, 12 incisos), incluindo número de titulares com crianças, adolescentes e idosos, medidas antes e depois, motivos da demora, data da ocorrência e do conhecimento, identificação do operador, causa principal e total de titulares das atividades afetadas.",
    "Para os titulares: linguagem simples e comunicação direta e individualizada quando possível (art. 9º, §1º).",
    "Recomenda não esperar o fim da investigação: comunicar no prazo e complementar depois.",
  ],
  deve_conter: [
    DIAS_UTEIS(3, "tres"),
    r`resolucao${G(30)}15\/2024|\bres\.?\s*(?:cd\/anpd\s*)?(?:n[o.]?\s*)?15\/2024|15,?\s+de\s+24\s+de\s+abril\s+de\s+2024`,
    DATA(25, 11, "novembro"),
    r`feriado|consciencia\s+negra|zumbi`,
    r`\bdobro\b|${DIAS_UTEIS(6, "seis")}`,
    DATA(30, 11, "novembro"),
    r`alto\s+risco|integridade\s+(?:fisica|moral)`,
    DIAS_UTEIS(20, "vinte"),
    r`\b(?:5|cinco)\s*(?:\(cinco\)\s*)?anos`,
    r`idosos`,
    r`\boperador`,
    r`causa\s+(?:principal|raiz|provavel|do\s+incidente)|origem\s+do\s+incidente|o\s+que\s+causou`,
    r`total\s+(?:de\s+)?titulares|titulares\s+(?:cujos\s+dados\s+(?:sao|sejam)\s+)?tratados|universo\s+de\s+titulares`,
    r`demora|atraso`,
    r`antes\s+e\s+(?:depois|apos)`,
    r`encarregado`,
    r`linguagem\s+(?:simples|clara|acessivel)|facil\s+entendimento`,
    r`individual|diret[ao]`,
  ],
  nao_deve_conter: [
    r`${NEG}(?:prazo|em\s+ate|dentro\s+de|no\s+maximo)${G(25)}\b72\s*(?:h\b|horas)`,
    r`${NEG}(?:prazo|em\s+ate|dentro\s+de)${G(25)}\b(?:2|dois)\s+dias\s+uteis`,
    r`${NEG}(?:vence|vencimento|prazo\s+(?:final|limite|termina)|termina|ultimo\s+dia)${G(50)}(?:\b(?:22|24)\s*[\/.-]\s*11\b|\b(?:22|24)\s+de\s+novembro)`,
  ],
  armadilhas: [
    "Não é preciso concluir a investigação para comunicar; informação ainda não apurada pode ser complementada (art. 6º, §3º). Recomendar esperar é erro.",
    "Prazo de 72 horas é do GDPR, não da LGPD/Res. 15/2024.",
    "Quem conta o dia do conhecimento ou ignora o feriado chega a 24/11 ou 22/11 — errado.",
  ],
  fontes: [
    "Res. CD/ANPD nº 15/2024, art. 5º (critérios), art. 6º caput, §§1º, 2º (incisos I a XII), 3º e 8º; art. 9º caput, §1º e §6º; art. 10",
    "Res. CD/ANPD nº 2/2022, art. 3º, I, art. 4º e art. 14, II",
    "Lei 14.759/2023 (20 de novembro, feriado nacional)",
    "LGPD art. 48",
    "Lei 9.784/1999, art. 66 (exclusão do dia do começo), por analogia — interpretação, confirmar",
  ],
});

add({
  id: "titular-eliminacao",
  tipo: "dpo",
  query:
    "Sou encarregada de um e-commerce. Uma cliente mandou e-mail pedindo para apagarmos 'todos os dados dela, inclusive as notas fiscais'. Ela comprou conosco nos últimos três anos e assina a newsletter. O que eliminamos, o que podemos manter e qual o prazo para responder?",
  files: [],
  expected_behavior: [
    "Elimina (ou anonimiza) o que não tem guarda obrigatória: newsletter e preferências de marketing (revogação do consentimento), perfil e dados de navegação, conta, se não houver pendências.",
    "Mantém as notas fiscais e os registros exigidos pela legislação fiscal e de consumo pelo prazo legal (LGPD art. 16, I; art. 18, VI ressalva o art. 16), com acesso restrito, e elimina depois.",
    "Responde à titular informando o que foi eliminado, o que foi mantido e o motivo de direito (art. 18, §4º, II), e avisa os terceiros com quem houve compartilhamento (art. 18, §6º).",
    "Explica que o prazo de 15 dias do art. 19, II, é para a declaração completa de confirmação/acesso; para eliminação a LGPD remete a regulamento (art. 18, §5º), então recomenda responder sem demora e registrar.",
    "Não afirma que o art. 19 fixa 15 dias para eliminar.",
  ],
  deve_conter: [
    r`obrigacao\s+(?:legal|regulatoria|fiscal|tributaria)|legislacao\s+(?:fiscal|tributaria)|exigencia\s+(?:legal|fiscal)`,
    ART(16),
    r`notas?\s+fisca|nf-?e\b|documentos?\s+fisca`,
    r`(?:elimin|apag|exclu)[^\n]{0,120}(?:demais|restante|newsletter|marketing|o\s+que\s+nao)|(?:demais|restantes?)\s+dados[^\n]{0,80}(?:elimin|apag|exclu)|newsletter[^\n]{0,120}(?:elimin|apag|exclu|descadastr|revog|remov)`,
    r`(?:inform|comuni[cq]|expli[cq]|esclare[cç]|indi[cq]|respond|justifi|\bdiga|\bdizer)[^\n]{0,160}(?:motivo|razao|razoes|fundamento|justificativa|por\s+que|porque|base\s+legal)`,
  ],
  nao_deve_conter: [
    r`${NEG}${ART(19)}${G(100)}\b(?:15|quinze)\s+dias${G(40)}(?:elimina|exclu|apaga)`,
    r`${NEG}(?:elimina|exclu|apaga)\w*${G(60)}\b(?:15|quinze)\s+dias${G(60)}${ART(19)}`,
    r`${NEG}prazo\s+(?:legal\s+)?de\s+(?:15|quinze)\s+dias\s+(?:corridos\s+)?para\s+(?:eliminar|excluir|apagar|a\s+eliminacao|a\s+exclusao)`,
    r`${NEG}(?:elimin|apag|exclu)\w*\s+(?:tudo\s*,?\s+)?(?:inclusive\s+|tambem\s+)?(?:as\s+)?notas\s+fiscais${G(40)}(?:imediatamente|agora|como\s+pedido|conforme\s+solicitado)`,
  ],
  armadilhas: [
    "Manter notas fiscais pelo prazo legal não é descumprimento do pedido; é a exceção do art. 16, I.",
    "Não confundir o prazo de 15 dias do art. 19, II (declaração completa) com prazo de eliminação.",
  ],
  fontes: [
    "LGPD art. 16, I; art. 18, VI, IX, §§4º, 5º e 6º; art. 19, II; art. 8º, §5º",
  ],
});

// ---------------------------------------------------------------- regressão
add({
  id: "reg-saude-anuncios-consentimento",
  tipo: "regressao",
  query:
    "Uma rede de clínicas quer mandar para a plataforma de anúncios, via pixel e API de conversões, o evento 'agendou consulta de cardiologia' para fazer remarketing. Se a gente puser um checkbox de consentimento específico e destacado, fica liberado?",
  files: [],
  expected_behavior: [
    "Responde que não: o art. 11, §4º, veda a comunicação ou o uso compartilhado de dado de saúde para obter vantagem econômica, com exceções taxativas (prestação de serviços de saúde, assistência farmacêutica e à saúde, incluídos diagnose e terapia, em benefício do titular, para portabilidade pedida pelo titular ou transações financeiras e administrativas do serviço).",
    "Diz explicitamente que o consentimento não está entre as exceções e não afasta a vedação.",
    "Sugere alternativa: eventos sem especialidade ou condição de saúde, ou não enviar.",
  ],
  deve_conter: [
    PAR(11, 4),
    r`veda`,
    r`mesmo\s+(?:com|que\s+haja|havendo|diante\s+d[oe]|que\s+(?:o\s+)?(?:titular|paciente)\s+consinta)\s+(?:o\s+|um\s+)?consentimento|mesmo\s+que\s+(?:o\s+)?(?:titular|paciente)\s+consinta|consentimento[^.;\n]{0,80}\bnao\b[^.;\n]{0,40}(?:afasta|supre|legitima|resolve|basta|autoriza|libera|excepciona|elimina|cura|valida|suficiente|e\s+(?:uma\s+)?exce|esta\s+entre|figura|consta)|\bnao\b[^.;\n]{0,40}(?:afasta|supre|legitima|resolve|basta|autoriza|libera|excepciona)[^.;\n]{0,60}consentimento|consentimento[^.;\n]{0,30}(?:insuficiente|irrelevante)`,
  ],
  nao_deve_conter: [
    r`${NEG}com\s+(?:o\s+|esse\s+|um\s+)?(?:checkbox\s+de\s+)?consentimento(?:\s+\w+){0,4}\s*,?\s+(?:fica|e|torna-se|se\s+torna|passa\s+a\s+ser|seria|estaria|ficaria)\s+(?:liberad|legal|permitid|possivel|licit|valid|autorizad|regular)`,
    r`${NEG}consentimento\s+(?:e|seria)\s+a\s+(?:unica\s+)?(?:hipotese|base)(?:\s+legal)?\s+(?:possivel|plausivel|adequada|cabivel|que\s+permite|viavel)`,
    r`${NEG}unica\s+(?:hipotese|base)${G(30)}(?:plausivel|possivel|cabivel|viavel)${G(30)}consentimento`,
  ],
  armadilhas: [
    "Citar o art. 11, I (consentimento para dado sensível em geral) não é erro; o erro é concluir que ele afasta o §4º.",
    "Discutir se a plataforma de anúncios atua como controladora (o §4º fala em uso compartilhado 'entre controladores') é aceitável; concluir que o consentimento libera o envio não é.",
  ],
  fontes: ["LGPD art. 11, §4º, I e II (redação da Lei 13.853/2019)"],
});

add({
  id: "reg-transferencia-ue-eua",
  tipo: "regressao",
  query:
    "Vamos hospedar dados de clientes em um provedor de nuvem na Irlanda e usar uma ferramenta de e-mail marketing com servidores nos EUA. Para cada um, precisamos assinar as cláusulas-padrão contratuais da ANPD?",
  files: [],
  expected_behavior: [
    "Irlanda/UE: a Res. CD/ANPD nº 32/2026 reconheceu a União Europeia (e os países do EEE) como de nível adequado, então a transferência pode se basear no art. 33, I, sem cláusulas-padrão.",
    "EUA: não há decisão de adequação; é preciso outro mecanismo do art. 33, como as cláusulas-padrão da Res. CD/ANPD nº 19/2024.",
    "Lembra que a adequação não dispensa as demais obrigações (base legal, contrato com operador, transparência).",
  ],
  deve_conter: [
    r`32\/2026|resolucao\s+(?:cd\/anpd\s+)?(?:n[o.]?\s*)?32\b`,
    r`adequa`,
    ART(33),
    r`19\/2024|resolucao\s+(?:cd\/anpd\s+)?(?:n[o.]?\s*)?19\b`,
    r`clausulas?[\s-]+(?:contratuais[\s-]+)?padrao`,
    r`(?:irlanda|\bue\b|uniao\s+europeia|europa|\beee\b|32\/2026)[^\n]{0,250}(?:\bnao\s+(?:precisa|exige|e\s+necessari|requer|depende|sera\s+necessari|ha\s+necessidade)|dispensa|sem\s+necessidade|desnecessari|\bbasta\b|\bsem\s+(?:as\s+)?clausulas)|(?:\bnao\s+(?:precisa|exige|e\s+necessari|requer)|dispensa|desnecessari)[^\n]{0,250}(?:irlanda|\bue\b|uniao\s+europeia|europa|32\/2026)`,
  ],
  nao_deve_conter: [
    r`${NEG}(?:irlanda|uniao\s+europeia|\bue\b)${G(80)}(?:precisa|precisam|exige|exigem|requer|requerem|necessari[ao]s?|obrigatori[ao]s?)${G(40)}clausulas?[\s-]+(?:contratuais[\s-]+)?padrao`,
    r`${NEG}(?:\beua\b|estados\s+unidos)${G(80)}(?:reconhecid[oa]s?|considerad[oa]s?)\s+(?:como\s+)?(?:pais\s+)?(?:de\s+nivel\s+)?adequad`,
  ],
  armadilhas: [
    "Dizer que cláusulas-padrão continuam disponíveis também para a UE (art. 5º da Res. 32/2026) não é erro; o erro é dizer que são obrigatórias.",
  ],
  fontes: [
    "LGPD art. 33, I e II, 'b'",
    "Res. CD/ANPD nº 32/2026 (adequação da UE; parágrafo único do art. 1º inclui EEE) — texto conferido em fonte secundária (Legismap) e versão em espanhol no gov.br; confirmar no DOU",
    "Res. CD/ANPD nº 19/2024 (cláusulas-padrão contratuais)",
  ],
});

add({
  id: "reg-art20-revisao-humana",
  tipo: "regressao",
  query:
    "Nosso app aprova ou recusa crédito de forma automática. Um cliente pediu a revisão da recusa. A LGPD obriga que essa revisão seja feita por uma pessoa (revisão humana)?",
  files: [],
  expected_behavior: [
    "Responde que o art. 20 garante o direito de solicitar a revisão de decisão unicamente automatizada, mas não exige que ela seja feita por pessoa natural: esse trecho (§3º) foi vetado na Lei 13.853/2019.",
    "Pode recomendar revisão humana como boa prática, sem apresentá-la como obrigação legal.",
    "Menciona o dever de informar critérios e procedimentos (art. 20, §1º).",
  ],
  deve_conter: [ART(20), r`vetad|\bveto\b`, r`13\.?853`],
  nao_deve_conter: [
    r`${NEG}(?:\blgpd\b|art(?:igo)?\.?\s*20|\blei\b)${G(80)}(?:exige|obriga|determina|impoe|requer)${G(60)}(?:pessoa\s+natural|\bhumano\b|ser\s+humano|pessoa\s+fisica|revisao\s+humana)`,
    r`${NEG}revisao\s+humana\s+(?:e|seria)\s+(?:uma\s+)?(?:obrigatori|exigencia\s+legal|obrigacao\s+legal|exigida\s+(?:pela|por)\s+lei)`,
  ],
  armadilhas: ["Recomendar revisão humana como boa prática é aceitável."],
  fontes: ["LGPD art. 20, caput e §§1º a 3º (§3º vetado); Lei 13.853/2019 e mensagem de veto"],
});

add({
  id: "reg-ripd-alto-risco",
  tipo: "regressao",
  query:
    "Temos uma loja virtual com cerca de 2.000 clientes cadastrados (nome, e-mail, endereço e histórico de compras). Toda empresa é obrigada a fazer RIPD? Como saber se o nosso tratamento é de alto risco?",
  files: [],
  expected_behavior: [
    "Explica que o RIPD não é obrigação automática para todo tratamento: a ANPD pode determiná-lo (art. 38) e ele é exigível/recomendado em situações específicas (ex.: legítimo interesse, art. 10, §3º; tratamento de alto risco).",
    "Usa o critério cumulativo da Res. CD/ANPD nº 2/2022, art. 4º: pelo menos um critério geral (larga escala ou afetar significativamente interesses e direitos fundamentais) e um específico (tecnologia emergente, vigilância de zona pública, decisão unicamente automatizada, dado sensível ou de criança, adolescente ou idoso).",
    "Aplica ao caso: sem critério específico aparente, não é alto risco por esse critério; recomenda documentar a avaliação.",
    "Não inventa número de titulares para larga escala.",
  ],
  deve_conter: [
    r`2\/2022|resolucao\s+(?:cd\/anpd\s+)?(?:n[o.]?\s*)?2\b`,
    ART(4),
    r`cumulativ|(?:um|pelo\s+menos\s+um|ao\s+menos\s+um)\s+criterio\s+geral[^.;\n]{0,100}(?:\be\b|mais|\+|junto)[^.;\n]{0,60}especifico|criterios?\s+gera(?:l|is)\s+e\s+(?:criterios?\s+)?especificos?`,
    ART(38),
    r`\bnao\s+(?:e|existe|ha)${G(40)}(?:obrigatori|automatic|exigid|dever\s+geral|obrigacao\s+(?:geral|universal))|\bnao\s+(?:precisa|exige)|\bnem\s+toda|\bnao\s+e\s+(?:toda|qualquer)`,
  ],
  nao_deve_conter: [
    r`${NEG}(?:toda|todas\s+as|qualquer)\s+(?:empresa|organizacao|controlador|tratamento)${G(60)}(?:deve|precisa|e\s+obrigad[ao]|tem\s+que|tem\s+de|e\s+obrigatori)${G(40)}(?:ripd|relatorio\s+de\s+impacto)`,
    r`${NEG}larga\s+escala${G(60)}(?:acima|mais|a\s+partir)\s+de\s+[\d.]+\s*(?:mil\s+)?(?:titulares|registros|pessoas|clientes)`,
  ],
  armadilhas: [
    "Recomendar o RIPD como boa prática não é erro; o erro é apresentá-lo como obrigatório para todos.",
  ],
  fontes: [
    "LGPD art. 5º, XVII; art. 10, §3º; art. 38",
    "Res. CD/ANPD nº 2/2022, Anexo, art. 4º (critérios gerais e específicos, cumulativos)",
  ],
});

add({
  id: "reg-crianca-adolescente-consentimento",
  tipo: "regressao",
  query:
    "Temos uma escola de idiomas presencial. Para matricular alunos de 15 anos (nome, data de nascimento, contato e frequência), a LGPD exige o consentimento específico de um dos pais, como no art. 14, §1º?",
  files: [],
  expected_behavior: [
    "Explica que o consentimento específico e em destaque de um dos pais (art. 14, §1º) é exigido para dados de criança, que pelo ECA é a pessoa até 12 anos incompletos; aluno de 15 anos é adolescente.",
    "Diz que o tratamento de dados de adolescentes segue o melhor interesse (art. 14, caput) e pode se apoiar nas hipóteses dos arts. 7º e 11, conforme o Enunciado CD/ANPD nº 1/2023.",
    "Indica base provável (ex.: execução de contrato de matrícula com o responsável) e ressalva que a escolha é do controlador.",
  ],
  deve_conter: [
    r`crianca`,
    r`\b12\s+anos|\bdoze\s+anos`,
    r`adolescente`,
    r`melhor\s+interesse`,
    r`enunciado`,
    ART(7),
  ],
  nao_deve_conter: [
    r`${NEG}(?:art(?:igo)?\.?\s*14\s*,?\s*§\s*1o?|consentimento\s+(?:especifico\s+)?(?:parental|dos\s+pais|de\s+um\s+dos\s+pais|do\s+responsavel))${G(80)}(?:e\s+obrigatori|e\s+exigid|e\s+necessari|tambem\s+se\s+aplica|se\s+aplica|vale)(?!\s+(?:so\s+|apenas\s+|somente\s+|unicamente\s+)?(?:para|a)\s+(?:a\s+)?crianca)${G(70)}(?:adolescentes?|15\s+anos)`,
    r`${NEG}(?:adolescentes?|alunos?\s+de\s+15\s+anos|15\s+anos)${G(60)}(?:precisa|exige|exigem|depende|dependem|requer|requerem|e\s+obrigatorio|e\s+preciso|e\s+necessario|necessit\w*)${G(40)}(?:o\s+)?consentimento\s+(?:especifico\s+)?(?:parental|dos\s+pais|de\s+um\s+dos\s+pais|do\s+responsavel)`,
  ],
  armadilhas: [
    "Mencionar que o contrato de matrícula é assinado pelo responsável, ou que o ECA Digital (Lei 15.211/2025) tem regras próprias para serviços digitais usados por adolescentes, não é erro.",
  ],
  fontes: [
    "LGPD art. 14, caput e §1º",
    "ECA (Lei 8.069/1990), art. 2º",
    "Enunciado CD/ANPD nº 1/2023 (texto conferido em fontes secundárias; confirmar no gov.br/anpd)",
  ],
});

add({
  id: "reg-protecao-credito-sensivel",
  tipo: "regressao",
  query:
    "Somos uma fintech de crédito. Podemos usar dados de saúde informados no cadastro (por exemplo, se a pessoa tem doença crônica) no nosso modelo de score, usando como base legal a proteção do crédito?",
  files: [],
  expected_behavior: [
    "Responde que não: proteção do crédito é hipótese do art. 7º, X, aplicável a dados pessoais comuns; o art. 11 (dados sensíveis) não a inclui.",
      "Não lista \"execução de contrato\" entre as hipóteses do art. 11 (o art. 11, II, \"d\" fala em exercício regular de direitos, inclusive em contrato).",
    "Aponta riscos adicionais: discriminação (art. 6º, IX), Lei do Cadastro Positivo (Lei 12.414/2011) que proíbe anotar informações sensíveis, e direito de revisão de decisão automatizada (art. 20).",
  ],
  deve_conter: [
    ART(11),
    r`protecao\s+do\s+credito`,
    r`\bnao\s+(?:esta|consta|figura|aparece|existe|ha|e\s+(?:uma\s+)?(?:hipotese|base))${G(100)}(?:art(?:igo)?\.?\s*11|sensive|\brol\b)|(?:art(?:igo)?\.?\s*11|\brol\b)[^.;\n]{0,100}\bnao\s+(?:inclui|preve|contempla|lista|traz|admite|menciona|abrange)|(?:exclusiv[ao]s?\s+do|apenas\s+no|somente\s+no|so\s+no|so\s+existe\s+no|prevista\s+(?:apenas|somente|so)\s+no)\s+art(?:igo)?\.?\s*7|(?:lista|rol)\s+(?:fechad|taxativ)|vale\s+(?:so|apenas|somente)\s+para\s+(?:o\s+)?(?:dados?\s+)?(?:pessoa(?:l|is)\s+)?comu`,
    r`\bart(?:igo)?\.?\s*7o?\s*,?\s*(?:inciso\s+)?x\b`,
  ],
  nao_deve_conter: [
    r`${NEG}protecao\s+do\s+credito\s+(?:e|seria|pode\s+ser|serve\s+como|funciona\s+como)\s+(?:uma\s+)?(?:base|hipotese)\s+(?:legal\s+)?(?:valida|adequada|possivel|cabivel|suficiente|aplicavel)${G(60)}(?:saude|sensive)`,
    r`${NEG}(?:pode|podem|e\s+possivel)\s+(?:usar|utilizar|tratar)${G(80)}(?:saude|sensive)${G(80)}(?:com\s+base\s+(?:legal\s+)?na|pela|fundament\w+\s+na|amparad\w+\s+na)\s+protecao\s+do\s+credito`,
    // Erro visto em execução real: listar execução de contrato entre as hipóteses do art. 11 (lá é
    // "exercício regular de direitos, inclusive em contrato").
    r`${NEG}art(?:igo)?\.?\s*11${G(120)}execucao\s+(?:d[eo]\s+)?contrato`,
  ],
  armadilhas: [],
  fontes: ["LGPD art. 7º, X; art. 11; art. 6º, IX; art. 20", "Lei 12.414/2011, art. 3º, §3º, II"],
});

add({
  id: "reg-previdenciario-10-anos",
  tipo: "regressao",
  query:
    "Por quanto tempo o RH precisa guardar os documentos de recolhimento previdenciário (folha, guias, eSocial)? Ouvi dizer que são 10 anos pela Lei 8.212/91.",
  files: [],
  expected_behavior: [
    "Explica que os 10 anos dos arts. 45 e 46 da Lei 8.212/1991 caíram: o STF declarou esses artigos inconstitucionais (Súmula Vinculante 8) e vale o prazo de 5 anos do CTN para decadência/prescrição.",
    "Ressalva que outros documentos trabalhistas podem ter prazos próprios e recomenda tabela de retenção validada pelo jurídico.",
  ],
  deve_conter: [
    r`sumula\s+vinculante\s+(?:n[o.]?\s*)?8\b|\bsv\s*-?\s*8\b`,
    r`\b(?:5|cinco)\s*(?:\(cinco\)\s*)?anos`,
    r`8\.?212`,
    r`inconstitucion|superad|revogad|afastad|derrubad|\bnao\s+(?:vale|se\s+aplica|prevalece|esta\s+mais\s+em\s+vigor)`,
  ],
  nao_deve_conter: [
    r`${NEG}(?:guardar|manter|conservar|guarda\s+(?:e|sera)\s+de|prazo\s+(?:de\s+guarda\s+)?(?:e|sera)\s+de)${G(40)}\b(?:10|dez)\s+anos${G(60)}8\.?212`,
    r`${NEG}(?:lei\s+)?8\.?212${G(40)}(?:exige|determina|impoe|obriga)${G(30)}\b(?:10|dez)\s+anos`,
  ],
  armadilhas: [
    "Citar que algum documento específico tem prazo maior por outra norma (ex.: PPP, LTCAT, ASO) não é erro, desde que não atribua os 10 anos à Lei 8.212.",
  ],
  fontes: [
    "STF, Súmula Vinculante 8 (inconstitucionalidade dos arts. 45 e 46 da Lei 8.212/1991)",
    "CTN arts. 173 e 174",
    "LGPD art. 16, I",
  ],
});

add({
  id: "reg-pequeno-porte-encarregado",
  tipo: "regressao",
  query:
    "Somos uma microempresa de contabilidade com 6 funcionários e não fazemos tratamento de alto risco. Somos obrigados a nomear um encarregado (DPO)? O que precisamos ter no lugar?",
  files: [],
  expected_behavior: [
    "Explica que o agente de tratamento de pequeno porte não é obrigado a indicar encarregado (Res. CD/ANPD nº 2/2022, Anexo, art. 11), desde que não esteja nas exclusões do art. 3º (alto risco, receita acima do limite, grupo econômico).",
    "Diz que deve manter canal de comunicação com o titular (art. 11, §1º) e que indicar encarregado conta como boa prática (art. 11, §2º).",
    "Lembra que a dispensa não afasta as demais obrigações da LGPD (art. 6º do regulamento).",
  ],
  deve_conter: [
    r`2\/2022|resolucao\s+(?:cd\/anpd\s+)?(?:n[o.]?\s*)?2\b`,
    ART(11),
    r`canal\s+(?:de\s+)?(?:comunicacao|atendimento|contato)`,
    r`\bnao\s+(?:e|sao|esta|estao)\s+obrigad|dispensad|\bnao\s+precis|facultativ|\bnao\s+e\s+obrigatori`,
  ],
  nao_deve_conter: [
    r`${NEG}(?:e|sao|esta|estao)\s+obrigad[ao]s?\s+a\s+(?:nomear|indicar|designar|ter)\s+(?:um\s+|uma\s+)?(?:encarregad|dpo)`,
    r`dispensad[ao]s?\s+de\s+(?:ter\s+|manter\s+)?(?:qualquer|um)\s+canal|\bnao\s+precisa(?:m)?\s+(?:ter|manter|disponibilizar)\s+(?:nenhum|qualquer|um)\s+canal`,
  ],
  armadilhas: ["Recomendar indicar encarregado mesmo assim, como boa prática, é aceitável."],
  fontes: ["Res. CD/ANPD nº 2/2022, Anexo, arts. 2º, 3º, 6º e 11", "LGPD art. 41, §2º, I", "Res. CD/ANPD nº 18/2024"],
});

add({
  id: "reg-consentimento-condicao",
  tipo: "regressao",
  query:
    "Nosso app gratuito de receitas só funciona se o usuário aceitar que usemos os dados de uso dele para personalizar as recomendações. A LGPD proíbe condicionar o uso do serviço a esse tratamento?",
  files: [],
  expected_behavior: [
    "Responde que não há proibição absoluta: o art. 9º, §3º, prevê que, quando o tratamento for condição para o fornecimento do produto ou serviço, o titular deve ser informado com destaque sobre isso e sobre como exercer seus direitos.",
    "Discute a base legal: se a personalização é parte do serviço, a execução de contrato (art. 7º, V) pode ser mais adequada que o consentimento; se for consentimento, ele precisa ser livre e informado (art. 5º, XII, e art. 8º), ponto em que há debate.",
    "Aponta que tratamentos acessórios (ex.: publicidade de terceiros) não devem ser empacotados na mesma condição.",
  ],
  deve_conter: [PAR(9, 3), r`destaque`],
  nao_deve_conter: [
    r`${NEG}(?:\blgpd\b|\blei\b)${G(40)}(?:proibe|veda|impede)${G(40)}condicionar`,
    r`${NEG}(?:e|seria)\s+(?:sempre\s+)?(?:proibido|vedado|ilegal|ilicito)\s+condicionar`,
  ],
  armadilhas: [
    "Ponto com divergência doutrinária sobre consentimento condicionado ser 'livre'. O gabarito só reprova a afirmação de proibição absoluta; discutir o risco de o consentimento ser considerado não livre é aceitável.",
  ],
  fontes: ["LGPD art. 9º, §3º; art. 5º, XII; art. 7º, V; art. 8º"],
});

add({
  id: "reg-sem-selo-sem-multa",
  tipo: "regressao",
  query:
    "Já temos política de privacidade, banner de cookies, DPO nomeado e inventário (RoPA). Pode me dar um parecer dizendo que estamos em conformidade com a LGPD e quanto pagaríamos de multa se a ANPD nos fiscalizasse amanhã?",
  files: [],
  expected_behavior: [
    "Recusa declarar conformidade: documentos existirem não prova que o tratamento real corresponde a eles; oferece avaliação por evidências (mapa de dados, código, contratos) com limites explícitos.",
    "Recusa estimar valor de multa: a dosimetria depende de critérios que só a ANPD avalia no caso concreto (art. 52, §1º; Res. CD/ANPD nº 4/2023).",
    "Pode citar o teto legal da multa simples como informação normativa, sem transformá-lo em estimativa.",
  ],
  deve_conter: [
    r`(?:\bnao\s+(?:e\s+possivel|da\s+para|posso|podemos|consigo|cabe|ha\s+como|se\s+pode|e\s+adequado|vou|devo|deve)|impossivel|evito|evitamos|recuso)${G(100)}(?:afirmar|declarar|atestar|garantir|certificar|dizer|emitir|estimar|calcular|prever|parecer|selo)`,
    r`\bmulta`,
    r`${ART(52)}|dosimetria|4\/2023`,
  ],
  nao_deve_conter: [
    r`${NEG}(?:voces|a\s+empresa|sua\s+empresa|sua\s+organizacao)\s+(?:esta|estao)\s+(?:em\s+conformidade|adequad[ao]s?|conformes?)`,
  ],
  armadilhas: [
    "Citar o teto do art. 52, II (2% do faturamento no Brasil, limitado a R$ 50 milhões por infração) como regra legal não é estimar multa.",
  ],
  fontes: ["LGPD art. 52, II e §1º", "Res. CD/ANPD nº 4/2023 (dosimetria)"],
});

// globais em todos os casos
for (const c of casos) c.nao_deve_conter = [...c.nao_deve_conter, ...GLOBAIS];
const RAW = r`[^.;\n]`;
for (const c of casos) for (const k of ["deve_conter", "nao_deve_conter"]) c[k] = c[k].map((p) => p.split(RAW).join(CH));

function gerar() {
  return JSON.stringify(casos, null, 2) + "\n";
}

if (require.main === module) {
  const out = process.argv[2] || path.join(__dirname, "evals.json");
  fs.writeFileSync(out, gerar());
  console.log(`gravados ${casos.length} casos em ${out}`);
}

module.exports = { gerar };
