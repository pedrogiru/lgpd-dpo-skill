#!/usr/bin/env bash
# Roda os casos de evals.json no Claude Code headless e grava uma resposta por caso.
#
# Requer bash 3.2+ (padrão do macOS), Node.js e o Claude Code no PATH.
# Uso: evals/rodar.sh <com|sem> <modelo> <dir-saida> [id ...]
#   com  skill instalada e habilitada (condição 2); SKILL_DIR aponta a pasta da skill testada
#   sem  --disable-slash-commands, sem nenhuma skill (condição 1)
#
# Cada caso roda numa cópia descartável da fixture, fora do repositório, para o modelo não ler o
# gabarito. Grava <dir-saida>/<id>.md (texto final), <id>.jsonl (transcrição) e <id>.skill
# (lista de skills acionadas) e <id>.exit (código de saída do claude). Um caso que falha é avisado no
# stderr e não interrompe os demais. Paralelismo: PARALELO=4 por padrão.
#
# Limitação: a condição "com" não isola outras skills, plugins nem CLAUDE.md do usuário (o
# --safe-mode desligaria também a skill testada). Rode numa conta ou máquina limpa para um
# benchmark público.
set -euo pipefail

condicao=${1:?uso: rodar.sh <com|sem> <modelo> <dir-saida> [id ...]}
modelo=${2:?informe o modelo}
saida=${3:?informe o diretório de saída}
shift 3

raiz=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$saida"
saida=$(cd "$saida" && pwd)

# Pasta real da skill. Em modo headless o agente só lê fora do diretório de trabalho o que estiver
# em --add-dir; sem isso, ele lê o SKILL.md mas não os arquivos de apoio (equivale a um usuário que
# negou a leitura).
skill_dir=${SKILL_DIR:-$raiz/../skills/lgpd-dpo}
skill_dir=$(cd "$skill_dir" && pwd -P)

case "$condicao" in
  com) flags=(--add-dir "$skill_dir") ;;
  sem) flags=(--disable-slash-commands) ;;
  *) echo "condição inválida: $condicao (use com ou sem)" >&2; exit 2 ;;
esac

if [ "$#" -gt 0 ]; then
  ids=("$@")
else
  ids=()
  while IFS= read -r linha; do ids+=("$linha"); done < <(node -e 'for (const c of require(process.argv[1])) console.log(c.id)' "$raiz/evals.json")
fi

rodar_caso() {
  local id=$1 tmp fixture
  tmp=$(mktemp -d)
  fixture=$(node -e 'const c=require(process.argv[1]).find(x=>x.id===process.argv[2]); if(!c){process.exit(3)} process.stdout.write((c.files&&c.files[0])||"")' "$raiz/evals.json" "$id")
  if [ -n "$fixture" ]; then cp -R "$raiz/$fixture/." "$tmp"; fi
  (
    cd "$tmp"
    node -e 'process.stdout.write(require(process.argv[1]).find(x=>x.id===process.argv[2]).query)' "$raiz/evals.json" "$id" \
      | claude -p --model "$modelo" --no-session-persistence --output-format stream-json --verbose ${flags[@]+"${flags[@]}"} \
      > "$saida/$id.jsonl" 2> "$saida/$id.err"
    echo $? > "$saida/$id.exit"
  ) || true
  node -e '
    const fs = require("fs");
    const linhas = fs.readFileSync(process.argv[1], "utf8").split("\n").filter(Boolean);
    let texto = "", skills = new Set();
    for (const l of linhas) {
      let m; try { m = JSON.parse(l); } catch { continue; }
      if (m.type === "result" && typeof m.result === "string") texto = m.result;
      for (const b of (m.message && m.message.content) || []) {
        if (b.type === "tool_use" && b.name === "Skill") skills.add((b.input && (b.input.skill || b.input.name)) || "?");
      }
    }
    fs.writeFileSync(process.argv[2], texto);
    fs.writeFileSync(process.argv[3], [...skills].join("\n"));
  ' "$saida/$id.jsonl" "$saida/$id.md" "$saida/$id.skill"
  rm -rf "$tmp"
  local codigo
  codigo=$(cat "$saida/$id.exit" 2>/dev/null || echo "?")
  if [ "$codigo" != "0" ] || [ ! -s "$saida/$id.md" ]; then
    echo "$id: FALHOU (saída do claude: $codigo; veja $saida/$id.err)" >&2
  fi
  echo "$id: $(wc -c < "$saida/$id.md" | tr -d ' ') bytes, skills: $(tr '\n' ' ' < "$saida/$id.skill")"
}
export -f rodar_caso
export raiz saida modelo
flags_str=""
if [ "${#flags[@]}" -gt 0 ]; then flags_str="${flags[*]}"; fi
export flags_str

# Funções exportadas não levam arrays; reconstrói as flags dentro de cada subshell.
printf '%s\n' "${ids[@]}" | xargs -P "${PARALELO:-4}" -I{} bash -c 'flags=($flags_str); rodar_caso "$1"' _ {}
