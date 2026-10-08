#!/usr/bin/env bash
set -euo pipefail

# Package a built site for hosting, and/or export a clean, git-ready source tree.
#
#   package-site.sh PROJECT_DIR ARCHIVE_PATH [--git-ready SOURCE_DIR]
#
# ARCHIVE_PATH   -> deploy artifact: a tarball of dist/ (+ .sites/hosting.json,
#                   drizzle/ when present). Requires a completed build.
# --git-ready DIR -> a source export you can push to a repo: tracked source
#                   only (no node_modules/dist/caches), a .gitignore, and an
#                   initial commit. Does NOT require a build.
#
# With QUALITY_GATE=1 the deploy path runs the quality gate first and aborts on
# a blocking failure.

project="${1:-$PWD}"
shift || true

archive=""
git_ready=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --git-ready)
      git_ready="${2:?--git-ready needs a target directory}"
      shift 2
      ;;
    -*)
      echo "unknown option: $1" >&2
      exit 2
      ;;
    *)
      if [[ -z "$archive" ]]; then
        archive="$1"
        shift
      else
        echo "unexpected argument: $1" >&2
        exit 2
      fi
      ;;
  esac
done

if [[ -z "$archive" && -z "$git_ready" ]]; then
  echo "usage: package-site.sh PROJECT_DIR ARCHIVE_PATH [--git-ready SOURCE_DIR]" >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
site_name="$(basename "$(cd "$project" && pwd)")"

# --- deploy artifact -------------------------------------------------------
if [[ -n "$archive" ]]; then
  build_dir="$project/dist"
  hosting="$project/.sites/hosting.json"

  test -f "$build_dir/server/index.js" || { echo "Missing dist/server/index.js" >&2; exit 2; }
  test -f "$hosting" || { echo "Missing .sites/hosting.json" >&2; exit 2; }

  # Optional quality gate. Static checks always run; live audits (Lighthouse, axe)
  # run when SITES_AUDIT_URL is set. With QUALITY_GATE=1, blocking failures abort.
  if [[ "${QUALITY_GATE:-0}" == "1" ]]; then
    platform_root="$(cd "$script_dir/../../.." && pwd)"
    node "$platform_root/skills/sites-quality/scripts/quality-gate.mjs" "$project"
  fi

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
fi

# --- git-ready source export ----------------------------------------------
if [[ -n "$git_ready" ]]; then
  if [[ -e "$git_ready" ]]; then
    echo "git-ready target already exists: $git_ready" >&2
    exit 2
  fi
  mkdir -p "$git_ready"

  # Copy source only — skip dependencies, build output, and machine caches so
  # the export is small and clean regardless of local build state.
  for entry in "$project"/.[!.]* "$project"/*; do
    [[ -e "$entry" ]] || continue
    case "${entry##*/}" in
      node_modules|dist|.next|.vinext|.wrangler|coverage|outputs|work|.git|.DS_Store) continue ;;
    esac
    cp -R "$entry" "$git_ready"/
  done
  # Drop generated verification artifacts; keep the hosting contract.
  rm -f "$git_ready/.sites/quality.json"
  rm -rf "$git_ready/.sites/critique"

  if [[ ! -f "$git_ready/.gitignore" ]]; then
    printf '%s\n' node_modules/ dist/ .next/ .vinext/ .wrangler/ .sites/ coverage/ outputs/ work/ .DS_Store > "$git_ready/.gitignore"
  fi

  git -C "$git_ready" init -b main >/dev/null
  # Provide a local identity only when none is configured, so the initial
  # commit never fails on a fresh machine.
  git -C "$git_ready" config user.email >/dev/null 2>&1 || \
    git -C "$git_ready" config user.email "export@artifax.local"
  git -C "$git_ready" config user.name >/dev/null 2>&1 || \
    git -C "$git_ready" config user.name "Artifax export"
  git -C "$git_ready" add -A
  git -C "$git_ready" commit -q -m "Initial site export: $site_name"
  printf '%s\n' "$git_ready"
fi
