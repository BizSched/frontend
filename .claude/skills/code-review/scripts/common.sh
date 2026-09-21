#!/usr/bin/env bash
# code-review 스킬 공용 헬퍼.
# diff-summary.sh / find-issues.sh 에서 source 해서 쓴다. 단독 실행하지 않는다.
#
# 제약: macOS 기본 bash 3.2에서도 동작해야 한다.
#       연관 배열(declare -A), mapfile, ${var^^} 등 bash 4+ 문법을 쓰지 않는다.

# ── ref 존재 확인 ─────────────────────────────────────────────────────────────
cr_ref_exists() {
  git rev-parse --verify --quiet "$1^{commit}" >/dev/null 2>&1
}

# ── base branch 해석 ─────────────────────────────────────────────────────────
# 우선순위: 명시 인자 → $CODE_REVIEW_BASE → origin/HEAD → dev → main → master
# 어떤 브랜치 이름도 최종 기본값으로 하드코딩하지 않는다.
# 해석에 실패하면 아무것도 출력하지 않고 1을 반환한다. 호출부가 안내 후 종료한다.
cr_resolve_base() {
  local explicit="${1:-}"
  local candidate

  if [[ -z "$explicit" && -n "${CODE_REVIEW_BASE:-}" ]]; then
    explicit="$CODE_REVIEW_BASE"
  fi

  if [[ -n "$explicit" ]]; then
    for candidate in "$explicit" "origin/$explicit"; do
      if cr_ref_exists "$candidate"; then
        printf '%s' "$candidate"
        return 0
      fi
    done
    return 1
  fi

  candidate=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)
  if [[ -n "$candidate" ]] && cr_ref_exists "$candidate"; then
    printf '%s' "$candidate"
    return 0
  fi

  for candidate in origin/dev dev origin/main main origin/master master; do
    if cr_ref_exists "$candidate"; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  return 1
}

# base 해석 실패 시 공통 안내
cr_base_help() {
  cat >&2 <<'MSG'
Error: base branch를 결정할 수 없다.
  - 인자로 직접 지정: <script> <target-branch> <base-branch>
  - 또는 환경변수:   CODE_REVIEW_BASE=<base-branch> <script> <target-branch>
  - remote가 있다면: git remote set-head origin -a
MSG
}

# merge-base 계산. 공통 조상이 없으면 1.
cr_merge_base() {
  git merge-base "$1" "$2" 2>/dev/null
}

# ── 변경 파일 수집 (NUL 구분 출력) ───────────────────────────────────────────
# cr_changed_files range <base> <target>   → base...target (merge-base 기준)
# cr_changed_files local                   → staged + unstaged + untracked
_cr_seen_contains() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    [[ "$item" == "$needle" ]] && return 0
  done
  return 1
}

cr_changed_files() {
  local mode="$1"
  local base="${2:-}"
  local target="${3:-}"
  local raw=()
  local uniq=()
  local f

  if [[ "$mode" == "range" ]]; then
    while IFS= read -r -d '' f; do
      raw+=("$f")
    done < <(git diff --name-only -z --diff-filter=ACMRT "${base}...${target}" 2>/dev/null)
  else
    while IFS= read -r -d '' f; do
      raw+=("$f")
    done < <(git diff --cached --name-only -z --diff-filter=ACMRT 2>/dev/null)
    while IFS= read -r -d '' f; do
      raw+=("$f")
    done < <(git diff --name-only -z --diff-filter=ACMRT 2>/dev/null)
    # 로컬 리뷰는 아직 add되지 않은 새 파일도 실제 스캔 대상에 포함한다.
    while IFS= read -r -d '' f; do
      raw+=("$f")
    done < <(git ls-files --others --exclude-standard -z 2>/dev/null)
  fi

  for f in ${raw[@]+"${raw[@]}"}; do
    [[ -z "$f" ]] && continue
    if _cr_seen_contains "$f" ${uniq[@]+"${uniq[@]}"}; then
      continue
    fi
    uniq+=("$f")
    printf '%s\0' "$f"
  done
}

# ── 리뷰 대상 판정 ───────────────────────────────────────────────────────────
# 바이너리·lock·생성물은 스캔하지 않는다.
cr_is_reviewable() {
  case "$1" in
    *.png|*.jpg|*.jpeg|*.gif|*.svg|*.ico|*.webp|*.avif|*.bmp) return 1 ;;
    *.woff|*.woff2|*.ttf|*.otf|*.eot|*.pdf|*.zip|*.gz) return 1 ;;
    package-lock.json|yarn.lock|pnpm-lock.yaml|bun.lockb) return 1 ;;
    *.min.js|*.min.css|*.map) return 1 ;;
    .next/*|node_modules/*|dist/*|build/*|coverage/*|.turbo/*) return 1 ;;
  esac
  return 0
}

# 텍스트 파일인지 확인 (grep -I: 바이너리면 매치 없음)
cr_is_text() {
  LC_ALL=C grep -qI '' -- "$1" 2>/dev/null
}

# 파일 상단에 "use client" 지시어가 있는지
cr_is_client_file() {
  head -n 20 -- "$1" 2>/dev/null | grep -qE "^[[:space:]]*['\"]use client['\"]"
}

# app router 진입점(page/layout)인지
cr_is_route_entry() {
  case "$1" in
    page.tsx|page.jsx|layout.tsx|layout.jsx) return 0 ;;
    */page.tsx|*/page.jsx|*/layout.tsx|*/layout.jsx) return 0 ;;
  esac
  return 1
}
