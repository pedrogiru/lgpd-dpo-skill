#!/usr/bin/env node
"use strict";
// Pontuação determinística dos evals da lgpd-dpo. Node puro, sem dependências, sem rede.
//
// Uso:
//   node evals/score.cjs <id-do-caso> <arquivo-de-resposta>
//   node evals/score.cjs --all <diretorio-de-respostas>     (arquivos <id>.md)
//   node evals/score.cjs --check                             (valida evals.json e fixtures)
// Opções:
//   --evals <arquivo>   usa outro evals.json (padrão: evals/evals.json)
//   --tipo <tipo>       com --all, só casos desse tipo (codigo | dpo | regressao)
//   --json              imprime o resultado em JSON
//
// Saída: 0 se tudo passou; 1 se algum caso falhou (ou faltou resposta, ou --check achou erro);
// 2 para erro de uso (caso inexistente, arquivo ausente, argumentos inválidos).
//
// A resposta e as regex são normalizadas antes da comparação: NFKD e sem acentos nas duas;
// na resposta, também sem "*" (negrito/itálico de Markdown) e sem o ponto de abreviações como
// "art." e "Res." (para não encerrar a frase); flag "i". Assim "Úteis", "uteis" e "**úteis**"
// casam com /uteis/, e "nº" vira "no".

const fs = require("fs");
const path = require("path");

const TIPOS = new Set(["codigo", "dpo", "regressao"]);
const CAMPOS = ["id", "tipo", "query", "files", "expected_behavior", "deve_conter", "nao_deve_conter", "armadilhas", "fontes"];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PADRAO_EVALS = path.join(__dirname, "evals.json");

class ErroDeUso extends Error {}

function semAcentos(s) {
  return String(s).normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

// Abreviações cujo ponto não encerra a frase ("art. 6º", "Res. 15/2024", "inc. II", "ex.:").
const ABREVIACOES = /\b(arts?|incs?|res|par|al|cf|ex|p|pag|caps?)\.(?=\s*\S)/gi;

function normalizarTexto(s) {
  return semAcentos(s).replace(/\*/g, "").replace(ABREVIACOES, "$1");
}

function compilar(padrao) {
  return new RegExp(semAcentos(padrao), "i");
}

function carregarEvals(arquivo = PADRAO_EVALS) {
  if (!fs.existsSync(arquivo)) throw new ErroDeUso(`evals.json não encontrado: ${arquivo}`);
  let dados;
  try {
    dados = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  } catch (e) {
    throw new ErroDeUso(`evals.json inválido (${arquivo}): ${e.message}`);
  }
  if (!Array.isArray(dados)) throw new ErroDeUso(`evals.json deve ser um array de casos: ${arquivo}`);
  return dados;
}

// ---------------------------------------------------------------- dados fictícios nas fixtures

function cpfComDvValido(digitos) {
  if (/^(\d)\1{10}$/.test(digitos)) return false; // 000.000.000-00 e afins: inválidos por convenção
  const d = digitos.split("").map(Number);
  const calc = (n) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += d[i] * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === d[9] && calc(10) === d[10];
}

const EMAIL_OK = /@example\.(?:com|org|net)$/i;

function listarArquivos(dir) {
  const saida = [];
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome);
    const st = fs.statSync(p);
    if (st.isDirectory()) saida.push(...listarArquivos(p));
    else if (st.size < 512 * 1024) saida.push(p);
  }
  return saida;
}

function verificarDadosFicticios(dir) {
  const erros = [];
  for (const arq of listarArquivos(dir)) {
    const texto = fs.readFileSync(arq, "utf8");
    for (const m of texto.matchAll(/(?<![\d.])(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})(?![\d])/g)) {
      const digitos = m[1] + m[2] + m[3] + m[4];
      if (cpfComDvValido(digitos)) erros.push(`${arq}: CPF com dígito verificador válido (${m[0]}); use DV inválido`);
    }
    for (const m of texto.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
      if (!EMAIL_OK.test(m[0])) erros.push(`${arq}: e-mail fora de example.com (${m[0]})`);
    }
  }
  return erros;
}

// ---------------------------------------------------------------- validação de evals.json

