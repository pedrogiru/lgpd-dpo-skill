const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { validateFile, cpfValido, cnpjValido } = require("../skills/lgpd-dpo/scripts/validate-findings.cjs");

// Gera documentos com DV válido em tempo de execução, para não guardar no repositório um número que
// poderia pertencer a alguém.
function comDvCpf(base9) {
  const dv = (b) => {
    let soma = 0;
    for (let i = 0; i < b.length; i++) soma += Number(b[i]) * (b.length + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = dv(base9);
  return base9 + d1 + dv(base9 + d1);
}
function comDvCnpj(base12) {
  const dv = (b) => {
    const pesos = b.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const r = pesos.reduce((acc, p, i) => acc + p * Number(b[i]), 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dv(base12);
  return base12 + d1 + dv(base12 + d1);
}
const formatarCpf = (d) => `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
const formatarCnpj = (d) => `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;

const confirmado = () => ({
  veredito: "confirmado",
  fingerprint: "pixel-meta/checkout/conteudo-carrinho",
  unidade: "checkout/compartilhamento/terceiros",
  titulo: "Conversions API recebe e-mail com hash sem segredo e itens do carrinho",
  descricao: "O evento Purchase envia em e sha256(email) sem pepper.",
  artigos: ["LGPD art. 6, III", "LGPD art. 7"],
  principios: ["necessidade", "transparencia"],
  categorias_dados: ["comum", "comportamental"],
  titulares_afetados: "Clientes que concluem compra no site",
  fluxo: [
    { etapa: "coleta", arquivo: "src/checkout/form.tsx", linha: 42, descricao: "Cliente informa e-mail" },
    { etapa: "compartilhamento", arquivo: "src/lib/capi.ts", linha: 18, descricao: "POST para a API de conversões" },
  ],
  dano_possivel: "A plataforma associa a pessoa ao histórico de compras para publicidade.",
  risco: { probabilidade: "alta", impacto: "medio", nivel: "medio", justificativa: "Toda compra dispara o evento." },
  correcao: { invariante: "Eventos de conversão só levam campos listados.", mudanca: "Remover itens do payload.", teste: "Teste que inspeciona o payload." },
  acao_dpo: "Incluir o fluxo no RoPA e revisar o aviso de privacidade.",
});

const precisaValidacao = () => ({
  veredito: "precisa_validacao",
  fingerprint: "llm/transcricao/regiao",
  titulo: "Transcrição de atendimento enviada a provedor nos EUA",
  descricao: "O áudio do atendimento vai para a API de transcrição.",
  artigos: ["LGPD art. 33"],
  categorias_dados: ["comum"],
  fluxo: [
    { etapa: "compartilhamento", arquivo: "api/transcrever.ts", linha: 10, descricao: "POST para o provedor" },
    { etapa: "compartilhamento", origem: "fora_do_repositorio", descricao: "Região e retenção configuradas na conta do provedor" },
  ],
  fato_faltante: "Mecanismo de transferência internacional no contrato.",
  responsavel: "juridico",
  plano_validacao: "Conferir se o contrato inclui as cláusulas-padrão da ANPD.",
});

function run(records) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lgpd-"));
  const file = path.join(dir, "achados.json");
  fs.writeFileSync(file, typeof records === "string" ? records : JSON.stringify(records));
  try {
    return validateFile(file);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("aceita registros válidos dos quatro vereditos", () => {
  const errors = run([
    confirmado(),
    precisaValidacao(),
    { veredito: "observacao", fingerprint: "crm/replicacao", titulo: "CRM recebe cadastro", descricao: "Fluxo para o RoPA." },
    { veredito: "rejeitado", fingerprint: "log/cpf/middleware", titulo: "CPF em log", tipo_rejeicao: "refutado", motivo: "O middleware mascara o campo antes de logar." },
  ]);
  assert.deepStrictEqual(errors, []);
});

test("recusa risco em precisa_validacao e em observacao", () => {
  const p = precisaValidacao();
  p.risco = { probabilidade: "alta", impacto: "alto", nivel: "alto", justificativa: "j" };
  assert.ok(run([p]).some((e) => e.includes('campo não permitido "risco"')));
  const o = { veredito: "observacao", fingerprint: "x", titulo: "t", descricao: "d", risco: {} };
  assert.ok(run([o]).some((e) => e.includes('campo não permitido "risco"')));
});

test("recusa enquadramento de dosimetria e nível informativo", () => {
  const r = confirmado();
  r.enquadramento_dosimetria = "grave";
  assert.ok(run([r]).some((e) => e.includes('campo não permitido "enquadramento_dosimetria"')));
  const s = confirmado();
  s.risco.nivel = "informativo";
  assert.ok(run([s]).some((e) => e.includes('"informativo" não está em')));
});

test("recusa nivel acima do impacto", () => {
  const r = confirmado();
  r.risco.impacto = "medio";
  r.risco.nivel = "critico";
  assert.ok(run([r]).some((e) => e.includes("não pode passar do impacto")));
});

test("recusa dado sensível com impacto baixo", () => {
  const r = confirmado();
  r.categorias_dados = ["sensivel_saude"];
  r.risco.impacto = "baixo";
  r.risco.nivel = "baixo";
  assert.ok(run([r]).some((e) => e.includes("dado sensível")));
});

test("aceita a categoria idoso", () => {
  const r = confirmado();
  r.categorias_dados = ["idoso", "financeiro"];
  assert.deepStrictEqual(run([r]), []);
});

test("confirmado não aceita etapa fora do repositório", () => {
  const r = confirmado();
  r.fluxo.push({ etapa: "compartilhamento", origem: "fora_do_repositorio", descricao: "Configurado no painel" });
  assert.ok(run([r]).some((e) => e.includes("fluxo provado no repositório")));
});

test("etapa no repositório exige arquivo e linha", () => {
  const r = confirmado();
  delete r.fluxo[0].linha;
  assert.ok(run([r]).some((e) => e.includes('precisa de "arquivo" e "linha"')));
});

test("recusa fingerprint repetido", () => {
  assert.ok(run([confirmado(), confirmado()]).some((e) => e.includes("fingerprint repetido")));
});

test("detecta CPF e CNPJ com DV válido, com ou sem máscara", () => {
  const cpf = comDvCpf("529982247");
  const cnpj = comDvCnpj("112223330001");
  assert.ok(cpfValido(cpf) && cnpjValido(cnpj));

  for (const texto of [`CPF ${formatarCpf(cpf)} no log`, `campo com ${cpf} gravado`]) {
    const r = confirmado();
    r.descricao = texto;
    assert.ok(run([r]).some((e) => e.includes("CPF") || e.includes("DV válido")), texto);
  }
  const r = confirmado();
  r.titulares_afetados = `Empresa ${formatarCnpj(cnpj)}`;
  assert.ok(run([r]).some((e) => e.includes("CNPJ real")));
});

test("examina todas as ocorrências, não só a primeira", () => {
  const r = confirmado();
  r.descricao = `Exemplos: 000.000.000-00 e depois ${formatarCpf(comDvCpf("529982247"))}.`;
  assert.ok(run([r]).some((e) => e.includes("CPF real")));
});

test("aceita documentos e contatos fictícios", () => {
  const r = confirmado();
  r.descricao = "Ex.: CPF 000.000.000-00, 111.222.333-00, CNPJ 00.000.000/0000-00 e cliente@example.com no log.";
  assert.deepStrictEqual(run([r]), []);
});

test("detecta e-mail real e telefones celular e fixo", () => {
  const e = confirmado();
  e.descricao = "Enviado para fulano@empresa-real.com.br.";
  assert.ok(run([e]).some((x) => x.includes("e-mail real")));
  for (const tel of ["(11) 98765-4321", "11 3333-4444"]) {
    const t = confirmado();
    t.descricao = `Mensagem enviada para ${tel}.`;
    assert.ok(run([t]).some((x) => x.includes("telefone")), tel);
  }
});

test("não confunde artigos, datas e linhas com telefone", () => {
  const r = confirmado();
  r.descricao = "Lei 13.709/2018, art. 52; prazo até 25/11/2026; Res. CD/ANPD nº 15/2024.";
  assert.deepStrictEqual(run([r]), []);
});

test("trata entrada malformada sem exceção", () => {
  assert.ok(run("{ não é json").some((e) => e.includes("JSON inválido")));
  assert.ok(run({ veredito: "confirmado" }).some((e) => e.includes("esperado array")));
  const r = confirmado();
  r.categorias_dados = "sensivel_saude";
  assert.ok(run([r]).length > 0);
  assert.ok(run([null, 42, "x"]).length > 0);
});

test("explica veredito inválido", () => {
  assert.ok(run([{ veredito: "talvez", fingerprint: "x", titulo: "t" }]).some((e) => e.includes("veredito ausente ou inválido")));
});
