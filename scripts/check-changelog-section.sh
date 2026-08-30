#!/usr/bin/env bash
# Reject changelog entries added outside [Unreleased]. A released version block
# records what that release shipped; filing pending work there dates it wrong.
set -uo pipefail

FILE=CHANGELOG.md

[ "${CHANGELOG_RECONCILE:-}" = "1" ] && exit 0

if [ "${1:-}" = "--base" ]; then
  BASE="${2:?usage: $0 --base <ref>}"
  DIFF=$(git diff "$BASE...HEAD" -- "$FILE")
  CONTENT=$(git show "HEAD:$FILE" 2>/dev/null)
else
  DIFF=$(git diff --cached -- "$FILE")
  CONTENT=$(git show ":$FILE" 2>/dev/null)
fi

[ -z "$DIFF" ] && exit 0

ADDED=$(printf '%s\n' "$DIFF" | grep -E '^\+- \[GLA-[0-9]+\]' | sed 's/^+//')
[ -z "$ADDED" ] && exit 0

UNRELEASED=$(printf '%s\n' "$CONTENT" | awk '/^## \[Unreleased\]/{f=1;next} f && /^## \[/{exit} f')

BAD=""
while IFS= read -r LINE; do
  [ -z "$LINE" ] && continue
  printf '%s\n' "$UNRELEASED" | grep -Fqx -- "$LINE" || BAD="$BAD$LINE"$'\n'
done <<< "$ADDED"

[ -z "$BAD" ] && exit 0

{
  echo
  echo "CHANGELOG.md: entry added outside the [Unreleased] section."
  echo
  printf '%s' "$BAD" | cut -c1-100 | sed 's/^/  /'
  echo
  echo "A released version block records what that release shipped. An entry filed"
  echo "there claims work the release never contained. Move these under ## [Unreleased]."
  echo
  echo "Reconciling history on purpose? Re-run with CHANGELOG_RECONCILE=1."
  echo
} >&2
exit 1
