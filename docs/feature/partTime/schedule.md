# 아르바이트생 스케쥴 관리 페이지 설계

## 개요

사장님이 아르바이트생의 근무 스케쥴을 월 캘린더로 보고, 아르바이트생 별로 걸러 보며, 날짜별 출근 확인 현황을 확인하는 페이지다.

- Figma: [아르바이트생 스케쥴 관리 page](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-128539&m=dev)
- 참고 화면: [업무 관리](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-104401&m=dev) — 데스크톱 우측 패널 구조를 차용 ("설계 결정" 참고)
- 라우트: `/partTime/schedule`

## 화면 구성

- `PartTimeScheduleHeader` — 제목, 스케쥴 공유·추가 버튼
- `PartTimeScheduleCalendar` — 선택 날짜·월·필터 상태를 갖고 하위 컴포넌트를 조합하는 클라이언트 컨테이너
- `PartTimeScheduleStaffFilter` — 공통 `Dropdown` 기반 아르바이트생 필터, `Calendar`의 `headerSlot`에 주입
- `PartTimeScheduleChip` — 출근 확인 여부를 `CalendarEventChip`의 `tone`·체크 아이콘으로 변환
- `PartTimeScheduleDaySummary` — 선택 날짜 상세. 출근 확인 체크박스 목록과 진행 바 (1024px 이상 캘린더 우측, 미만 캘린더 아래)
- `PartTimeScheduleActionButtons` — 모바일 플로팅 버튼. 공통 [`ActionButton`](../../component/ActionButton/README.md)에 보조 액션 공유(링크 아이콘)·추가(연필 아이콘)를 위 → 아래 순서로 `actions`에 넘긴다 (2026-10-01 확정). 메인 `+`는 목록을 여닫는 토글이라 그 자체로 추가 동작을 하지 않는다

## 상태·데이터

| 상태              | 범위                       | 도구                          | 근거                                                                                            |
| ----------------- | -------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `today`           | 페이지 → 캘린더            | Server에서 계산한 string prop | 서버·클라이언트의 기준 날짜를 맞추고, `Date` 객체를 클라이언트로 넘기지 않기 위함               |
| `selectedDate`    | `PartTimeScheduleCalendar` | `useState` (초기값 `today`)   | 캘린더와 상세 패널만 쓴다                                                                       |
| `month`           | `PartTimeScheduleCalendar` | `useState` (`YYYY-MM`)        | 위와 같음. API 연동 후 조회 키가 된다                                                           |
| `selectedStaffId` | `PartTimeScheduleCalendar` | `useState` (`null` = 전체)    | 위와 같음. 새로고침 시 유지하지 않고, 공유는 화면 캡처라 URL에 둘 필요가 없다 (2026-10-01 확정) |
| 스케쥴 목록       | 서버 데이터                | 현재 목업 → TanStack Query    | 출근 확인·추가·수정으로 갱신·무효화가 필요해 RSC 직접 조회 예외에 해당하지 않는다               |
| 추가·수정 폼      | 모달                       | React Hook Form (예정)        | Form 상태                                                                                       |

API 명세(월 조회 파라미터, `staffId` 서버 필터 지원 여부, `page`/`size` 페이지네이션 사용 여부)는 UI를 먼저 구현한 뒤 4단계 조회 API 연동에서 정한다 (2026-10-01 확정). 정리되면 도메인 문서(`feature/partTime/README.md`)에 작성하고 여기서는 링크만 한다. 현재 DTO(`src/lib/types/partTimeSchedule.ts`)는 BE에서 받은 **예시 응답** 기준이다.

### API 연동 계획

1. 월 단위 조회 함수를 작성하고 `formatPartTimeScheduleList`로 변환한다. 목업(`partTimeScheduleMock.ts`)은 이미 DTO → formatter를 거치므로 컴포넌트는 수정하지 않는다
2. Query Key에 `month`·`staffId`를 넣는다. 필터를 서버에서 할지 클라이언트에서 할지는 API 명세를 따른다
3. 첫 화면(현재 월)은 `page.tsx`에서 `prefetchQuery` → `HydrationBoundary` → `useQuery`, 월 이동은 클라이언트에서 조회한다
4. 날짜 상세는 따로 조회하지 않고 월 데이터에서 걸러낸다. 이전·다음 달 날짜를 선택하면 그 달의 쿼리를 읽는다

## 렌더링 경계

