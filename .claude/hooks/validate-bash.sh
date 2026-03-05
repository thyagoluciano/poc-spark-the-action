#!/bin/bash
# Hook: Valida comandos bash antes da execucao para prevenir operacoes destrutivas
# Recebe JSON via stdin com tool_input contendo command

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Bloquear comandos destrutivos
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \."
  "dd if="
  "mkfs\."
  ":(){.*};"
  "chmod -R 777"
  "> /dev/sd"
  "DROP DATABASE"
  "DROP TABLE"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "Comando bloqueado: padrao destrutivo detectado ($pattern)" >&2
    exit 2
  fi
done

exit 0