function checarEvals(casos, baseDir = __dirname) {
  const erros = [];
  const ids = new Set();
  casos.forEach((c, i) => {
    const onde = `caso #${i}${c && c.id ? ` (${c.id})` : ""}`;
    if (!c || typeof c !== "object" || Array.isArray(c)) {
      erros.push(`${onde}: não é um objeto`);
      return;
    }
    for (const campo of CAMPOS) if (!(campo in c)) erros.push(`${onde}: campo obrigatório ausente: ${campo}`);

    if (typeof c.id !== "string" || !ID_RE.test(c.id)) erros.push(`${onde}: id deve ser kebab-case`);
    else if (ids.has(c.id)) erros.push(`${onde}: id duplicado`);
    else ids.add(c.id);

    if (!TIPOS.has(c.tipo)) erros.push(`${onde}: tipo inválido (${c.tipo}); use codigo, dpo ou regressao`);
    if (typeof c.query !== "string" || !c.query.trim()) erros.push(`${onde}: query vazia`);

    const files = typeof c.files === "string" ? [c.files] : c.files;
    if (!Array.isArray(files)) erros.push(`${onde}: files deve ser uma lista (ou [])`);
    else {
      if (c.tipo === "codigo" && files.length === 0) erros.push(`${onde}: caso de código sem fixture em files`);
      for (const f of files) {
        if (typeof f !== "string") {
          erros.push(`${onde}: item de files não é texto`);
          continue;
        }
        const p = path.resolve(baseDir, f);
        if (!fs.existsSync(p)) erros.push(`${onde}: fixture não encontrada: ${f}`);
        else if (fs.statSync(p).isDirectory()) erros.push(...verificarDadosFicticios(p).map((e) => `${onde}: ${e}`));
      }
    }

    for (const campo of ["expected_behavior", "fontes"]) {
      if (!Array.isArray(c[campo]) || c[campo].length === 0 || c[campo].some((x) => typeof x !== "string" || !x.trim()))
        erros.push(`${onde}: ${campo} deve ser lista não vazia de textos`);
    }
    if (!Array.isArray(c.armadilhas) || c.armadilhas.some((x) => typeof x !== "string"))
      erros.push(`${onde}: armadilhas deve ser lista de textos (pode ser vazia)`);

    for (const campo of ["deve_conter", "nao_deve_conter"]) {
      if (!Array.isArray(c[campo])) {
        erros.push(`${onde}: ${campo} deve ser lista`);
        continue;
      }
      if (campo === "deve_conter" && c[campo].length === 0) erros.push(`${onde}: deve_conter vazio`);
      c[campo].forEach((padrao, j) => {
        if (typeof padrao !== "string" || !padrao) return erros.push(`${onde}: ${campo}[${j}] não é texto`);
        try {
          const re = compilar(padrao);
          if (re.test("")) erros.push(`${onde}: ${campo}[${j}] casa com texto vazio`);
        } catch (e) {
          erros.push(`${onde}: ${campo}[${j}] não compila: ${e.message}`);
        }
      });
    }
  });
  return erros;
}

// ---------------------------------------------------------------- pontuação

function pontuar(caso, resposta) {
  const texto = normalizarTexto(resposta);
  const faltou = caso.deve_conter.filter((p) => !compilar(p).test(texto));
  const proibidos = [];
  for (const p of caso.nao_deve_conter) {
    const m = compilar(p).exec(texto);
    if (m) proibidos.push({ padrao: p, trecho: m[0].slice(0, 160) });
  }
  return {
    id: caso.id,
    tipo: caso.tipo,
    passou: faltou.length === 0 && proibidos.length === 0,
    deve_conter: { total: caso.deve_conter.length, ok: caso.deve_conter.length - faltou.length, faltou },
    nao_deve_conter: { total: caso.nao_deve_conter.length, violados: proibidos },
  };
}

function formatar(r) {
  const linhas = [];
  const status = r.ausente ? "AUSENTE" : r.passou ? "PASS" : "FAIL";
  if (r.ausente) {
    linhas.push(`${status}  ${r.id}  (sem arquivo de resposta: ${r.arquivo})`);
    return linhas.join("\n");
  }
  linhas.push(
    `${status}  ${r.id}  deve_conter ${r.deve_conter.ok}/${r.deve_conter.total}` +
      `  nao_deve_conter ${r.nao_deve_conter.violados.length} violado(s)`,
  );
  for (const p of r.deve_conter.faltou) linhas.push(`      faltou:   /${p}/i`);
  for (const v of r.nao_deve_conter.violados) linhas.push(`      proibido: /${v.padrao}/i\n                trecho: "${v.trecho}"`);
  return linhas.join("\n");
}

function resumo(resultados) {
  const n = resultados.length;
  const pass = resultados.filter((r) => r.passou).length;
  const ausentes = resultados.filter((r) => r.ausente).length;
  const pontuados = resultados.filter((r) => !r.ausente);
  const dc = pontuados.reduce((a, r) => [a[0] + r.deve_conter.ok, a[1] + r.deve_conter.total], [0, 0]);
  const fp = pontuados.reduce((a, r) => a + r.nao_deve_conter.violados.length, 0);
  const porTipo = {};
  for (const r of resultados) {
    porTipo[r.tipo] = porTipo[r.tipo] || { pass: 0, total: 0 };
    porTipo[r.tipo].total++;
    if (r.passou) porTipo[r.tipo].pass++;
  }
  return { casos: n, pass, fail: n - pass, ausentes, acertos_deve_conter: dc[0], total_deve_conter: dc[1], violacoes_nao_deve_conter: fp, por_tipo: porTipo };
}

