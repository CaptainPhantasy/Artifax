#!/usr/bin/env bash
set -euo pipefail

project="${1:-$PWD}"
archive="${2:?usage: package-site.sh PROJECT_DIR ARCHIVE_PATH}"
build_dir="$project/dist"
hosting="$project/.sites/hosting.json"

test -f "$build_dir/server/index.js" || { echo "Missing dist/server/index.js" >&2; exit 2; }
test -f "$hosting" || { echo "Missing .sites/hosting.json" >&2; exit 2; }

stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT
mkdir -p "$stage/dist/.sites"
cp -R "$build_dir"/. "$stage/dist"/
cp "$hosting" "$stage/dist/.sites/hosting.json"
if test -d "$project/drizzle"; then
  mkdir -p "$stage/dist/.sites/drizzle"
  cp -R "$project/drizzle"/. "$stage/dist/.sites/drizzle"/
fi

mkdir -p "$(dirname "$archive")"
tar -C "$stage" -czf "$archive" dist
archive_entries="$(tar -tzf "$archive")"
grep -qx 'dist/server/index.js' <<<"$archive_entries"
grep -qx 'dist/.sites/hosting.json' <<<"$archive_entries"
printf '%s\n' "$archive"
