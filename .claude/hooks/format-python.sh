#!/bin/bash
# Hook: Formata arquivos Python apos edicao usando ruff
# Recebe JSON via stdin com tool_input contendo file_path

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.content.file_path // empty')

# Verificar se e um arquivo Python
if [[ -z "$FILE_PATH" ]] || [[ "$FILE_PATH" != *.py ]]; then
  exit 0
fi

# Verificar se o arquivo existe
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Verificar se ruff esta disponivel
if command -v ruff &> /dev/null; then
  ruff check --fix --quiet "$FILE_PATH" 2>/dev/null
  ruff format --quiet "$FILE_PATH" 2>/dev/null
fi

exit 0
