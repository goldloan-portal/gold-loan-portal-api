#!/usr/bin/env bash
# Verify a CHANGELOG version section matches the tickets actually landing in this release.
#
#   scripts/audit-changelog.sh 0.2.0            # baseline = latest tag
#   scripts/audit-changelog.sh 0.2.0 v0.1.0     # explicit baseline
#
# Exits non-zero when the section documents work that is not in the range (an entry
# filed against the wrong version) or omits work that is.
set -uo pipefail

VER="${1:-}"
if [ -z "$VER" ]; then
  echo "usage: $0 <version> [baseline-ref]" >&2
  exit 2
fi
VER="${VER#v}"

BASE="${2:-$(git tag --sort=-v:refname | head -1)}"
if [ -z "$BASE" ]; then BASE=$(git rev-list --max-parents=0 HEAD | tail -1); fi

TICKET_RE='GLA-[0-9]+'

SECTION=$(awk -v v="## [$VER]" 'index($0, v) == 1 { f = 1; next } f && /^## \[/ { exit } f' CHANGELOG.md)
if [ -z "$SECTION" ]; then
  echo "no '## [$VER]' section in CHANGELOG.md" >&2
  exit 2
fi

DOCUMENTED=$(echo "$SECTION" | grep -oE "$TICKET_RE" | sort -u)
SHIPPED=$(git log "$BASE..HEAD" --pretty=%s%n%b | grep -oE "$TICKET_RE" | sort -u)

# Tickets carrying at least one user-facing commit. Types excluded from the
# CHANGELOG are excluded here too, so a chore-only ticket is not reported missing.
NOTABLE=$(
  for C in $(git log "$BASE..HEAD" --pretty=%H); do
    SUBJECT=$(git log -1 --pretty=%s "$C")
    if echo "$SUBJECT" | grep -qE '^(chore|docs|style|test|build|ci)'; then
      continue
    fi
    git log -1 --pretty=%s%n%b "$C" | grep -oE "$TICKET_RE"
  done | sort -u
)

STALE=$(comm -13 <(echo "$SHIPPED") <(echo "$DOCUMENTED"))
MISSING=$(comm -23 <(echo "$NOTABLE") <(echo "$DOCUMENTED"))

RC=0
if [ -n "$STALE" ]; then
  echo "MIS-FILED - documented under $VER but no commit in $BASE..HEAD:"
  echo "$STALE" | sed 's/^/  /'
  echo "  Move these to the version that ships them before releasing."
  RC=1
fi
if [ -n "$MISSING" ]; then
  echo "UNDOCUMENTED - shipping in $VER with no CHANGELOG entry:"
  echo "$MISSING" | sed 's/^/  /'
  RC=1
fi
if [ "$RC" -eq 0 ]; then
  echo "CHANGELOG [$VER] matches $BASE..HEAD"
fi
exit "$RC"
