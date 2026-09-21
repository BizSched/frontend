# Agent.md

## 프로젝트 개요

Next.js v16 기반 프론트엔드 프로젝트. TailwindCSS v4 + Shadcn/ui, Zustand + TanStack Query, fetch API.
상세 스택은 `docs/architecture/tech-stack.md`, 전체 문서는 `docs/README.md` 참고.

## 작업 시작 전 원칙

- 코드 작성 전, 아래 라우팅 표를 참고해 관련 문서를 먼저 확인한다.
- 문서에 없는 판단이 필요하면 임의로 정하지 말고 사용자에게 확인한다.
  - 확인 후 기록한다.
- 문서와 기존 코드가 다르면 기존 코드 패턴을 따르되, 차이를 사용자에게 알린다.

## 작업 유형별 참조 문서

| 작업 유형              | 참조 문서                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 새 컴포넌트/훅 작성    | `convention/naming.md`, `convention/code-style.md`, `architecture/folder-structure.md`                                      |
| 상태 관리 코드 작성    | `architecture/state-management.md`                                                                                          |
| API 연동 / 에러 처리   | `architecture/data-flow.md`                                                                                                 |
| 렌더링 경계 / RSC / TanStack Query hydration | `architecture/rendering.md`, `architecture/data-flow.md`, `architecture/state-management.md` |
| UI/스타일 작업         | `convention/ui-component.md`, `convention/style.md`                                                                         |
| 테스트 작성            | `convention/test.md`                                                                                                        |
| 커밋 작성              | `commit-message-generator` 스킬 자동 적용 (`.claude/skills/commit-message-generator/SKILL.md`), 요약 `convention/commit.md` |
| PR 코드 리뷰           | `code-review` 스킬 참고 (`.claude/skills/code-review/SKILL.md`), 요약 `collaboration/code-review.md`                        |
| 이슈 등록              | `.github/ISSUE_TEMPLATE/`                                                                                                   |
| 브랜치/PR              | `collaboration/branch-strategy.md`, `collaboration/pr-flow.md`                                                              |
| CI/배포                | `collaboration/ci.md`                                                                                                       |
| 특정 기능(도메인) 파악 | `feature/{도메인}/README.md` — 작업 전 해당 도메인 문서부터 확인                                                            |

## 코드 작성 시 필수 체크

- [ ] 파일/함수/변수 네이밍이 `convention/naming.md` 기준을 따르는가
- [ ] 레이어 책임(Component/Hook/API/Utility)이 섞이지 않았는가
- [ ] 렌더링 경계가 `architecture/rendering.md`의 "금지 목록" 7개 항목을 위반하지 않는가
- [ ] 상태를 범위에 맞는 도구(useState/Context·Zustand/TanStack Query/URL/RHF)로 관리했는가
- [ ] API 에러를 `ts-pattern`으로 처리했는가
- [ ] variant·className을 `convention/ui-component.md`의 `cva`·`cn` 규칙대로 관리했는가
- [ ] 불필요한 주석·주석 처리된 코드가 없는가

## PR/커밋 전 필수 체크

- [ ] Husky 로컬 체크(ESLint·Prettier) 통과
- [ ] `commit-message-generator` 스킬 형식 준수 (타입 8종, 헤더 영어/바디 한글, husky 정규식 통과)
- [ ] `main`/`dev` 직접 푸시 금지 — 반드시 PR 경유, 브랜치명은 작업 내용이 드러나게 작성
- [ ] 병합 후 작업 브랜치 삭제

## 하지 말아야 할 것

- `main`/`dev` 브랜치 직접 푸시
- 작업 브랜치 임의 삭제 (사용자 승인 후 진행)
- 문서에 없거나 문서에서 "미확정"·"확인 필요"로 표시된 컨벤션을 임의로 확정해서 적용
