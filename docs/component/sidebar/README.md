# Sidebar 컴포넌트 설계

## 개요

[Figma Sidebar](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-71106)의 펼침·접힘 상태를 shadcn/ui의 [Base UI Sidebar](https://ui.shadcn.com/docs/components/base/sidebar) 구조로 재구성한다. 생성물을 `ui/`에 남기지 않고 `src/components/_common/Sidebar/`에 둔다.

## 설계 결정

- 2026-09-29 사용자 확인: 기존 desktop 토큰(1920px)을 유지한다. 1920px 이상은 flex 배치로 본문 너비를 나누고, 미만은 fixed로 처리한다.
- 데스크톱은 기본 펼침(362px), 토글을 켜면 접힘(96px). 태블릿은 60px 고정 레일, 744px 미만은 상단 열기 버튼을 표시한다.
- 작은 화면에서 펼친 메뉴는 Base UI Dialog로 구현한다. Escape·배경 클릭 닫기, 포커스 잠금·복귀, 배경 스크롤 잠금을 제공한다.
- shadcn의 Provider, Sidebar, Header, Content, Footer, MenuButton, Trigger, Inset 구성을 필요한 범위로 재구성한다. 상태 쿠키 저장은 하지 않는다.
- 토글 상태는 Context + useState로 관리하고, 화면 크기는 useSyncExternalStore로 구독한다. 페이지와 layout은 Server Component를 유지한다.
- 서비스 메뉴와 현재 경로 판정은 `src/components/Sidebar/AppSidebar.tsx`에서 조합한다. 공통 Sidebar에는 인증·API 로직을 넣지 않는다.

## 디자인 매핑

펼침 패널은 흰색, 오른쪽 모서리 48px, 좌우·상단 패딩 32px, 하단 패딩 64px이다. 접힘 패널은 모서리 40px이다. 높이는 Figma 고정 높이 대신 viewport 높이를 사용하고 짧은 화면에서 스크롤을 허용한다.

primary/secondary와 typography 토큰을 재사용한다. Figma의 회색과 기존 slate 토큰은 값이 달라, 기존 NotificationButton 패턴에 따라 컴포넌트에서 Figma 색상을 사용한다. 로고·아이콘은 로컬 SVG로 보관하고 NotificationButton을 재사용한다.

## 접근성 및 검증

토글에는 상태에 맞는 이름과 aria-expanded, 메뉴에는 aria-current를 제공한다. 하위 메뉴는 Base UI Collapsible로 키보드 조작을 지원한다. 데스크톱 토글, 작은 화면 Dialog 열기/닫기, 반응형 배치, 메뉴 선택 상태를 검증한다.

## 단계별 PR 계획

[Calendar의 PR 계획](../calendar/README.md#단계별-pr-계획)과 같은 stacked pull requests 방식으로 진행한다. 각 브랜치는 바로 아래 브랜치를 base로 하고, 맨 아래만 `dev`를 향한다. 아래부터 Squash Merge하고 남은 PR의 base가 병합된 변경을 기준으로 연결되는지 확인한다.

| 순서 | 브랜치                       | base                         | 내용                                                                                                                                       |
| ---- | ---------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `feat/common-sidebar`        | `dev`                        | **이 설계 문서** + `docs/README.md` · `docs/component/README.md` 인덱스 갱신                                                               |
| 2    | `feat/common-sidebar-ui`     | `feat/common-sidebar`        | 사이드바 SVG 아이콘 + `_common/Sidebar/` 구성 요소(Provider·Sidebar·Header·Content·Footer·Brand·MenuButton·Trigger·Inset) 및 반응형 스타일 |
| 3    | `feat/common-sidebar-layout` | `feat/common-sidebar-ui`     | `Sidebar/AppSidebar.tsx` 메뉴 조합 + `routePaths.ts` + `app/(main)/layout.tsx` 연결 및 화면 크기별 시각 검수                               |
| 4    | `feat/common-sidebar-test`   | `feat/common-sidebar-layout` | Vitest 테스트 — 토글 상태·Dialog Escape 닫기·화면 크기 전환·메뉴 선택 상태                                                                 |

`dev`에 이미 있는 `@base-ui/react`·`NotificationButton`·Vitest 외에 다른 공통 컴포넌트 브랜치에 의존하지 않으므로 Chart 스택과 독립적으로 진행한다. `app/(main)/dashboard`·`app/(main)/sales` 페이지와 `components/dashboard/`는 Chart·대시보드 작업 범위라 이 스택에 넣지 않는다.

중간 브랜치를 수정하면 위쪽 브랜치에도 순서대로 rebase해 변경을 전파한다. 브랜치·리뷰·병합 절차는 [branch-strategy.md](../../collaboration/branch-strategy.md)·[pr-flow.md](../../collaboration/pr-flow.md)를 따른다.

## 확인 필요

- PR 3만으로는 `(main)` 그룹에 페이지가 없어 레이아웃을 브라우저에서 확인할 수 없다. 대시보드 페이지 PR이 먼저 병합되길 기다릴지, 임시 페이지를 함께 올릴지 결정이 필요하다.

아직 구현되지 않은 메뉴 및 설정·로그아웃·프로필·알림의 실제 데이터/동작 연결은 별도 기능 구현 대상이다. 현재 연결되지 않은 항목은 비활성 UI로 표시한다. 사용자 정보는 `profile`, 하단 동작은 `onSettingsClick`·`onLogoutClick`·`onProfileClick`·`onNotificationsClick` props로 연결한다.

## 사용

`app/(main)/layout.tsx`에서 `SidebarProvider` 안에 `AppSidebar`와 `SidebarInset`을 나란히 둔다. 서버에서 렌더링한 children은 `SidebarInset`에 전달한다. 서비스별 콜백이 필요하면 Client Component 조합 지점에서 `AppSidebar`에 주입한다.

## 검증 결과

- Sidebar 상태·Dialog Escape 닫기·화면 크기 전환 회귀 테스트 3개 통과.
- 단독 검수 화면에서 1920px 펼침/접힘(362px/96px), 744px fixed 레일(60px), 375px 상단 토글 및 fixed 패널 확인.
- Figma SVG의 로컬 파일 존재와 로딩, 렌더링 크기 확인.
