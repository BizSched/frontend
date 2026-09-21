---
name: code-review
description: This skill should be used when the user asks to "review code", "review changes", "review PR", "review pull request", "check my changes", "audit the diff", "look for bugs", "find security issues", "check code quality", or wants feedback on correctness, security, or maintainability before committing or merging.
allowed-tools: Read, Grep, Glob, Bash(bash .claude/skills/code-review/scripts/diff-summary.sh:*), Bash(bash .claude/skills/code-review/scripts/find-issues.sh:*), Bash(git diff:*), Bash(git log:*), Bash(git merge-base:*), Bash(git status:*), Bash(gh pr view:*), Bash(gh pr diff:*)
version: 0.2.0
---

# Code Review

## Overview

병합 전에 **프로젝트 규칙 위반 · 기능 회귀 · 보안 · 실제 성능 문제**를 잡는다.
일반적인 스타일 지적과 취향 수준의 개선 제안은 리포트에 올리지 않는다.

**핵심 원칙**

1. 스캐너 출력은 **검토 후보**다. diff와 문서 근거를 직접 확인한 것만 finding이 된다.
2. 실제 영향이나 재현 근거를 댈 수 없으면 finding이 아니다. 지운다.
3. 문서에 **"미확정 · 결정 필요 · 확인 필요 · 도입 예정"** 으로 적힌 사항은 규칙으로 확정하지 않는다.
   위반으로 판단하지 말고 리포트의 **"확인 필요"** 섹션에 질문으로 분리한다.
4. 프로젝트 문서와 일반적인 Next.js/React 권장 사항이 충돌하면 **프로젝트 문서를 따른다.**
   단, **보안·사용자 데이터 노출 위험은 문서와 무관하게 항상 명확히 보고한다.**

## 문서 역할

| 대상                                        | 역할                                   |
| ------------------------------------------- | -------------------------------------- |
| `docs/architecture/*`, `docs/convention/*`  | 세부 프로젝트 규칙의 **단일 출처**     |
| `docs/collaboration/code-review.md`         | 리뷰 기준의 **요약**                   |
| 이 스킬 (SKILL.md)                          | 실행 절차, 일반 리뷰 기준, 문서 적용법 |
| `scripts/*`                                 | 후보 탐지 도구                         |

규칙 본문을 이 스킬에 복사해두지 않는다. 판단이 필요할 때마다 해당 `docs/` 문서를 읽어서 적용한다.

---

## Review Process

### Step 1 — 범위와 base branch 확정

**base branch를 `main`으로 가정하지 않는다.** 이 프로젝트의 PR 대상은 보통 `dev`다.

| 요청            | 명령                                                      | base 기준                                                                 |
| --------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| PR 리뷰         | `bash .claude/skills/code-review/scripts/diff-summary.sh --pr <num>` | PR의 실제 base branch(`baseRefName`)                            |
| 브랜치 리뷰     | `bash .claude/skills/code-review/scripts/diff-summary.sh <branch> [base]` | 인자 → `CODE_REVIEW_BASE` → `origin/HEAD` → dev/main/master 순 자동 해석, merge-base 기준 비교 |
| 로컬 리뷰       | `bash .claude/skills/code-review/scripts/diff-summary.sh`  | staged + unstaged + **untracked** 전부                                    |

스크립트는 해석한 base를 출력에 찍는다. 그 값이 리뷰 대상과 맞는지 확인하고, 틀렸으면 base를 인자로
다시 지정해 재실행한다. base를 확정하지 못하면 리뷰를 진행하지 말고 사용자에게 묻는다.

### Step 2 — 변경 의도 확인

| 대상        | 의도 근거                        |
| ----------- | -------------------------------- |
| PR          | PR 제목 · 본문 · 커밋 메시지     |
| 브랜치      | `base...target` 구간 커밋 메시지 |
| 로컬 변경   | 최근 커밋 (커밋 전이면 없을 수 있음) |

**의도를 확인할 수 없으면 구현 의도를 추측하지 않는다.** 리포트 요약에 다음 문장을 그대로 넣는다.

