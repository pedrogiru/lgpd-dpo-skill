#!/usr/bin/env node

/**
 * Valida achados.json contra schemas/achados.schema.json.
 * Uso: node validate-findings.cjs <caminho/achados.json>
 *
 * Interpretador sem dependências para o subconjunto de JSON Schema usado no schema, mais checagens
 * semânticas que ficam mais claras em código: fingerprints únicos, nível de risco coerente, fluxo
 * provado no repositório para achados confirmados e ausência de dado pessoal real nos textos.
 */

const fs = require("fs");
const path = require("path");

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
// achados.json de uma auditoria grande cabe com folga em 5 MiB; acima disso, algo deu errado.
const MAX_INPUT_BYTES = 5 * 1024 * 1024;
// Mais que isso esconde o erro que importa; o modelo corrige e roda de novo.
const MAX_ERRORS = 100;
// Profundidade bem acima da do schema (4 níveis); protege contra JSON patológico.
const MAX_DEPTH = 32;
const SCHEMA_PATH = path.join(__dirname, "..", "schemas", "achados.schema.json");

const IMPACTO_RANK = new Map([["baixo", 1], ["medio", 2], ["alto", 3], ["critico", 4]]);
const NIVEL_RANK = new Map([["baixo", 1], ["medio", 2], ["alto", 3], ["critico", 4]]);
const SENSIVEIS = new Set(["sensivel_saude", "sensivel_outros", "crianca_adolescente"]);

// Padrões de dado pessoal que não devem aparecer em achados. Documentos só contam como "reais" quando
// o dígito verificador é válido e os dígitos não são todos iguais: 000.000.000-00 e 111.222.333-00
// (DV inválido) são aceitos como fictícios.
const CPF_FORMATADO = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
const CNPJ_FORMATADO = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g;
const DIGITOS_SOLTOS = /(?<![\d.\/-])\d{11}(?:\d{3})?(?![\d.\/-])/g;
const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const EMAIL_FICTICIO = /@(example\.(com|org|net)|exemplo\.com(\.br)?|teste\.com(\.br)?|[a-z0-9-]+\.(test|example|invalid|local))$/i;
const TELEFONE = /(?:\+55\s?)?\(?\b[1-9]{2}\)?[\s-]?(?:9\d{4}|[2-5]\d{3})-?\d{4}\b/g;

function digitosIguais(d) {
  return /^(\d)\1+$/.test(d);
}

