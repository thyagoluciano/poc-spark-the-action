#!/bin/bash
# Hook: Formata arquivos TypeScript/TSX/CSS apos edicao usando prettier
# Recebe JSON via stdin com tool_input contendo file_path

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.content.file_path // empty')

# Verificar se e um arquivo frontend
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.css|*.json)
    ;;
  *)
    exit 0
    ;;
esac

# Verificar se o arquivo existe
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Verificar se prettier esta disponivel no projeto
PROJ_DIR=$(dirname "$FILE_PATH")
while [[ "$PROJ_DIR" != "/" ]]; do
  if [[ -f "$PROJ_DIR/node_modules/.bin/prettier" ]]; then
    "$PROJ_DIR/node_modules/.bin/prettier" --write --log-level silent "$FILE_PATH" 2>/dev/null
    exit 0
  fi
  PROJ_DIR=$(dirname "$PROJ_DIR")
done

# Fallback para prettier global
if command -v prettier &> /dev/null; then
  prettier --write --log-level silent "$FILE_PATH" 2>/dev/null
fi

exit 0
