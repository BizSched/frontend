#!/usr/bin/env bash
# 리뷰 범위와 "변경 의도" 근거를 모아서 출력한다.
#
# Usage:
#   bash diff-summary.sh                          로컬 변경 (staged + unstaged + untracked)
#   bash diff-summary.sh <target-branch>          base 자동 해석 후 base...target
#   bash diff-summary.sh <target-branch> <base>   base 명시
#   bash diff-summary.sh --pr <num>               PR의 실제 base branch 기준
#   CODE_REVIEW_BASE=<base> bash diff-summary.sh <target-branch>
#
# base branch는 어떤 모드에서도 하드코딩하지 않는다. common.sh의 cr_resolve_base 참고.

set -uo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=./common.sh
. "${SCRIPT_DIR}/common.sh"

rule() { echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

rule
echo "  Code Review — Diff Summary"
rule
echo ""

# ── PR 모드 ──────────────────────────────────────────────────────────────────
if [[ "${1:-}" == "--pr" ]]; then
  PR_NUM="${2:-}"
  if [[ -z "$PR_NUM" ]]; then
    echo "Usage: diff-summary.sh --pr <pr-number>" >&2
    exit 1
  fi
  if ! command -v gh >/dev/null 2>&1; then
    echo "Error: gh CLI가 없다. 'brew install gh' 후 다시 실행한다." >&2
    exit 1
  fi

  PR_BASE=$(gh pr view "$PR_NUM" --json baseRefName --jq '.baseRefName' 2>/dev/null || true)
  if [[ -z "$PR_BASE" ]]; then
    echo "Error: PR #${PR_NUM} 정보를 가져오지 못했다." >&2
    exit 1
  fi

  echo "Mode   : PR #${PR_NUM}"
  echo "Base   : ${PR_BASE}   (PR이 실제로 대상으로 하는 브랜치)"
  echo ""
  gh pr view "$PR_NUM" --json title,author,headRefName,url \
    --template '  Title : {{.title}}
  Author: {{.author.login}}
  Head  : {{.headRefName}}
  URL   : {{.url}}
'
  echo ""
  echo "── 변경 의도 (PR 본문) ──────────────────────────────────"
  PR_BODY=$(gh pr view "$PR_NUM" --json body --jq '.body' 2>/dev/null || true)
  if [[ -z "$PR_BODY" || "$PR_BODY" == "null" ]]; then
    echo "  (PR 본문 없음 — 요구사항 적합성 평가는 제한됨)"
  else
    printf '%s\n' "$PR_BODY" | sed 's/^/  /'
  fi
  echo ""
  echo "── 커밋 ────────────────────────────────────────────────"
  gh pr view "$PR_NUM" --json commits \
    --jq '.commits[] | "  " + .oid[0:8] + " " + (.messageHeadline // "")' 2>/dev/null \
    || echo "  (커밋 목록을 가져오지 못함)"
  echo ""
  echo "── 변경 파일 ───────────────────────────────────────────"
  gh pr diff "$PR_NUM" --name-only 2>/dev/null | sed 's/^/  /' || echo "  (조회 실패)"
  echo ""
  echo "── 규모 ────────────────────────────────────────────────"
  gh pr view "$PR_NUM" --json changedFiles,additions,deletions \
    --template '  Files: {{.changedFiles}}  (+{{.additions}} / -{{.deletions}})
' 2>/dev/null || true
  echo ""
  rule
  exit 0
fi

# ── 브랜치(range) 모드 ───────────────────────────────────────────────────────
if [[ -n "${1:-}" ]]; then
  TARGET="$1"
  BASE_ARG="${2:-}"

  if ! cr_ref_exists "$TARGET"; then
    echo "Error: target ref '${TARGET}'를 찾을 수 없다." >&2
    exit 1
  fi

  BASE=$(cr_resolve_base "$BASE_ARG" || true)
  if [[ -z "$BASE" ]]; then
    cr_base_help
    exit 1
  fi

  MERGE_BASE=$(cr_merge_base "$BASE" "$TARGET" || true)
  if [[ -z "$MERGE_BASE" ]]; then
    echo "Error: '${BASE}'와 '${TARGET}'의 공통 조상이 없다. base를 직접 지정한다." >&2
    exit 1
  fi

  echo "Mode      : branch"
  echo "Target    : ${TARGET}"
  if [[ -n "$BASE_ARG" ]]; then
    echo "Base      : ${BASE}   (인자로 지정)"
  elif [[ -n "${CODE_REVIEW_BASE:-}" ]]; then
    echo "Base      : ${BASE}   (CODE_REVIEW_BASE)"
  else
    echo "Base      : ${BASE}   (자동 해석 — 틀렸다면 두 번째 인자로 지정)"
  fi
  echo "Merge base: ${MERGE_BASE:0:12}"
  echo ""
  echo "── 변경 의도 (커밋 메시지) ─────────────────────────────"
  git log "${BASE}...${TARGET}" --no-merges --format='  %h %s%n%w(0,4,4)%b' | sed '/^[[:space:]]*$/d'
  echo ""
  echo "── 변경 파일 ───────────────────────────────────────────"
  git diff --name-status "${BASE}...${TARGET}" | sed 's/^/  /'
  echo ""
  echo "── 규모 ────────────────────────────────────────────────"
  git diff --shortstat "${BASE}...${TARGET}" | sed 's/^/  /'
  echo ""
  rule
  exit 0
fi

# ── 로컬 모드 ────────────────────────────────────────────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
echo "Mode   : local  (staged + unstaged + untracked)"
echo "Branch : ${BRANCH}"
echo ""

echo "── 변경 의도 ───────────────────────────────────────────"
echo "  최근 커밋:"
git log --oneline -5 2>/dev/null | sed 's/^/    /'
echo ""
echo "  주의: 커밋되지 않은 변경에는 의도를 설명하는 메시지가 없다."
echo "        의도를 확인할 수 없으면 요구사항 적합성은 평가하지 않고 그렇게 명시한다."
echo ""

STAGED_COUNT=0
UNSTAGED_COUNT=0
UNTRACKED_COUNT=0

if [[ -n "$(git diff --cached --name-only 2>/dev/null)" ]]; then
  STAGED_COUNT=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
fi
if [[ -n "$(git diff --name-only 2>/dev/null)" ]]; then
  UNSTAGED_COUNT=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
fi
if [[ -n "$(git ls-files --others --exclude-standard 2>/dev/null)" ]]; then
  UNTRACKED_COUNT=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
fi

echo "── 변경 파일 ───────────────────────────────────────────"
if [[ "$STAGED_COUNT" -gt 0 ]]; then
  echo "  Staged (${STAGED_COUNT}):"
  git diff --cached --name-status | sed 's/^/    /'
fi
if [[ "$UNSTAGED_COUNT" -gt 0 ]]; then
  echo "  Unstaged (${UNSTAGED_COUNT}):"
  git diff --name-status | sed 's/^/    /'
fi
if [[ "$UNTRACKED_COUNT" -gt 0 ]]; then
  echo "  Untracked (${UNTRACKED_COUNT}) — 리뷰 대상에 포함한다:"
  git ls-files --others --exclude-standard | sed 's/^/    ?? /'
fi
if [[ "$STAGED_COUNT" -eq 0 && "$UNSTAGED_COUNT" -eq 0 && "$UNTRACKED_COUNT" -eq 0 ]]; then
  echo "  (변경 없음)"
fi
echo ""

echo "── 규모 (tracked 변경만) ───────────────────────────────"
git diff HEAD --shortstat 2>/dev/null | sed 's/^/  /'
echo ""
rule