> 변경 의도를 확인할 수 없어 요구사항 적합성 평가는 제한됨.

이 경우에도 보안·회귀·규칙 위반 점검은 그대로 수행한다.

### Step 3 — 후보 스캔

```bash
bash .claude/skills/code-review/scripts/find-issues.sh              # 로컬
bash .claude/skills/code-review/scripts/find-issues.sh <branch> [base]
```

출력은 전부 **검토 후보**다. 각 항목에 대해 파일을 열어 확인하고, 근거가 확인된 것만 다음 단계로 넘긴다.
스캐너가 붙인 P 레벨도 후보값이다. 실제 영향에 따라 조정하거나 버린다.

### Step 4 — 변경 파일 직접 읽기

스캐너가 못 잡는 것이 리뷰의 본체다. 변경된 파일과, 그 파일이 영향을 주는 호출부를 읽는다.
라인 번호는 **리포트에 쓰기 전에 실제 파일에서 확인**한다.

### Step 5 — 일반 리뷰 기준 적용

`references/checklist.md`를 적용한다. 변경과 무관한 섹션은 건너뛴다.
구체적인 안티패턴은 `references/patterns.md`에서 확인한다.

### Step 6 — 프로젝트 특화 점검 (관련 변경이 있을 때만)

해당 트리거가 diff에 없으면 그 행은 **점검하지 않는다.** "확인했으나 문제 없음"도 적지 않는다.

| 변경 트리거                              | 점검 항목                                                                          | 근거 문서                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| `app/**/page.tsx`·`layout.tsx`           | 불필요한 `"use client"`. 예외라면 지시어 **바로 위** `NOTE:` 근거가 있는가          | `architecture/rendering.md` 경계 위치 규칙 2  |
| `"use client"` 파일 추가·변경            | 허용 트리거 1~4 중 실제 해당하는가, 경계가 가장 말단에 있는가                        | `architecture/rendering.md` 허용 트리거       |
| Server → Client props                    | 함수·`Date`·class instance·`Map`/`Set` 등 직렬화 불가능한 값 전달                    | `architecture/rendering.md` 직렬화 계약       |
| Client Component                         | Server Component를 **직접 import** 하는가 (→ `children` 주입으로 해결)              | `architecture/rendering.md` 규칙 3            |
| 서버 전용 모듈 추가                      | 클라이언트에서 import 가능한 채로 `server-only`가 빠졌는가                          | `architecture/rendering.md` 금지 목록         |
| `new QueryClient(` 추가                  | 서버 QueryClient가 모듈 전역 싱글턴인가 (요청 단위 생성이어야 함)                    | `architecture/rendering.md` QueryClient 인스턴스 |
| 첫 화면 데이터 페칭                      | prefetch → `dehydrate` → `HydrationBoundary` → 동일 `queryOptions` 재사용 흐름인가   | `architecture/rendering.md` 하이브리드 데이터 패칭 |
| 서버 props + client `useQuery` 공존      | 같은 데이터를 별도 캐시 키로 이중 관리하는가                                         | `architecture/rendering.md` 금지 절            |
| API 함수 추가·변경                       | `API → Formatter → FE DAO` 흐름을 우회해 DTO가 그대로 Hook/Component로 가는가        | `architecture/data-flow.md` DTO/DAO 분리      |
| Component 파일                           | API 호출·응답 변환·순수 계산 로직이 섞였는가                                         | `architecture/data-flow.md` 레이어별 책임     |
| 상태 추가·이동                           | 범위에 맞는 도구인가 (useState / Context·Zustand / TanStack Query / URL / RHF)       | `architecture/state-management.md`            |
| API 오류 처리                            | 오류 분기가 `ts-pattern` 없이 흩어졌는가                                             | `architecture/data-flow.md` API 에러 처리     |
| 환경변수 참조                            | 비공개 env가 Client Component나 client boundary로 넘어가는가                         | `architecture/env.md`                         |
| UI 컴포넌트·variant                      | variant는 `cva`, className 병합은 `cn`                                              | `convention/ui-component.md`                  |
| Tailwind className                       | desktop-first인가, `min-*`와 `max-*` 변형을 혼용했는가, 커스텀 breakpoint를 쓰는가    | `convention/style.md`                         |
| 파일·함수·상수·이벤트·boolean 이름       | 네이밍 규칙, import alias                                                            | `convention/naming.md`                        |
| 주석 추가                                | 동작 설명 주석·주석 처리된 코드, `TODO`의 이슈 번호                                  | `convention/comment.md`                       |
| 테스트 파일                              | test 루트가 `src/` 미러링인가, `component.test.tsx` 형식인가                         | `convention/test.md`                          |
| 인터랙티브 UI·이미지·폼                  | 접근성 항목 전체                                                                     | `convention/accessibility.md`                 |
| 컴포넌트 분리·이동                       | 분리 기준 4가지, 타입 파일 위치                                                      | `architecture/folder-structure.md`            |