function cpfValido(texto) {
  const d = texto.replace(/\D/g, "");
  if (d.length !== 11 || digitosIguais(d)) return false;
  const dv = (base) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (base.length + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return dv(d.slice(0, 9)) === Number(d[9]) && dv(d.slice(0, 10)) === Number(d[10]);
}

function cnpjValido(texto) {
  const d = texto.replace(/\D/g, "");
  if (d.length !== 14 || digitosIguais(d)) return false;
  const dv = (base) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = pesos.reduce((acc, p, i) => acc + p * Number(base[i]), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return dv(d.slice(0, 12)) === Number(d[12]) && dv(d.slice(0, 13)) === Number(d[13]);
}

function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function resolveRef(schema, root) {
  if (!schema || !hasOwn(schema, "$ref")) return schema;
  const parts = schema.$ref.replace(/^#\//, "").split("/");
  let target = root;
  for (const part of parts) {
    if (!target || !hasOwn(target, part)) throw new Error(`$ref não resolvido: ${schema.$ref}`);
    target = target[part];
  }
  return target;
}

function validate(value, rawSchema, root, at, errors, depth = 0) {
  const schema = resolveRef(rawSchema, root);
  if (errors.length >= MAX_ERRORS) return;
  if (depth > MAX_DEPTH) {
    errors.push(`${at}: aninhamento acima de ${MAX_DEPTH} níveis`);
    return;
  }

  if (schema.oneOf) {
    const results = schema.oneOf.map((option) => {
      const local = [];
      validate(value, option, root, at, local, depth + 1);
      return local;
    });
    const passing = results.filter((r) => r.length === 0).length;
    if (passing === 1) return;
    if (passing > 1) {
      errors.push(`${at}: corresponde a mais de um formato`);
      return;
    }
    // Reporta os erros do ramo cujo veredito bate, quando houver.
    const index = schema.oneOf.findIndex((option) => {
      const v = resolveRef(option, root).properties?.veredito;
      return v && value && typeof value === "object" && value.veredito === v.const;
    });
    if (index >= 0) errors.push(...results[index]);
    else errors.push(`${at}: veredito ausente ou inválido (use confirmado, precisa_validacao, observacao ou rejeitado)`);
    return;
  }

  if (schema.type) {
    const actual = typeOf(value);
    const ok = schema.type === actual || (schema.type === "number" && actual === "integer");
    if (!ok) {
      errors.push(`${at}: esperado ${schema.type}, recebido ${actual}`);
      return;
    }
  }
  if (hasOwn(schema, "const") && value !== schema.const) errors.push(`${at}: deve ser ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${at}: "${value}" não está em [${schema.enum.join(", ")}]`);

  if (typeof value === "string") {
    if (schema.minLength && value.trim().length < schema.minLength) errors.push(`${at}: texto vazio`);
    if (schema.pattern && !new RegExp(schema.pattern, "u").test(value)) errors.push(`${at}: não segue o padrão ${schema.pattern}`);
  }
  if (typeof value === "number" && hasOwn(schema, "minimum") && value < schema.minimum) {
    errors.push(`${at}: deve ser >= ${schema.minimum}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${at}: precisa de pelo menos ${schema.minItems} item(ns)`);
    if (schema.uniqueItems) {
      const seen = new Set();
      value.forEach((item, i) => {
        const key = JSON.stringify(item);
        if (seen.has(key)) errors.push(`${at}[${i}]: item repetido`);
        seen.add(key);
      });
    }
    if (schema.items) value.forEach((item, i) => validate(item, schema.items, root, `${at}[${i}]`, errors, depth + 1));
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required || []) {
      if (!hasOwn(value, key)) errors.push(`${at}: campo obrigatório ausente "${key}"`);
    }
    const props = schema.properties || {};
    for (const [key, child] of Object.entries(value)) {
      if (hasOwn(props, key)) validate(child, props[key], root, `${at}.${key}`, errors, depth + 1);
      else if (schema.additionalProperties === false) errors.push(`${at}: campo não permitido "${key}"`);
    }
  }
}

function* strings(value, at, depth = 0) {
  if (depth > MAX_DEPTH) return;
  if (typeof value === "string") yield [at, value];
  else if (Array.isArray(value)) for (let i = 0; i < value.length; i++) yield* strings(value[i], `${at}[${i}]`, depth + 1);
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) yield* strings(v, `${at}.${k}`, depth + 1);
}

function checkPersonalData(record, at, errors) {
  for (const [where, text] of strings(record, at)) {
    for (const m of text.matchAll(CPF_FORMATADO)) {
      if (cpfValido(m[0])) errors.push(`${where}: parece conter um CPF real (DV válido); use 000.000.000-00`);
    }
    for (const m of text.matchAll(CNPJ_FORMATADO)) {
      if (cnpjValido(m[0])) errors.push(`${where}: parece conter um CNPJ real (DV válido); use 00.000.000/0000-00`);
    }
    for (const m of text.matchAll(DIGITOS_SOLTOS)) {
      if (cpfValido(m[0]) || cnpjValido(m[0])) errors.push(`${where}: sequência numérica com DV válido de CPF ou CNPJ; cite o campo, não o valor`);
    }
    for (const m of text.matchAll(EMAIL)) {
      if (!EMAIL_FICTICIO.test(m[0])) errors.push(`${where}: parece conter um e-mail real (${m[0].replace(/^[^@]+/, "***")}); use um domínio example.com`);
    }
    if (TELEFONE.test(text)) errors.push(`${where}: parece conter um telefone; cite o campo, não o valor`);
    TELEFONE.lastIndex = 0;
  }
}

function semanticChecks(records, errors) {
  const fingerprints = new Map();
  records.forEach((record, i) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) return;
    const at = `[${i}]`;

    if (typeof record.fingerprint === "string") {
      if (fingerprints.has(record.fingerprint)) {
        errors.push(`${at}: fingerprint repetido "${record.fingerprint}" (também em [${fingerprints.get(record.fingerprint)}])`);
      } else {
        fingerprints.set(record.fingerprint, i);
      }
    }

    if (Array.isArray(record.fluxo)) {
      record.fluxo.forEach((passo, j) => {
        if (!passo || typeof passo !== "object") return;
        const fora = passo.origem === "fora_do_repositorio";
        if (fora && record.veredito === "confirmado") {
          errors.push(`${at}.fluxo[${j}]: achado confirmado precisa de fluxo provado no repositório; uma etapa fora do repositório torna o achado precisa_validacao`);
        }
        if (!fora && (!hasOwn(passo, "arquivo") || !hasOwn(passo, "linha"))) {
          errors.push(`${at}.fluxo[${j}]: etapa no repositório precisa de "arquivo" e "linha" (ou marque origem: "fora_do_repositorio")`);
        }
      });
    }

    if (record.veredito === "confirmado" && record.risco && typeof record.risco === "object") {
      const impacto = IMPACTO_RANK.get(record.risco.impacto);
      const nivel = NIVEL_RANK.get(record.risco.nivel);
      if (impacto !== undefined && nivel !== undefined && nivel > impacto) {
        errors.push(`${at}.risco: nivel "${record.risco.nivel}" não pode passar do impacto "${record.risco.impacto}"`);
      }
      const categorias = Array.isArray(record.categorias_dados) ? record.categorias_dados : [];
      if (categorias.some((c) => SENSIVEIS.has(c)) && record.risco.impacto === "baixo") {
        errors.push(`${at}.risco: dado sensível ou de criança/adolescente com impacto "baixo"; use "medio" ou maior, ou revise a categoria`);
      }
    }

    checkPersonalData(record, at, errors);
  });
}

function validateFile(file) {
  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  } catch (err) {
    return [`não consegui ler o schema em ${SCHEMA_PATH}: ${err.message}`];
  }

  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    return [`arquivo não encontrado: ${file}`];
  }
  if (!stat.isFile()) return [`não é um arquivo: ${file}`];
  if (stat.size > MAX_INPUT_BYTES) return [`arquivo maior que ${MAX_INPUT_BYTES} bytes`];

  let records;
  try {
    records = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    return [`JSON inválido: ${err.message}`];
  }

  const errors = [];
  validate(records, schema, schema, "achados", errors);
  if (Array.isArray(records)) semanticChecks(records, errors);
  return errors.slice(0, MAX_ERRORS);
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error("uso: node validate-findings.cjs <achados.json>");
    process.exit(2);
  }
  const errors = validateFile(file);
  if (errors.length) {
    console.error(`${errors.length} erro(s) em ${file}:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  const records = JSON.parse(fs.readFileSync(file, "utf8"));
  const count = (v) => records.filter((r) => r.veredito === v).length;
  console.log(
    `ok: ${count("confirmado")} confirmado(s), ${count("precisa_validacao")} precisa_validacao, ` +
      `${count("observacao")} observação(ões), ${count("rejeitado")} rejeitado(s)`,
  );
}

module.exports = { validateFile, cpfValido, cnpjValido };
