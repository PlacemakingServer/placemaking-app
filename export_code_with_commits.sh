#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# export_git_activity.sh
# Gera um TXT com:
#   1) ROLL-UP semanal   – commits + linhas adicionadas/removidas por autor/semana
#   2) COMMITS detalhados – ordem cronológica, com numstat (arquivo +adds +dels)
#      Isso atende análise de esforço/hora por contribuidor.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

################################################################################
# Ajustes rápidos
################################################################################
OUT="activity_$(date +%Y-%m-%d_%H%M%S).txt"
IGNORE_MERGES="--no-merges"      # troque para "" se quiser incluir merges
DATE_FMT="short"                 # short | iso | rfc | relative …
################################################################################

[ -d .git ] || { echo "❌ Não há repositório Git aqui."; exit 1; }
command -v git >/dev/null || { echo "❌ Git não encontrado."; exit 1; }

echo "📝 Gerando $OUT …"
{
###############################################################################
# 1) ROLL-UP SEMANAL ///////////////////////////////////////////////////////////
###############################################################################
echo "================  ROLL-UP SEMANAL POR CONTRIBUIDOR  =================="
echo "(ISO-week, commits, +linhas, -linhas)"
echo

# Coleta: data ISO-week, autor, +adds, -dels
git log $IGNORE_MERGES --date=iso --pretty='%ad|%an' --numstat |
awk -F'|' '
  BEGIN { OFS="|" }
  /^[0-9]{4}-/ {
      split($1,dt," ");         # dt[1] = YYYY-MM-DD
      cmd = "date -d " dt[1] " +%G-W%V"; cmd | getline wk; close(cmd);
      week = wk; author = $2;
      nextline = getline;        # lê primeira linha de numstat ou blank
      while(nextline && $0 != "") {
          if(NF==3) { plus=$1; minus=$2 }
          else      { plus=0; minus=0 }
          key = week FS author;
          commits[key]++; adds[key]+=plus; dels[key]+=minus;
          nextline = getline;
      }
  }
  END {
      PROCINFO["sorted_in"]="@ind_str_asc";
      for(k in commits){
          split(k,a,FS); printf "%s | %-20s | %4d | %+7d | -%7d\n",
                 a[1], a[2], commits[k], adds[k], dels[k]
      }
  }'

echo
###############################################################################
# 2) HISTÓRICO COMPLETO ////////////////////////////////////////////////////////
###############################################################################
echo "================  HISTÓRICO DETALHADO  (cronológico) ================="
echo

git log $IGNORE_MERGES --reverse --date=$DATE_FMT \
  --pretty=$'---\nCOMMIT %h\nAUTHOR %an\nDATE   %ad\nMSG    %s' --numstat |
sed 's/^$/    /'          # deixa linha em branco antes de cada bloco numstat

} > "$OUT"

echo "✅ Pronto! Arquivo gerado em: $OUT"
