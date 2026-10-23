#!/usr/bin/env bash
# 변경된 파일에서 "검토 후보"를 정규식으로 찾는다.
#
# 여기서 출력되는 항목은 finding이 아니라 **검토 후보**다.
# diff와 docs/ 근거를 직접 확인해 재현·영향을 설명할 수 있을 때만 리포트에 올린다.
#
# Usage:
#   bash find-issues.sh                          로컬 변경 (staged + unstaged + untracked)
#   bash find-issues.sh <target-branch>          base 자동 해석 후 base...target
#   bash find-issues.sh <target-branch> <base>   base 명시
#   CODE_REVIEW_BASE=<base> bash find-issues.sh <target-branch>
#
# base branch는 하드코딩하지 않는다. common.sh의 cr_resolve_base 참고.

set -uo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=./common.sh
. "${SCRIPT_DIR}/common.sh"

# ── 대상 파일 수집 ───────────────────────────────────────────────────────────
FILES=()
MODE_LABEL=""

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
  if [[ -z "$(cr_merge_base "$BASE" "$TARGET" || true)" ]]; then
    echo "Error: '${BASE}'와 '${TARGET}'의 공통 조상이 없다. base를 직접 지정한다." >&2
    exit 1
  fi
  MODE_LABEL="branch  ${BASE}...${TARGET}"
  while IFS= read -r -d '' f; do
    FILES+=("$f")
  done < <(cr_changed_files range "$BASE" "$TARGET")
else
  MODE_LABEL="local  (staged + unstaged + untracked)"
  while IFS= read -r -d '' f; do
    FILES+=("$f")
  done < <(cr_changed_files local)
fi

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "변경된 파일이 없다."
  exit 0
fi

rule() { echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

rule
echo "  Code Review — 검토 후보 스캐너"
rule
echo ""
echo "Mode  : ${MODE_LABEL}"
echo "Files : ${#FILES[@]}"
echo ""
echo "아래 항목은 전부 **검토 후보**다. finding이 아니다."
echo "각 항목을 diff와 docs/ 근거로 확인한 뒤에만 리포트에 올린다."
echo ""

FOUND=0

# flag <P레벨> <file> <line> <메시지> [코드조각]
flag() {
  local level="$1" file="$2" line="$3" msg="$4" code="${5:-}"
  printf '[%s 후보] %s:%s\n' "$level" "$file" "$line"
  printf '           %s\n' "$msg"
  if [[ -n "$code" ]]; then
    printf '           > %.140s\n' "$(printf '%s' "$code" | sed 's/^[[:space:]]*//')"
  fi
  printf '\n'
  FOUND=$((FOUND + 1))
}

# scan <P레벨> <file> <grep플래그> <패턴> <메시지> [제외패턴] [동일라인_필수패턴] [주석포함]
#   주석포함: 비워두면 주석 줄은 후보에서 제외한다.
#             TODO/FIXME처럼 주석 안에만 존재하는 패턴은 "comments"를 넘긴다.
scan() {
  local level="$1" file="$2" gflags="$3" pattern="$4" msg="$5"
  local exclude="${6:-}" require="${7:-}" in_comment="${8:-}"
  local hit lineno code trimmed

  while IFS= read -r hit; do
    lineno="${hit%%:*}"
    code="${hit#*:}"
    trimmed=$(printf '%s' "$code" | sed 's/^[[:space:]]*//')
    if [[ -z "$in_comment" ]]; then
      # 주석 줄은 후보에서 뺀다 (주석 처리된 코드 자체는 comment.md 기준으로 따로 본다)
      case "$trimmed" in
        '//'*|'*'*|'/*'*|'#'*) continue ;;
      esac
    fi
    if [[ -n "$exclude" ]] && printf '%s' "$code" | grep -qE "$exclude"; then
      continue
    fi
    if [[ -n "$require" ]] && ! printf '%s' "$code" | grep -qE "$require"; then
      continue
    fi
    flag "$level" "$file" "$lineno" "$msg" "$code"
  done < <(grep -n $gflags -- "$pattern" "$file" 2>/dev/null || true)
}

# 파일 전체에 패턴이 있는지
has() {
  grep -qE -- "$2" "$1" 2>/dev/null
}