function formatarResumo(s) {
  const tipos = Object.entries(s.por_tipo).map(([t, v]) => `${t} ${v.pass}/${v.total}`).join(", ");
  return [
    "",
    `Resumo: ${s.pass}/${s.casos} casos PASS (${tipos})` + (s.ausentes ? `; ${s.ausentes} sem resposta` : ""),
    `        deve_conter ${s.acertos_deve_conter}/${s.total_deve_conter}; nao_deve_conter violado ${s.violacoes_nao_deve_conter}x`,
  ].join("\n");
}

// ---------------------------------------------------------------- CLI

function lerArgs(argv) {
  const opts = { evals: PADRAO_EVALS, json: false, tipo: null, pos: [], modo: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--evals") opts.evals = argv[++i];
    else if (a === "--tipo") opts.tipo = argv[++i];
    else if (a === "--json") opts.json = true;
    else if (a === "--all") opts.modo = "all";
    else if (a === "--check") opts.modo = "check";
    else if (a === "-h" || a === "--help") opts.modo = "help";
    else if (a.startsWith("--")) throw new ErroDeUso(`opção desconhecida: ${a}`);
    else opts.pos.push(a);
  }
  if (!opts.evals) throw new ErroDeUso("--evals precisa de um arquivo");
  if (opts.tipo && !TIPOS.has(opts.tipo)) throw new ErroDeUso(`--tipo inválido: ${opts.tipo}`);
  return opts;
}

const AJUDA = `Uso:
  node evals/score.cjs <id-do-caso> <arquivo-de-resposta>
  node evals/score.cjs --all <diretorio-de-respostas> [--tipo codigo|dpo|regressao]
  node evals/score.cjs --check
Opções: --evals <arquivo>  --json`;

function main(argv, out = console.log) {
  const opts = lerArgs(argv);
  if (opts.modo === "help") {
    out(AJUDA);
    return 0;
  }
  const casos = carregarEvals(opts.evals);
  const baseDir = path.dirname(path.resolve(opts.evals));

  if (opts.modo === "check") {
    const erros = checarEvals(casos, baseDir);
    if (opts.json) out(JSON.stringify({ ok: erros.length === 0, casos: casos.length, erros }, null, 2));
    else if (erros.length) {
      out(`evals.json: ${erros.length} erro(s)`);
      for (const e of erros) out(`  - ${e}`);
    } else {
      const porTipo = {};
      for (const c of casos) porTipo[c.tipo] = (porTipo[c.tipo] || 0) + 1;
      out(`evals.json OK: ${casos.length} casos (${Object.entries(porTipo).map(([t, n]) => `${t} ${n}`).join(", ")})`);
    }
    return erros.length ? 1 : 0;
  }

  const erros = checarEvals(casos, baseDir).filter((e) => /não compila|campo obrigatório|deve_conter/.test(e));
  if (erros.length) throw new ErroDeUso(`evals.json com problemas; rode --check:\n  ${erros.join("\n  ")}`);

  let resultados;
  if (opts.modo === "all") {
    const dir = opts.pos[0];
    if (!dir) throw new ErroDeUso("--all precisa do diretório de respostas");
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) throw new ErroDeUso(`diretório de respostas não encontrado: ${dir}`);
    const selecionados = casos.filter((c) => !opts.tipo || c.tipo === opts.tipo);
    resultados = selecionados.map((c) => {
      const arq = path.join(dir, `${c.id}.md`);
      if (!fs.existsSync(arq)) return { id: c.id, tipo: c.tipo, passou: false, ausente: true, arquivo: arq };
      return pontuar(c, fs.readFileSync(arq, "utf8"));
    });
  } else {
    const [id, arq] = opts.pos;
    if (!id || !arq) throw new ErroDeUso(AJUDA);
    const caso = casos.find((c) => c.id === id);
    if (!caso) throw new ErroDeUso(`caso inexistente: "${id}". Casos disponíveis: ${casos.map((c) => c.id).join(", ")}`);
    if (!fs.existsSync(arq) || !fs.statSync(arq).isFile()) throw new ErroDeUso(`arquivo de resposta não encontrado: ${arq}`);
    resultados = [pontuar(caso, fs.readFileSync(arq, "utf8"))];
  }

  const s = resumo(resultados);
  if (opts.json) out(JSON.stringify({ resumo: s, resultados }, null, 2));
  else {
    for (const r of resultados) out(formatar(r));
    if (resultados.length > 1) out(formatarResumo(s));
  }
  return s.fail ? 1 : 0;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    if (e instanceof ErroDeUso) {
      console.error(`erro: ${e.message}`);
      process.exitCode = 2;
    } else throw e;
  }
}

module.exports = { main, carregarEvals, checarEvals, pontuar, normalizarTexto, compilar, cpfComDvValido, ErroDeUso };
