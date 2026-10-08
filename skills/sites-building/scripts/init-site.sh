#!/usr/bin/env bash
set -euo pipefail

target="${1:-${SITES_WORKSPACE:-$PWD}}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
starter="$(cd "$script_dir/../templates/vinext-starter" && pwd)"

mkdir -p "$target"
if find "$target" -mindepth 1 -maxdepth 1 \
  ! -name '.git' ! -name '.DS_Store' ! -name 'work' ! -name 'outputs' \
  -print -quit | grep -q .; then
  echo "Target is not empty: $target" >&2
  exit 2
fi

cp -R "$starter"/. "$target"/

# Refresh the design-token layer from its source of truth so generated sites
# inherit the latest system even if the starter copy is stale.
token_src="$script_dir/../../sites-design/assets/tokens/tokens.css"
if [[ -f "$token_src" ]]; then
  mkdir -p "$target/styles"
  cp "$token_src" "$target/styles/tokens.css"
fi

cd "$target"
if [[ ! -d .git ]]; then
  git init -b main >/dev/null
fi
if [[ -f package-lock.json ]]; then
  npm ci --ignore-scripts --prefer-offline --no-audit --no-fund
else
  npm install --ignore-scripts --prefer-offline --no-audit --no-fund
fi
