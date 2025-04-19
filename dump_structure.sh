#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# dump_structure.sh – Exporta estrutura + conteúdo de um projeto Next.js
# ---------------------------------------------------------------------------

set -euo pipefail

ROOT_DIR="$(pwd)"
TIMESTAMP="$(date +'%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="${ROOT_DIR}/nextjs_structure_dump_${TIMESTAMP}.txt"

# extensões que queremos incluir
EXTENSIONS=(
  "*.js"  "*.jsx" "*.ts"  "*.tsx"
  "*.cjs" "*.mjs"
  "*.json"
  "*.yml" "*.yaml"
  "*.css" "*.scss" "*.sass"
  "*.md"  "*.mdx"
  "*.html"
)

# diretórios a ignorar
EXCLUDE_DIRS=(
  ".git" ".next" "node_modules" "out" "dist" ".vercel"
  ".turbo" ".cache" "coverage" "reports" "storybook-static"
  "public"       # comente essa linha se quiser incluir imagens/assets
)

# preparar output
mkdir -p "$(dirname "$OUTPUT_FILE")"
: > "$OUTPUT_FILE"

cat <<EOF >> "$OUTPUT_FILE"
🔎 Dump de Estrutura – Projeto Next.js
Raiz do projeto : $ROOT_DIR
Gerado em       : $(date)
------------------------------------------------------------

EOF

# monta a cláusula de exclusão
EXCLUDE_CLAUSE=()
for dir in "${EXCLUDE_DIRS[@]}"; do
  EXCLUDE_CLAUSE+=( -name "$dir" -o )
done
# remove o último -o
unset 'EXCLUDE_CLAUSE[${#EXCLUDE_CLAUSE[@]}-1]'

# monta a cláusula de extensões
EXTENSION_CLAUSE=()
for ext in "${EXTENSIONS[@]}"; do
  EXTENSION_CLAUSE+=( -iname "$ext" -o )
done
unset 'EXTENSION_CLAUSE[${#EXTENSION_CLAUSE[@]}-1]'

# executa o find
find "$ROOT_DIR" \
  \( -type d \( "${EXCLUDE_CLAUSE[@]}" \) -prune \) -o \
  -type f \( "${EXTENSION_CLAUSE[@]}" \) -print0 |
sort -z |
while IFS= read -r -d '' file; do
  filename="$(basename "$file")"
  relative_path="${file#"${ROOT_DIR}/"}"
  folder="$(dirname "$relative_path")"

  {
    echo "📄 Arquivo : $filename"
    echo "📂 Pasta   : $folder"
    echo "🧭 Caminho : $relative_path"
    echo "--------------------------------------"
    echo "📜 Conteúdo:"
    echo
  } >> "$OUTPUT_FILE"

  if file "$file" | grep -qE 'image|binary|ELF|compressed'; then
    echo "[Arquivo binário / imagem – conteúdo omitido]" >> "$OUTPUT_FILE"
  else
    cat "$file" >> "$OUTPUT_FILE"
  fi

  echo -e "\n\n============================================================\n\n" >> "$OUTPUT_FILE"
done

echo "✅ Estrutura exportada em: $OUTPUT_FILE"