### Step 7 — Next.js 16 App Router 보조 점검 (관련 변경이 있을 때만)

프로젝트 문서가 우선이고, 아래는 **보조 기준**이다. 실제 비용을 설명할 수 있을 때만 finding으로 올린다.

- 불필요하게 넓은 Client boundary로 클라이언트 번들이 커지는 구조
- 서로 독립적인 서버 요청을 `await` 연쇄로 순차 실행해 생기는 워터폴 (→ 병렬화)
- Server Component에서 자기 Route Handler를 다시 호출해 서버 홉을 하나 더 만드는 구조
- 인증·사용자별 요청의 잘못된 캐싱 (요청 간 캐시 공유 → 다른 사용자 데이터 노출)
- loading / error / not-found 미처리로 **실제 사용자 흐름이 막히는** 경우
- 근거가 명확한 큰 Client Component 또는 무거운 서드파티 번들
- 이미지·폰트·메타데이터에서 확인 가능한 권장 방식 위반 (예: 크기 미지정 이미지로 인한 레이아웃 시프트)

### Step 8 — 코드 품질 판단 (Toss Frontend Fundamentals)

가독성 · 예측 가능성 · 응집도 · 결합도를 판단 프레임으로 쓴다.
**다음 중 하나에 해당할 때만** finding으로 등록한다.

- 변경 시 **함께 고쳐야 할 위치가 불필요하게 늘어나는** 중복·결합
- UI·상태·API·변환 책임이 섞여 **회귀 가능성이 높아지는** 구조
- 코드 흐름을 이해하기 어려워 **수정 실수가 발생할 가능성이 높은** 구조
- **이름과 실제 부수 효과가 달라** 오해를 유발하는 구조

다음은 finding이 아니다. 적지 않는다.

- "더 깔끔하게 만들 수 있음"
- "함수를 더 분리할 수 있음"
- "이 방식이 더 관용적임"
- 동작·유지보수 비용이 같은 대안 제시

### Step 9 — 리포트 작성

아래 "리포트" 절의 형식을 그대로 따른다.

---

## 강제하지 않을 것

아래는 이 프로젝트에서 **확정된 규칙이 아니다.** 위반으로 판단하지 않는다.
다뤄야 한다면 finding이 아니라 **"확인 필요"** 섹션의 질문으로 적는다.

| 항목                                                     | 이유                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| Dynamic route의 `generateStaticParams`                    | 프로젝트 설정·요구사항으로 확정된 바 없음                        |
| `error.tsx` / `not-found.tsx`의 **배치 단위**             | `data-flow.md`에서 미확정. 흐름이 실제로 막힐 때만 문제로 다룬다 |
| Fetcher 서버/클라이언트 분리 구조, retry 책임, timeout 기본값 | `data-flow.md` "결정 대기 항목". 새 정책을 만들지 않는다      |
| `useMemo` / `useCallback` / `next/dynamic` / `next/image` **미사용 자체** | 측정된 비용 없이 지적하지 않는다                    |
| Tailwind 클래스 정렬 미적용                               | `style.md`에서 플러그인 "도입 예정"                              |
| `use cache` 적용 판단                                     | `rendering.md`에서 `cacheComponents` 플래그 "확인 필요"           |
| `desktop` breakpoint 값(1920px) 적정성                    | `style.md`에서 "확인 필요"                                       |
| 모든 exported function의 반환 타입 명시                   | 문서 근거 없음                                                   |

