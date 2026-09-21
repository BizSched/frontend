# 문서 인덱스

실제 `docs/` 디렉터리 구조 그대로 정리한다. 파일이 추가·삭제되면 이 문서도 함께 갱신한다.

```
docs/
├── architecture/     # 구조·데이터·렌더링 설계
├── convention/       # 코드·스타일·문서 작성 규칙
├── collaboration/    # 브랜치·PR·리뷰·CI
├── component/        # 공통 컴포넌트 설계 문서
└── feature/          # 도메인별 기능 문서
```

## architecture/

| 경로                                                           | 내용                                                                    |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [architecture/tech-stack.md](./architecture/tech-stack.md)      | 사용 기술 스택 전체                                                     |
| [architecture/folder-structure.md](./architecture/folder-structure.md) | 폴더 구성, 컴포넌트 분리 기준, 타입 파일 위치                     |
| [architecture/rendering.md](./architecture/rendering.md)        | Server/Client 경계, `"use client"` 허용 트리거, RSC 하이드레이션, `use cache` |
| [architecture/state-management.md](./architecture/state-management.md) | 상태 범위별 도구 선택, 서버 데이터 3가지 패턴, Query Key 관리      |
| [architecture/data-flow.md](./architecture/data-flow.md)        | DTO/DAO 변환, Fetcher, 쿠키 인증, 캐시 정책, 에러 처리                  |
| [architecture/env.md](./architecture/env.md)                    | 환경변수 파일 구성, client/server 구분                                  |
| [architecture/routing.md](./architecture/routing.md)            | Route Config(`ROUTE_PATHS`), Navigation Item 매핑                       |

## convention/

| 경로                                                     | 내용                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| [convention/naming.md](./convention/naming.md)            | 파일/함수/상수/이벤트/boolean 네이밍, import 순서와 alias   |
| [convention/code-style.md](./convention/code-style.md)    | `interface`, enum 대체, export 방식                         |
| [convention/comment.md](./convention/comment.md)          | 주석 허용 기준, `NOTE`/`TODO` 규칙                          |
| [convention/ui-component.md](./convention/ui-component.md) | 기본 UI·공통 컴포넌트 배치, `cva`·`cn` 사용                |
| [convention/style.md](./convention/style.md)              | Tailwind 클래스 정렬, desktop-first 반응형, 커스텀 breakpoint |
| [convention/accessibility.md](./convention/accessibility.md) | alt·시맨틱 태그·키보드 네비게이션, WCAG 2.1 AA 목표      |
| [convention/test.md](./convention/test.md)                | Vitest, 테스트 폴더 구조                                    |
| [convention/commit.md](./convention/commit.md)            | 커밋 메시지 규칙 (`commit-message-generator` 스킬 적용)     |

## collaboration/

| 경로                                                          | 내용                                     |
| -------------------------------------------------------------- | ---------------------------------------- |
| [collaboration/branch-strategy.md](./collaboration/branch-strategy.md) | 브랜치 전략, 네이밍               |
| [collaboration/pr-flow.md](./collaboration/pr-flow.md)         | 기능 개발 / 긴급 수정 플로우             |
| [collaboration/code-review.md](./collaboration/code-review.md) | 리뷰 체크리스트 (사람 확인 / AI 위임)    |
| [collaboration/ci.md](./collaboration/ci.md)                   | 린트/CI/배포/알림                        |

## component/

`src/components/_common/`에 들어가는 공통 컴포넌트의 설계 문서를 모은다. **앞으로 추가되는 공통 컴포넌트 설계는 `component/{컴포넌트}/README.md`에 작성한다.**

| 경로                                                     | 내용                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| [component/README.md](./component/README.md)              | 작성 규칙, `convention/`과의 차이, 문서 목록                |
| [component/modal/README.md](./component/modal/README.md)  | Modal — compound 슬롯, variant, 토큰 매핑, overlay-kit 연동 |

## feature/

| 경로                                     | 내용                     |
| ---------------------------------------- | ------------------------ |
| [feature/README.md](./feature/README.md) | 도메인 기능 문서 템플릿  |

도메인 문서는 `feature/{도메인}/README.md` 경로로 추가한다. 현재 작성된 도메인 문서는 없다.

## 저장소 루트 문서

| 경로                                          | 내용                                              |
| --------------------------------------------- | ------------------------------------------------- |
| [../AGENTS.md](../AGENTS.md)                   | 작업 유형별 문서 라우팅, 필수 체크리스트          |
| `../.claude/skills/commit-message-generator/`  | 커밋 메시지 생성 스킬                             |
| `../.github/ISSUE_TEMPLATE/`                   | 이슈 템플릿 (`progress.md`, `bug-report.md`)      |

## 확정되지 않은 항목

문서에 규칙으로 서술되지 않았거나, 문서 안에 **"확인 필요" · "도입 예정" · "미확정"** 으로 표시된 항목은 임의로 확정해서 적용하지 않고 사용자에게 확인한다. 미정 사항은 별도 문서에 모으지 않고, 해당 규칙이 서술된 위치에 인라인으로 표시한다.
