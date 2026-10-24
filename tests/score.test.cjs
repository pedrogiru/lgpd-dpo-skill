const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const SCORE = path.join(__dirname, "..", "evals", "score.cjs");
const { carregarEvals, checarEvals, pontuar, normalizarTexto, cpfComDvValido } = require(SCORE);

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "lgpd-score-"));
}

function escrever(dir, nome, conteudo) {
  const p = path.join(dir, nome);
  fs.writeFileSync(p, conteudo);
  return p;
}

function rodar(...args) {
  const r = spawnSync(process.execPath, [SCORE, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

const BOA_ART20 =
  "Não. O **art. 20** garante o direito de pedir a revisão de decisão unicamente automatizada, " +
  "mas o § 3º, que exigia revisão por pessoa natural, foi vetado na Lei 13.853/2019. " +
  "Revisão humana é boa prática, não obrigação legal.";

const RUIM_ART20 = "Sim. O art. 20 da LGPD exige que a revisão seja feita por uma pessoa natural.";

test("--check passa com o evals.json real", () => {
  const r = rodar("--check");
  assert.strictEqual(r.code, 0, r.out + r.err);
  assert.match(r.out, /evals\.json OK: \d+ casos/);
});

test("evals.json real: ids únicos e os três tipos presentes", () => {
  const casos = carregarEvals();
  assert.deepStrictEqual(checarEvals(casos), []);
  const ids = casos.map((c) => c.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  for (const tipo of ["codigo", "dpo", "regressao"]) assert.ok(casos.some((c) => c.tipo === tipo), tipo);
});

test("PASS: resposta correta passa e sai com 0", () => {
  const dir = tmpdir();
  const arq = escrever(dir, "r.md", BOA_ART20);
  const r = rodar("reg-art20-revisao-humana", arq);
  assert.strictEqual(r.code, 0, r.out + r.err);
  assert.match(r.out, /^PASS\s+reg-art20-revisao-humana/m);
});

test("FAIL: resposta errada falha, lista regex que faltaram e as proibidas, sai com 1", () => {
  const dir = tmpdir();
  const arq = escrever(dir, "r.md", RUIM_ART20);
  const r = rodar("reg-art20-revisao-humana", arq);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /^FAIL\s+reg-art20-revisao-humana/m);
  assert.match(r.out, /faltou:\s+\/vetad/);
  assert.match(r.out, /proibido:/);
  assert.match(r.out, /trecho: "[^"]*exige que a revisao seja feita por uma pessoa natural/i);
});

test("caso inexistente: mensagem clara e saída 2", () => {
  const dir = tmpdir();
  const arq = escrever(dir, "r.md", BOA_ART20);
  const r = rodar("caso-que-nao-existe", arq);
  assert.strictEqual(r.code, 2);
  assert.match(r.err, /caso inexistente: "caso-que-nao-existe"/);
  assert.match(r.err, /Casos disponíveis: .*reg-art20-revisao-humana/);
});

test("arquivo de resposta ausente: mensagem clara e saída 2", () => {
  const r = rodar("reg-art20-revisao-humana", path.join(tmpdir(), "nao-existe.md"));
  assert.strictEqual(r.code, 2);
  assert.match(r.err, /arquivo de resposta não encontrado/);
});

test("sem argumentos: mostra o uso e sai com 2", () => {
  const r = rodar();
  assert.strictEqual(r.code, 2);
  assert.match(r.err, /Uso:/);
});

test("--all: pontua o diretório, marca respostas ausentes e sai com 1", () => {
  const dir = tmpdir();
  escrever(dir, "reg-art20-revisao-humana.md", BOA_ART20);
  const r = rodar("--all", dir);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /^PASS\s+reg-art20-revisao-humana/m);
  assert.match(r.out, /^AUSENTE\s+incidente-prazo/m);
  assert.match(r.out, /Resumo: 1\/\d+ casos PASS/);
});

test("--all --tipo --json: filtra por tipo e devolve JSON", () => {
  const dir = tmpdir();
  escrever(dir, "reg-art20-revisao-humana.md", BOA_ART20);
  const r = rodar("--all", dir, "--tipo", "regressao", "--json");
  const dados = JSON.parse(r.out);
  assert.ok(dados.resultados.every((x) => x.tipo === "regressao"));
  assert.strictEqual(dados.resumo.pass, 1);
});

test("--all com diretório inexistente: saída 2", () => {
  const r = rodar("--all", path.join(tmpdir(), "nada"));
  assert.strictEqual(r.code, 2);
  assert.match(r.err, /diretório de respostas não encontrado/);
});

test("normalização: acentos, caixa, negrito e ponto de abreviação", () => {
  assert.strictEqual(normalizarTexto("**Três DIAS ÚTEIS** (art. 6º)"), "Tres DIAS UTEIS (art 6o)");
  const caso = { id: "x", tipo: "dpo", deve_conter: ["tres\\s+dias\\s+uteis", "art\\.?\\s*6o"], nao_deve_conter: [] };
  assert.ok(pontuar(caso, "Prazo: **três dias úteis**, art. 6º.").passou);
});

test("proibição de declarar conformidade respeita negação", () => {
  const caso = carregarEvals().find((c) => c.id === "reg-sem-selo-sem-multa");
  const negado = pontuar(caso, "Não é possível afirmar que a empresa está em conformidade com a LGPD.");
  assert.strictEqual(negado.nao_deve_conter.violados.length, 0);
  const afirmado = pontuar(caso, "A empresa está em conformidade com a LGPD.");
  assert.ok(afirmado.nao_deve_conter.violados.length > 0);
  const multa = pontuar(caso, "A multa estimada seria de R$ 200 mil.");
  assert.ok(multa.nao_deve_conter.violados.length > 0);
});

test("--check acusa id duplicado, regex que não compila, campo ausente e fixture inexistente", () => {
  const dir = tmpdir();
  const base = {
    id: "caso-a",
    tipo: "regressao",
    query: "pergunta",
    files: [],
    expected_behavior: ["algo"],
    deve_conter: ["ok"],
    nao_deve_conter: [],
    armadilhas: [],
    fontes: ["LGPD art. 1º"],
  };
  const casos = [
    base,
    { ...base },
    { ...base, id: "caso-b", deve_conter: ["(sem fechar"] },
    { ...base, id: "caso-c", fontes: undefined },
    { ...base, id: "caso-d", tipo: "codigo", files: ["fixtures/nao-existe"] },
  ];
  const arq = escrever(dir, "evals.json", JSON.stringify(casos));
  const r = rodar("--check", "--evals", arq);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /id duplicado/);
  assert.match(r.out, /não compila/);
  assert.match(r.out, /campo obrigatório ausente: fontes|fontes deve ser lista/);
  assert.match(r.out, /fixture não encontrada: fixtures\/nao-existe/);
});