**문서에 없는 규칙을 리뷰에서 새로 만들지 않는다.** 필요하다고 판단되면 질문으로 남긴다.

---

## 리포트

### 심각도

| 레벨   | 기준                                            |
| ------ | ----------------------------------------------- |
| **P0** | 데이터 유출, 보안 취약점, 빌드·서비스 불가      |
| **P1** | 병합 전 수정이 필요한 기능 오류·회귀            |
| **P2** | 실제 유지보수성·성능·접근성에 영향을 주는 문제  |
| **P3** | 선택적 개선                                     |

### finding 형식

모든 finding은 아래 6개를 전부 포함한다. 하나라도 채울 수 없으면 finding이 아니다.

```
- **[P1]** `src/components/task/TaskList.tsx:42`
  - 문제: <무엇이 잘못됐는가>
  - 영향/재현: <어떤 입력·상태에서 무엇이 잘못되는가. 또는 측정·관측 근거>
  - 수정 방향: <구체적으로 무엇을 어떻게 바꾸는가>
  - 근거: `docs/architecture/rendering.md` "금지 목록" / `src/lib/api/task.ts:17`
```

### 리포트 구조

```
## Code Review: <PR #12 / branch <name> / 로컬 변경>

### 범위
- 대상:
- Base: <해석된 base>  (근거: PR baseRefName / 인자 지정 / 자동 해석)
- 변경: <파일 수> (+추가 / -삭제)

### 요약
2~4문장. 무엇이 바뀌었고 병합 가능한 상태인지.
의도를 확인할 수 없었다면: "변경 의도를 확인할 수 없어 요구사항 적합성 평가는 제한됨."

### P0 — 데이터 유출 · 보안 · 빌드/서비스 불가
### P1 — 기능 오류 · 회귀
### P2 — 유지보수성 · 성능 · 접근성
### P3 — 선택적 개선

### 확인 필요
- 문서에 근거가 없거나 미확정으로 표시된 사항에 대한 질문

### Positives  (선택)
- 실제로 언급할 만한 구현이 있을 때만 작성한다. 없으면 섹션 자체를 생략한다.
```

- finding이 없는 P 섹션은 생략한다.
- P0·P1이 하나도 없으면 요약에 그렇게 명시한다.
- **Positives는 선택 사항이다.** 채우기 위해 만들어내지 않는다.

### 리포트 전 자기 점검

- [ ] 모든 라인 번호를 실제 파일에서 확인했는가
- [ ] 각 finding의 영향을 한 문장으로 말할 수 있는가 (못 하면 삭제)
- [ ] 각 finding의 근거 문서 또는 코드 위치를 댈 수 있는가 (못 하면 "확인 필요"로 이동)
- [ ] 문서에 미확정으로 표시된 것을 규칙으로 확정하지 않았는가
- [ ] 스캐너 후보를 검증 없이 그대로 올리지 않았는가
- [ ] 취향 수준의 지적이 섞여 있지 않은가
- [ ] 보안·사용자 데이터 노출 위험을 P0로 빠짐없이 올렸는가

---

## Additional Resources

- `references/checklist.md` — 일반 리뷰 체크리스트 (프로젝트 규칙은 `docs/` 참조)
- `references/patterns.md` — 이 프로젝트에서 문제가 되는 안티패턴과 허용 가능한 예외
- `scripts/diff-summary.sh` — 범위·base·변경 의도 수집
- `scripts/find-issues.sh` — 검토 후보 스캔
- `scripts/common.sh` — base 해석·파일 수집 공용 헬퍼 (직접 실행하지 않음)
