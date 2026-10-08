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

# Copy the starter, skipping anything a local build may have left behind
# (node_modules, dist, wrangler/vinext caches, stray OS files). The template is
# built in place by the test suite, so without this a freshly scaffolded site
# would inherit hundreds of MB of stale dependencies and build output.
for entry in "$starter"/.[!.]* "$starter"/*; do
  [[ -e "$entry" ]] || continue
  case "${entry##*/}" in
    node_modules|dist|.next|.vinext|.wrangler|coverage|outputs|work|.DS_Store) continue ;;
  esac
  cp -R "$entry" "$target"/
done

# Generated verification artifacts live under .sites/; keep only the tracked
# hosting contract so a new site does not inherit another site's report.
rm -f "$target/.sites/quality.json"
rm -rf "$target/.sites/critique"

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