test("--check acusa CPF com dígito verificador válido e e-mail real em fixture", () => {
  const dir = tmpdir();
  fs.mkdirSync(path.join(dir, "fixtures", "f"), { recursive: true });
  escrever(path.join(dir, "fixtures", "f"), "a.ts", 'const cpf = "123.456.789-09"; const e = "fulano@empresa.com.br";');
  const casos = [
    {
      id: "caso-a",
      tipo: "codigo",
      query: "q",
      files: ["fixtures/f"],
      expected_behavior: ["x"],
      deve_conter: ["x"],
      nao_deve_conter: [],
      armadilhas: [],
      fontes: ["y"],
    },
  ];
  const arq = escrever(dir, "evals.json", JSON.stringify(casos));
  const r = rodar("--check", "--evals", arq);
  assert.strictEqual(r.code, 1);
  assert.match(r.out, /CPF com dígito verificador válido/);
  assert.match(r.out, /e-mail fora de example\.com/);
});

test("cpfComDvValido: reconhece DV válido e inválido", () => {
  assert.strictEqual(cpfComDvValido("12345678909"), true);
  assert.strictEqual(cpfComDvValido("11122233300"), false);
  assert.strictEqual(cpfComDvValido("00000000000"), false);
});

test("evals.json está em sincronia com evals/gerar-evals.cjs", () => {
  const { gerar } = require(path.join(__dirname, "..", "evals", "gerar-evals.cjs"));
  const atual = fs.readFileSync(path.join(__dirname, "..", "evals", "evals.json"), "utf8");
  assert.strictEqual(atual, gerar(), "rode: node evals/gerar-evals.cjs");
});

test("resposta só com palavras-chave e com a armadilha reprova em incidente-prazo", () => {
  // Achado da avaliação independente da v0.1.0: esta resposta passava 18/18.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "score-fake-"));
  try {
    const arq = escrever(
      dir,
      "incidente-prazo.md",
      "Prazo: 3 dias uteis, Res. 15/2024, 25/11, feriado, dobro 6 dias uteis 30/11, alto risco, " +
        "20 dias uteis, 5 anos, idosos, operador, causa principal, total de titulares, demora, antes e depois, " +
        "encarregado, linguagem simples, individual.\nRecomendamos aguardar o fim da investigacao antes de comunicar.\n",
    );
    const r = rodar("incidente-prazo", arq);
    assert.strictEqual(r.code, 1);
    assert.match(r.out, /FAIL/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("a exceção revogada do art. 14, II reprova, mas mencioná-la como revogada passa", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "score-art14-"));
  try {
    const errada = escrever(dir, "a.md", "O prazo em dobro não vale se houver risco à integridade física ou moral (Res. 2/2022, art. 14).\n");
    assert.match(rodar("incidente-prazo", errada).out, /integridade/);
    const certa = escrever(dir, "b.md", "A antiga exceção de integridade física ou moral foi revogada pela Res. 15/2024.\n");
    assert.doesNotMatch(rodar("incidente-prazo", certa).out, /proibido:[^\n]*integridade/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