scan_file() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  cr_is_reviewable "$f" || return 0
  cr_is_text "$f" || return 0

  local is_tsx=1 is_ts=1 is_client=1 is_test=1
  case "$f" in
    *.tsx|*.jsx) is_tsx=0 ;;
  esac
  case "$f" in
    *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs) is_ts=0 ;;
  esac
  case "$f" in
    *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx) is_test=0 ;;
  esac
  if [[ $is_ts -eq 0 ]] && cr_is_client_file "$f"; then
    is_client=0
  fi

  # ══ 보안 / 데이터 노출 ══════════════════════════════════════════════════
  scan "P0" "$f" "-iE" \
    '(api_?key|secret_?key|private_?key|access_?token|password|passwd)[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']{8,}' \
    "하드코딩된 자격증명으로 보인다. 값의 출처를 확인한다." \
    'process\.env|import\.meta\.env|\$\{|secrets\.|placeholder|example|zod|\.string\(\)'

  scan "P0" "$f" "-E" 'AKIA[0-9A-Z]{16}' \
    "AWS access key ID 형식이 그대로 들어있다."

  # ══ CI / Docker ════════════════════════════════════════════════════════
  case "$f" in
    Dockerfile|*/Dockerfile|*.github/workflows/*|.github/workflows/*)
      scan "P0" "$f" "-iE" '(api_?key|secret|token|password)[[:space:]]*[:=][[:space:]]*[^$[:space:]{]' \
        "CI/Docker 파일에 값이 직접 들어있다. secrets로 옮긴다."
      scan "P0" "$f" "-E" '\$\{\{[[:space:]]*github\.event\.' \
        "GitHub Actions 스크립트 인젝션 위험 — env:로 넘겨서 참조한다."
      scan "P2" "$f" "-E" 'permissions:[[:space:]]*write-all' \
        "필요한 최소 권한만 부여한다."
      ;;
  esac

  # 여기부터는 코드 파일에만 적용한다.
  # 마크다운 문서 안의 코드 예시가 후보로 쏟아지는 것을 막는다.
  if [[ $is_ts -ne 0 ]]; then
    return 0
  fi

  scan "P0" "$f" "-E" '\beval[[:space:]]*\(|new[[:space:]]+Function[[:space:]]*\(' \
    "eval / new Function — 코드 주입 경로가 되는지 확인한다."

  scan "P0" "$f" "-E" 'dangerouslySetInnerHTML|\.innerHTML[[:space:]]*=' \
    "HTML 직접 주입 — 값의 출처가 신뢰 가능하고 sanitize되는지 확인한다."

  # env: 비공개 환경변수가 클라이언트로 넘어가는 경우만 본다.
  # 서버 컴포넌트/서버 모듈에서의 사용은 정상이므로 경고하지 않는다.
  if [[ $is_client -eq 0 ]]; then
    scan "P0" "$f" "-E" 'process\.env\.[A-Z][A-Z0-9_]*' \
      "Client Component에서 NEXT_PUBLIC_ 없는 환경변수 참조 (docs/architecture/env.md)." \
      'process\.env\.(NEXT_PUBLIC_|NODE_ENV)'
  elif [[ $is_tsx -eq 0 ]]; then
    # 서버 컴포넌트라도 JSX prop으로 넘기면 client boundary를 넘을 수 있다.
    scan "P0" "$f" "-E" '=\{[^}]*process\.env\.[A-Z][A-Z0-9_]*' \
      "비공개 환경변수가 JSX prop으로 전달된다. 받는 컴포넌트가 Client인지 확인한다 (docs/architecture/env.md)." \
      'process\.env\.(NEXT_PUBLIC_|NODE_ENV)'
  fi

  if [[ $is_client -eq 0 ]]; then
    scan "P0" "$f" "-E" "from[[:space:]]+['\"](server-only|next/headers)['\"]" \
      "Client Component가 서버 전용 모듈을 import한다 (docs/architecture/rendering.md 금지 목록)."
  fi

  # 인증 데이터 캐싱 — cookies/headers를 읽는 파일에서만 본다.
  if [[ $is_ts -eq 0 ]] && has "$f" 'cookies\(\)|headers\(\)|credentials:[[:space:]]*.include'; then
    scan "P0" "$f" "-E" "cache:[[:space:]]*['\"]force-cache['\"]|next:[[:space:]]*\{[^}]*revalidate|['\"]use cache['\"]" \
      "인증·사용자별 요청이 있는 파일에서 캐시를 켠다. 요청 간 캐시 공유 여부를 확인한다 (docs/architecture/data-flow.md 캐시 정책)."
  fi

  # 서버 QueryClient 모듈 전역 싱글턴 (들여쓰기 없는 top-level 선언)
  if [[ $is_ts -eq 0 && $is_client -ne 0 ]]; then
    scan "P0" "$f" "-E" '^(export[[:space:]]+)?(const|let|var)[[:space:]]+[A-Za-z_$]*[Qq]ueryClient[[:space:]]*=[[:space:]]*new[[:space:]]+QueryClient' \
      "모듈 전역 QueryClient — 서버에서 요청 간 캐시가 공유되면 다른 사용자 데이터가 노출된다 (docs/architecture/rendering.md)."
  fi

  # ══ 렌더링 경계 ════════════════════════════════════════════════════════
  if cr_is_route_entry "$f" && [[ $is_client -eq 0 ]]; then
    if has "$f" 'NOTE:'; then
      scan "P2" "$f" "-E" "^[[:space:]]*['\"]use client['\"]" \
        "page/layout의 \"use client\" — NOTE 주석이 있다. 근거가 실제로 타당한지 확인한다 (docs/architecture/rendering.md 경계 위치 규칙 2)."
    else
      scan "P1" "$f" "-E" "^[[:space:]]*['\"]use client['\"]" \
        "page/layout에 \"use client\"인데 바로 위 NOTE 근거가 없다 (docs/architecture/rendering.md 경계 위치 규칙 2)."
    fi
  fi

  case "$f" in
    *.client.tsx|*.client.ts|*.server.tsx|*.server.ts)
      flag "P2" "$f" "1" "파일명 접미사로 클라이언트 경계를 드러내지 않는다 (docs/architecture/rendering.md 경계 위치 규칙 1)."
      ;;
  esac

  # 직렬화 계약 — Date가 경계를 넘는지
  if [[ $is_tsx -eq 0 ]]; then
    scan "P2" "$f" "-E" '^[[:space:]]*[A-Za-z_$][A-Za-z0-9_$]*\??:[[:space:]]*Date[;,[:space:]]*$' \
      "props/interface에 Date 타입 — 경계를 넘는다면 ISO string이어야 한다 (docs/architecture/rendering.md 직렬화 계약)."
    scan "P2" "$f" "-E" '=\{[^}]*new[[:space:]]+Date\(|=\{[^}]*new[[:space:]]+(Map|Set)\(' \
      "JSX prop으로 Date/Map/Set 인스턴스를 넘긴다. 경계를 넘는지 확인한다 (docs/architecture/rendering.md 직렬화 계약)."
  fi

  # ══ 데이터 흐름 / 상태 ═════════════════════════════════════════════════
  scan "P2" "$f" "-E" "from[[:space:]]+['\"]axios['\"]" \
    "axios 미사용이 스택 결정이다. fetch API를 쓴다 (docs/architecture/tech-stack.md)."

  if [[ $is_tsx -eq 0 ]]; then
    scan "P2" "$f" "-E" '\b(fetch|axios)[[:space:]]*\(' \
      "Component 파일에서 직접 HTTP 요청 — API 레이어 책임이다 (docs/architecture/data-flow.md 레이어별 책임)." \
      'prefetchQuery|queryFn|//'
  fi

  # queryKey 인라인 — factory/queryOptions 파일 밖에서만 후보로 올린다
  case "$f" in
    *ueryOptions*|*Keys.ts|*keys.ts) ;;
    *)
      scan "P2" "$f" "-E" 'queryKey:[[:space:]]*\[' \
        "queryKey 인라인 정의 — query key factory와 xxxQueryOptions 공유를 확인한다 (docs/architecture/state-management.md)."
      ;;
  esac

  if [[ $is_ts -eq 0 ]] && has "$f" 'useMutation'; then
    if ! has "$f" 'invalidateQueries|setQueryData'; then
      flag "P2" "$f" "1" "useMutation은 있으나 invalidateQueries/setQueryData가 없다. 갱신 후 캐시 무효화 책임을 확인한다 (docs/architecture/state-management.md)."
    fi
  fi

  # API 오류 분기가 ts-pattern 없이 흩어졌는지
  if [[ $is_ts -eq 0 && $is_test -ne 0 ]] && ! has "$f" "from[[:space:]]+['\"]ts-pattern['\"]"; then
    scan "P2" "$f" "-E" 'switch[[:space:]]*\([^)]*(error|Error|errorCode|status)[^)]*\)' \
      "에러 분기를 switch로 처리한다. ts-pattern 사용 여부를 확인한다 (docs/architecture/data-flow.md API 에러 처리)."
  fi

  # ══ 스타일 ══════════════════════════════════════════════════════════════
  if [[ $is_tsx -eq 0 ]]; then
    scan "P2" "$f" "-E" 'max-(mobile|tablet|desktop):' \
      "같은 className에 min-* 변형과 max-* 변형이 섞였다 (docs/convention/style.md desktop-first)." \
      '' '(^|[^-[:alnum:]])(mobile|tablet|desktop|sm|md|lg|xl|2xl):'

    scan "P3" "$f" "-E" '(^|[^-[:alnum:]])(sm|md|lg|xl|2xl):[a-z]' \
      "Tailwind 기본 breakpoint 사용 — 커스텀 토큰(desktop/tablet/mobile)을 쓴다 (docs/convention/style.md)." \
      '' 'className'

    scan "P3" "$f" "-E" 'className=\{`' \
      "className 문자열 조합 — cn/cva 규칙을 따르는지 확인한다 (docs/convention/ui-component.md)."
  fi

  # ══ 타입 / 일반 ════════════════════════════════════════════════════════
  scan "P2" "$f" "-E" ':[[:space:]]*any\b|\bas[[:space:]]+any\b' \
    "any 사용 — 근거가 있는지, unknown + 좁히기로 대체 가능한지 확인한다."

  scan "P3" "$f" "-E" '\w!\.|\w!\[|\w!\)' \
    "non-null assertion — 가정이 깨지면 런타임 크래시다."

  # console: 공통 logger 도입을 막지 않도록 logger 구현 파일은 제외한다.
  case "$f" in
    *logger*|*Logger*) ;;
    *)
      scan "P3" "$f" "-E" 'console\.(log|warn|error|debug|info)\(' \
        "console 호출 — 커밋 전 제거하거나 공통 logger로 대체한다. (logger 호출 자체는 문제가 아니다.)"
      ;;
  esac

  scan "P2" "$f" "-E" '^[[:space:]]*debugger[[:space:]]*;?[[:space:]]*$' \
    "debugger 문이 남아있다."

  scan "P3" "$f" "-iE" '\bTODO\b' \
    "TODO에 이슈 번호가 없다 (docs/convention/comment.md)." \
    'TODO[^#]*#[0-9]+' "" "comments"

  scan "P3" "$f" "-iE" '\b(FIXME|HACK|XXX)\b' \
    "미해결 마커 — 병합 전에 해소하거나 이슈로 옮긴다." \
    "" "" "comments"

  # ══ React ══════════════════════════════════════════════════════════════
  scan "P1" "$f" "-E" 'useEffect\([[:space:]]*async' \
    "useEffect 콜백이 async — cleanup 반환이 깨진다. 내부 async 함수를 쓴다."

  scan "P2" "$f" "-E" 'key=\{(i|idx|index)\}' \
    "list key가 배열 인덱스 — 순서·필터 변경 시 상태가 어긋난다."

  # React Hook Form 폼 상태 이중 관리
  if [[ $is_ts -eq 0 ]] && has "$f" 'useForm\(' && has "$f" 'useState[<(]'; then
    flag "P2" "$f" "1" "useForm과 useState가 같은 파일에 있다. 폼 값을 로컬 state로 이중 관리하는지 확인한다 (docs/architecture/state-management.md)."
  fi

  # ══ 테스트 ═════════════════════════════════════════════════════════════
  if [[ $is_test -eq 0 ]]; then
    case "$f" in
      src/test/*|test/*|*/src/test/*) ;;
      *)
        flag "P3" "$f" "1" "테스트 파일이 test 루트 밖에 있다. src/ 구조를 미러링한다 (docs/convention/test.md)."
        ;;
    esac
    case "$f" in
      *.test.tsx|*.test.ts) ;;
      *)
        flag "P3" "$f" "1" "테스트 파일명은 component.test.tsx 형식을 쓴다 (docs/convention/test.md)."
        ;;
    esac
    scan "P1" "$f" "-E" '\b(it|test|describe)\.(only|skip)\(|\bxit\(|\bxdescribe\(' \
      "skip/only가 남아있다. 커버리지가 실제로는 비어있을 수 있다."
  fi

}

# 배열 인덱스 순회:
# `echo "$FILES" | while ...` 는 파이프가 서브셸을 만들어 FOUND 증가가 사라진다.
# 파이프 없이 현재 셸에서 돌리므로 FOUND가 최종 집계에 그대로 반영된다.
# 파일 목록 자체는 common.sh에서 NUL 구분으로 읽어 공백·특수문자 파일명도 안전하다.
i=0
while [[ $i -lt ${#FILES[@]} ]]; do
  scan_file "${FILES[$i]}"
  i=$((i + 1))
done

rule
if [[ "$FOUND" -eq 0 ]]; then
  echo "  자동 탐지된 검토 후보 없음."
  echo "  (스캐너가 못 잡는 항목이 많다. SKILL.md의 점검 절차를 그대로 수행한다.)"
else
  printf '  검토 후보 %d건. 전부 후보일 뿐이며, 근거를 확인한 것만 finding으로 보고한다.\n' "$FOUND"
fi
rule