- `page.tsx`는 Server Component다. `await connection()`으로 요청 시점에 렌더링해 `today`를 매 요청 계산한다
- `"use client"`는 상태를 가진 `PartTimeScheduleCalendar` 한 곳에만 둔다. Chip·DaySummary는 지시어 없이 작성했고, Calendar가 import해 클라이언트 번들에 포함된다
- `PartTimeScheduleHeader`는 지금은 Server Component다. 버튼 핸들러를 붙이는 PR에서 해당 버튼만 클라이언트로 분리한다
- `PartTimeScheduleActionButtons`는 `ActionButton`의 `actions[].onClick`(함수)을 넘겨야 해서 Client Component다. `ActionButton` 자체가 `"use client"`라도 함수 prop은 Server Component에서 넘길 수 없다 ([ActionButton 렌더링 경계](../../component/ActionButton/README.md#렌더링-경계))

[금지 목록](../../architecture/rendering.md#금지-목록-리뷰-체크리스트) 점검:

- [x] `page.tsx`에 `"use client"` 없음
- [x] Server → Client로 직렬화 불가능한 값 전달 없음 (`today`, `initialMonth` 모두 string)
- [x] Client Component에 `Date` 객체 전달 없음
- [x] 비공개 환경변수 참조 없음
- [x] 서버 전용 모듈 없음 — API 연동 PR에서 서버 fetcher를 추가하면 `server-only` 적용
- [x] 서버 QueryClient 전역 싱글턴 없음 — API 연동 PR에서 요청 단위로 생성
- [x] Client Component가 Server Component를 직접 import하지 않음

## 설계 결정

### Figma와 달라진 점

디자이너 없이 진행하는 프로젝트라 아래 변경은 Figma에 바로 반영하지 않고 후순위로 미룬다 (2026-10-01 확정). 그 전까지는 **이 문서와 코드가 기준**이다.

| 항목                                | Figma                                                                                                                                          | 구현                                                                                                                                                                                                           | 근거                                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 데스크톱 날짜 상세                  | 없음. 캘린더가 전체 폭을 쓴다                                                                                                                  | 캘린더 우측에 `PartTimeScheduleDaySummary` 패널 추가                                                                                                                                                           | 업무 관리 화면의 "오늘의 업무" 패널을 차용. 큰 화면에서도 선택 날짜의 출근 현황을 바로 본다                                            |
| 캘린더 아래 날짜 상세 (1024px 미만) | 날짜(`2025. 01. 10`) + 시간·이름 칩 목록 ([337-128687](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-128687&m=dev)) | 우측 패널과 같은 `PartTimeScheduleDaySummary` — 제목·`n/m 완료`·진행 바·체크박스 행 ([업무 관리 today_list 337-104538](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-104538&m=dev)) | 칩 목록으로는 출근 확인을 체크할 수 없다 (2026-10-01 확정). 폭과 관계없이 같은 컴포넌트 하나를 쓰므로 별도 목록 컴포넌트를 두지 않는다 |
| 셀 칩 라벨                          | `07:00 ~ 13:00 강성구` (시간 + 이름)                                                                                                           | 이름만. 시간은 날짜 상세에서 표시                                                                                                                                                                              | 우측 패널만큼 셀이 좁아져 시간 + 이름이 잘린다                                                                                         |
| 상세 패널 체크박스                  | —                                                                                                                                              | `readOnly` 표시만                                                                                                                                                                                              | 출근 확인 변경은 5단계 PR에서 활성화                                                                                                   |

### 클릭 동작

2026-10-01 확정. 공통 [Calendar](../../component/calendar/README.md)의 "칩 클릭은 선택 날짜를 바꾸지 않는다" 계약을 그대로 따른다.

| 클릭 대상                        | 동작                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 날짜 셀 (날짜 숫자·빈 영역·`+N`) | 선택 날짜를 바꾸고 `PartTimeScheduleDaySummary`에 상세를 보여준다 (1024px 이상 우측, 미만 캘린더 아래)                                           |
| 셀 안의 스케쥴 칩                | 해당 스케쥴 수정 모달을 연다. 선택 날짜는 바꾸지 않는다. `PartTimeScheduleChip`이 `CalendarEventChip`의 `onClick`을 넘겨 `button`으로 렌더링된다 |
| 작은 화면 셀의 점                | 클릭 대상이 아니다 (공통 Calendar 계약). 이 구간의 수정 경로는 "확인 필요" 1번                                                                   |

### 그 외

- **`--z-dropdown: 100` 토큰 신설** — 필터 드롭다운이 캘린더 셀(`z-10`)·사이드바 레일(`z-30`) 위에 떠야 해서 `theme.css`에 추가하고 `DropdownContent`에 적용했다. 근거는 [dropdown/README.md](../../component/dropdown/README.md) "설계 결정 요약"
- **날짜 상세 전환 기준은 `laptop`(1024px)** — 1024px 미만에서는 캘린더 옆에 우측 패널(378px)을 두면 셀이 지나치게 좁아진다. 그래서 `max-laptop:`부터 `PartTimeScheduleDaySummary`를 캘린더 아래로 옮긴다. 캘린더와 목록은 하나의 흰 카드로 묶는다. 셀의 칩 → 점 전환은 공통 Calendar 기준(`max-tablet:`)을 그대로 따른다
- **삭제된 아르바이트생(`staff.isDeleted`)은 숨긴다** — 캘린더 일정과 필터 목록에서 모두 제외한다 (2026-10-01 확정). 삭제된 아르바이트생의 스케쥴은 수정할 수 없다는 것만 정해져 있어 우선 노출하지 않는 쪽을 택했다. 과거 근무 기록을 보여줘야 하는 요구가 생기면 다시 판단한다
- **하드코딩 색상은 #51에서 토큰화** — `#f2f2f2`, `#fafafa`, `#333333`, `#737373`, `#ffe5b7`가 `theme.css` 토큰에 없다. 이 페이지에서는 임의 값으로 두고, 토큰화는 #51에서 다룬다

## 단계별 PR 계획

| 단계 | 브랜치                         | 범위                                                                                                                            | 상태          |
| ---- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1    | `feat/part-time-schedule-docs` | 아르바이트 스케쥴 관리 docs 작성 — 이 문서                                                                                      | 진행 중       |
| 2    | `feat/part-time-schedule-ui`   | 아르바이트 스케쥴 관리 목업 UI — 캘린더·필터·날짜 상세·반응형, DTO/formatter, `--z-dropdown` 토큰                               | 진행 중       |
| 3    | 미정                           | 아르바이트 스케쥴 관리 추가/수정 모달 UI — RHF 폼 UI, "스케쥴 추가" 버튼·모바일 FAB(공통 `ActionButton`)·셀 칩 클릭 → 모달 열기 | 2단계 이후    |
| 4    | 미정                           | 조회 API 연동 — API 명세 확정, fetcher, Query Key, prefetch + hydration, 목업 제거                                              | 2단계 이후    |
| 5    | 미정                           | 출근 확인 토글 — `useMutation`, 날짜 상세 체크박스 활성화                                                                       | API 명세 확정 |
| 6    | 미정                           | 스케쥴 추가·수정 기능 — 3단계 모달에 `useMutation` 연결, 조회 쿼리 무효화                                                       | 3·4단계 이후  |
| 7    | 미정                           | 스케쥴 공유 — 캘린더 + 날짜 상세 영역을 PNG로 캡처해 다운로드                                                                   | 2단계 이후    |

1·2단계는 stacked PR로 진행한다. 2단계 브랜치는 `dev`가 아니라 1단계 브랜치에서 분기해, UI 작업 중에도 이 문서를 같은 브랜치에서 참조하고 문서·코드를 함께 리뷰할 수 있게 한다. 1단계 PR이 먼저 `dev`에 머지되어야 하고, 1단계 브랜치가 바뀌면 2단계 브랜치를 그 위로 rebase한다. 2단계 PR 본문에 이 머지 순서를 명시한다.

이 페이지 PR 흐름 밖에서 다룰 작업:

- **사이드바 메뉴 연결** — 라우트는 `app/partTime/schedule/page.tsx`로 이미 동작하지만, 사이드바 "아르바이트 > 스케쥴 관리"가 `disabled`("준비 중")라 진입 경로가 없다. `ROUTE_PATHS` 추가와 메뉴 연결은 별도 이슈로 다룬다 (이슈 번호 미정)
- **하드코딩 색상 토큰화** — #51
- **아이콘 lucide 교체** — 2단계에서 추가한 SVG 아이콘(`ic_checkbox`, `ic_plus-accent`, `ic_plus-white`)을 `lucide-react`로 바꾼다. #102
  - 모바일 FAB 아이콘(`ic_link`, `ic_pencil`, `ic_plus-large`)은 교체 대상이 아니다. FAB를 공통 `ActionButton`으로 만들면 메인 `+`는 컴포넌트 안의 lucide `PlusIcon`을 쓰고, 보조 아이콘도 lucide로 넘기므로 SVG를 추가하지 않는다 ([ActionButton 레이어 구조](../../component/ActionButton/README.md#레이어-구조))

## 확인 필요

1. **칩으로 닿지 않는 스케쥴의 수정 경로** — 날짜 상세가 체크박스 행이 되면서 두 경우에 수정할 곳이 없다. ① 셀에 칩이 3개까지만 보여 4개째부터는 `+N`으로 숨는다. ② 744px 미만은 셀에 점만 있어 칩 자체가 없다. 날짜 상세 행에 수정 진입점(행 클릭, 행 끝 수정 버튼 등)을 둘지. 행 전체를 클릭 대상으로 하면 체크박스 클릭과 겹치지 않게 해야 한다
