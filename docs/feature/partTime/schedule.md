# 아르바이트생 스케쥴 관리 페이지 설계

## 개요

사장님이 아르바이트생의 근무 스케쥴을 월 캘린더로 보고, 아르바이트생 별로 걸러 보며, 날짜별 출근 확인 현황을 확인하는 페이지다.

- Figma: [아르바이트생 스케쥴 관리 page](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-128539&m=dev)
- 참고 화면: [업무 관리](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-104401&m=dev) — 데스크톱 우측 패널 구조를 차용 ("설계 결정" 참고)
- Figma 추가/수정 모달: [전체 플로우](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127605&m=dev) — "추가/수정 모달" 참고
- 라우트: `/partTime/schedule`

## 화면 구성

- `PartTimeScheduleHeader` — 제목, 스케쥴 공유·추가 버튼
- `PartTimeScheduleCalendar` — 선택 날짜·월·필터 상태를 갖고 하위 컴포넌트를 조합하는 클라이언트 컨테이너
- `PartTimeScheduleStaffFilter` — 공통 `Dropdown` 기반 아르바이트생 필터, `Calendar`의 `headerSlot`에 주입
- `PartTimeScheduleChip` — 출근 확인 여부를 `CalendarEventChip`의 `tone`·체크 아이콘으로 변환. 표시 전용이라 클릭 동작이 없다
- `PartTimeScheduleDaySummary` — 선택 날짜 상세. 진행 바와 스케쥴 행 목록(출근 확인 체크박스 · 시간·이름 · `수정 | 삭제`) (1024px 이상 캘린더 우측, 미만 캘린더 아래)
- `PartTimeScheduleActionButtons` — 모바일 플로팅 버튼. 공통 [`ActionButton`](../../component/ActionButton/README.md)에 보조 액션 공유(링크 아이콘)·추가(연필 아이콘)를 위 → 아래 순서로 `actions`에 넘긴다 (2026-10-01 확정). 메인 `+`는 목록을 여닫는 토글이라 그 자체로 추가 동작을 하지 않는다
- `PartTimeScheduleFormModal` — 스케쥴 추가/수정 모달. 공통 `Modal` Form 계열 조합 ("추가/수정 모달" 참고). 컨트롤러·launcher·라벨·빠른 선택 칩과 함께 `schedule/modal/`에 두었다. 이 폴더 구조는 아직 확정되지 않았다 (확인 필요 5)

## 상태·데이터

| 상태              | 범위                        | 도구                          | 근거                                                                                            |
| ----------------- | --------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `today`           | 페이지 → 캘린더             | Server에서 계산한 string prop | 서버·클라이언트의 기준 날짜를 맞추고, `Date` 객체를 클라이언트로 넘기지 않기 위함               |
| `selectedDate`    | `PartTimeScheduleCalendar`  | `useState` (초기값 `today`)   | 캘린더와 상세 패널만 쓴다                                                                       |
| `month`           | `PartTimeScheduleCalendar`  | `useState` (`YYYY-MM`)        | 위와 같음. API 연동 후 조회 키가 된다                                                           |
| `selectedStaffId` | `PartTimeScheduleCalendar`  | `useState` (`null` = 전체)    | 위와 같음. 새로고침 시 유지하지 않고, 공유는 화면 캡처라 URL에 둘 필요가 없다 (2026-10-01 확정) |
| 스케쥴 목록       | 서버 데이터                 | 현재 목업 → TanStack Query    | 출근 확인·추가·수정으로 갱신·무효화가 필요해 RSC 직접 조회 예외에 해당하지 않는다               |
| 추가·수정 폼      | `PartTimeScheduleFormModal` | React Hook Form               | Form 상태. 필드·검증은 "추가/수정 모달" 참고                                                    |

API 명세(월 조회 파라미터, `staffId` 서버 필터 지원 여부, `page`/`size` 페이지네이션 사용 여부)는 UI를 먼저 구현한 뒤 4단계 조회 API 연동에서 정한다 (2026-10-01 확정). 정리되면 도메인 문서(`feature/partTime/README.md`)에 작성하고 여기서는 링크만 한다. BE에서 받은 응답은 **예시**일 뿐이라 DTO 타입과 Formatter는 명세가 확정되는 4단계에서 작성한다 (2026-10-01 확정). 2단계에서는 UI가 쓰는 FE 타입(`PartTimeSchedule`, `PartTimeStaff` — `src/lib/types/partTimeSchedule.ts`)만 두고, 목업도 이 타입으로 바로 만든다.

### API 연동 계획

1. 확정된 명세로 DTO 타입과 Formatter(DTO → FE 타입)를 작성하고, 월 단위 조회 함수 안에서 Formatter를 호출한다. 컴포넌트는 2단계부터 FE 타입만 쓰므로 수정하지 않는다
2. Query Key에 `month`·`staffId`를 넣는다. 필터를 서버에서 할지 클라이언트에서 할지는 API 명세를 따른다
3. 첫 화면(현재 월)은 `page.tsx`에서 `prefetchQuery` → `HydrationBoundary` → `useQuery`, 월 이동은 클라이언트에서 조회한다
4. 날짜 상세는 따로 조회하지 않고 월 데이터에서 걸러낸다. 이전·다음 달 날짜를 선택하면 그 달의 쿼리를 읽는다

## 렌더링 경계

- `page.tsx`는 Server Component다. `await connection()`으로 요청 시점에 렌더링해 `today`를 매 요청 계산한다
- `"use client"`는 상태를 가진 `PartTimeScheduleCalendar` 한 곳에만 둔다. Chip·DaySummary는 지시어 없이 작성했고, Calendar가 import해 클라이언트 번들에 포함된다
- `PartTimeScheduleHeader`는 Server Component다. 클릭 핸들러가 필요한 "스케쥴 추가" 버튼만 `PartTimeScheduleAddButton`(Client)으로 분리했다. "스케쥴 공유" 버튼은 7단계에서 같은 방식으로 분리한다
- `PartTimeScheduleActionButtons`는 `ActionButton`의 `actions[].onClick`(함수)을 넘겨야 해서 Client Component다. `ActionButton` 자체가 `"use client"`라도 함수 prop은 Server Component에서 넘길 수 없다 ([ActionButton 렌더링 경계](../../component/ActionButton/README.md#렌더링-경계))
- `PartTimeScheduleFormModal`은 RHF를 쓰므로 Client Component다. 여는 쪽(헤더 "스케쥴 추가" 버튼, FAB, 날짜 상세 행 `수정`)도 클릭 핸들러가 필요하다. 헤더는 이 단계에서 "스케쥴 추가" 버튼만 클라이언트 파일로 분리한다

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

| 항목                                | Figma                                                                                                                                          | 구현                                                                                                                                                                                                           | 근거                                                                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 데스크톱 날짜 상세                  | 없음. 캘린더가 전체 폭을 쓴다                                                                                                                  | 캘린더 우측에 `PartTimeScheduleDaySummary` 패널 추가                                                                                                                                                           | 업무 관리 화면의 "오늘의 업무" 패널을 차용. 큰 화면에서도 선택 날짜의 출근 현황을 바로 본다                                                          |
| 캘린더 아래 날짜 상세 (1024px 미만) | 날짜(`2025. 01. 10`) + 시간·이름 칩 목록 ([337-128687](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-128687&m=dev)) | 우측 패널과 같은 `PartTimeScheduleDaySummary` — 제목·`n/m 완료`·진행 바·체크박스 행 ([업무 관리 today_list 337-104538](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-104538&m=dev)) | 칩 목록으로는 출근 확인을 체크할 수 없다 (2026-10-01 확정). 폭과 관계없이 같은 컴포넌트 하나를 쓰므로 별도 목록 컴포넌트를 두지 않는다               |
| 셀 칩 라벨                          | `07:00 ~ 13:00 강성구` (시간 + 이름)                                                                                                           | 이름만. 시간은 날짜 상세에서 표시                                                                                                                                                                              | 우측 패널만큼 셀이 좁아져 시간 + 이름이 잘린다                                                                                                       |
| 상세 패널 체크박스                  | —                                                                                                                                              | `readOnly` 표시만                                                                                                                                                                                              | 출근 확인 변경은 5단계 PR에서 활성화                                                                                                                 |
| 상세 행 수정·삭제                   | —                                                                                                                                              | 행 끝에 `수정 \| 삭제` 텍스트 버튼(공통 `TextButton`)                                                                                                                                                          | 셀 칩은 3개까지만 보이고 744px 미만은 점만 있어 칩으로는 모든 스케쥴에 닿을 수 없다. 개별 스케쥴 동작을 날짜 상세 행에 모은다 (2026-10-02 리뷰 확정) |

### 클릭 동작

2026-10-02 리뷰에서 확정. 캘린더는 날짜 선택과 일정 요약 표시만 하고, 개별 스케쥴 동작(출근 확인·수정·삭제)은 모두 날짜 상세 행에서 한다.

| 클릭 대상                        | 동작                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 날짜 셀 (날짜 숫자·빈 영역·`+N`) | 선택 날짜를 바꾸고 `PartTimeScheduleDaySummary`에 상세를 보여준다 (1024px 이상 우측, 미만 캘린더 아래) |
| 날짜 상세 행 체크박스            | 출근 확인을 토글한다. 5단계 전까지는 `readOnly`                                                        |
| 날짜 상세 행 `수정`              | 해당 스케쥴 수정 모달을 연다. 3단계에서 연결                                                           |
| 날짜 상세 행 `삭제`              | 삭제 확인 모달을 거쳐 해당 스케쥴을 삭제한다. 6단계에서 연결                                           |

- **칩·점은 표시 전용이다** — `PartTimeScheduleChip`은 `CalendarEventChip`에 `onClick`을 넘기지 않는다. 칩(744px 이상)이나 점(744px 미만) 위를 누르면 선택 날짜가 바뀌지 않는데, 이는 공통 Calendar의 의도된 동작이다. 일정 칩 클릭은 선택 날짜를 바꾸지 않는다는 공통 Calendar 계약을 따른다 ([calendar/README.md](../../component/calendar/README.md) "업무 일정 칩" 항목). 날짜를 바꾸려면 날짜 숫자·빈 영역·`+N`을 누른다 (2026-10-02 실측)

### 그 외

- **`--z-dropdown` 토큰 신설** — 필터 드롭다운이 캘린더 셀(`z-10`)·사이드바 레일(`z-30`) 위에 떠야 해서 `theme.css`에 추가하고 `DropdownContent`에 적용했다. 처음 값은 `100`이었고, 3단계에서 추가/수정 모달 안 드롭다운이 모달 뒤에 가려져 `1500`으로 올렸다 (2026-10-02 확정). 근거는 [dropdown/README.md](../../component/dropdown/README.md) "설계 결정 요약"
- **날짜 상세 전환 기준은 `laptop`(1024px)** — 1024px 미만에서는 캘린더 옆에 우측 패널(378px)을 두면 셀이 지나치게 좁아진다. 그래서 `max-laptop:`부터 `PartTimeScheduleDaySummary`를 캘린더 아래로 옮긴다. 캘린더와 목록은 하나의 흰 카드로 묶는다. 셀의 칩 → 점 전환은 공통 Calendar 기준(`max-tablet:`)을 그대로 따른다
- **삭제된 아르바이트생(`staff.isDeleted`)은 숨긴다** — 캘린더 일정과 필터 목록에서 모두 제외한다 (2026-10-01 확정). 삭제된 아르바이트생의 스케쥴은 수정할 수 없다는 것만 정해져 있어 우선 노출하지 않는 쪽을 택했다. 과거 근무 기록을 보여줘야 하는 요구가 생기면 다시 판단한다
- **하드코딩 색상은 #51에서 토큰화** — `#f2f2f2`, `#fafafa`, `#333333`, `#737373`, `#ffe5b7`가 `theme.css` 토큰에 없다. 이 페이지에서는 임의 값으로 두고, 토큰화는 #51에서 다룬다

## 추가/수정 모달

3단계 범위. 추가와 수정은 같은 폼이라 컴포넌트 하나(`PartTimeScheduleFormModal`)로 두고, 모드에 따라 제목·초기값·제출 버튼만 바꾼다. 제출은 6단계 전까지 `useMutation` 없이 모달만 닫는다.

### Figma 원본 노드

노드 ID는 이 표에서만 관리한다. 섹션: [아르바이트생 스케쥴 추가/수정 modal](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127605&m=dev) (`337:127605`)

| 이름                             | 설명                                                    | 노드 ID                     |
| -------------------------------- | ------------------------------------------------------- | --------------------------- |
| 폼 모달 (large)                  | 488px, 데스크톱·태블릿                                  | `99:113911`                 |
| 폼 모달 (small)                  | 375px 바텀시트, 모바일                                  | `99:114213`                 |
| 추가 화면 (1920 / 744 / 375)     | 캘린더 위 딤 + 폼 모달                                  | `337:127606` ~ `337:127763` |
| 드롭다운 열림 (1920 / 744 / 375) | 이름(1920·375)·시작 시간(744) 드롭다운                  | `337:127838` ~ `337:127997` |
| 날짜 선택 (1920 / 744 / 375)     | 데스크톱·태블릿은 모달 위 팝오버, 모바일은 바텀시트     | `337:128073` ~ `337:128232` |
| 수정 화면 (1920 / 744 / 375)     | 값이 채워진 폼, 제출 버튼 `수정 완료`                   | `337:128307` ~ `337:128464` |
| 삭제 확인 모달                   | `size=large` 456px / `size=small` 343px. 6단계에서 사용 | `85:121501`                 |

### 모달 구성

공통 [Modal](../../component/modal/README.md)의 Form 계열 조합을 그대로 쓴다. 모달 문서의 "스케줄 폼 모달" 노드(`337:127681`, `337:128071`)가 위 표의 화면에 놓인 인스턴스다.

| 슬롯     | 구성                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| `Panel`  | `size="md"` `placement="sheetOnMobile"` — 488px 중앙, `max-tablet:` 하단 앵커 바텀시트                         |
| `Header` | `align="start"` — `Modal.Title` + `Modal.CloseButton`(X)                                                       |
| `Body`   | 폼 필드 6개 (아래 "폼 필드"). 화면보다 길면 Body가 스크롤된다                                                  |
| `Footer` | `layout="split"` — `취소`(`Modal.CloseButton`의 `render`에 `Button`) · 제출(`Button` primary, `type="submit"`) |

제출 버튼은 공통 `Button` primary(`bg-primary-500`, `disabled:bg-[#bbbbbb]`)와 Figma 값이 같다. `취소`는 Figma가 회색 보더(`#ccc`)·`#737373` 글자라 보더가 같은 `tertiary`를 쓰고, 글자색만 DatePicker footer 선례처럼 `text-muted-foreground`로 덮어쓴다. 두 버튼 모두 `large`의 고정 너비를 풀고(`w-auto`), 모바일에서는 48px·16px로 줄인다.

| 모드 | 제목                     | 제출 버튼   | 초기값                         | 여는 곳                                  |
| ---- | ------------------------ | ----------- | ------------------------------ | ---------------------------------------- |
| 추가 | 아르바이트생 스케쥴 추가 | `생성`      | 모두 빈 값 (Figma 기준)        | 헤더 "스케쥴 추가" 버튼, 모바일 FAB 추가 |
| 수정 | 아르바이트생 스케쥴 수정 | `수정 완료` | 선택한 `PartTimeSchedule`의 값 | 날짜 상세 행 `수정`                      |

`<form>`은 `Modal.Panel` 안에서 Body·Footer를 감싸고, 제출 버튼은 `type="submit"`으로 둔다. Enter 제출과 RHF `handleSubmit`이 그대로 동작한다.

### 폼 필드

| 필드        | 이름              | 필수 | 컴포넌트             | placeholder                   | 비고                                                                                                                          |
| ----------- | ----------------- | ---- | -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `staffId`   | 아르바이트생 이름 | ○    | `FormDropdown` large | 아르바이트생을 선택해주세요   | 옵션은 `staff.isDeleted`인 아르바이트생을 뺀 목록. `{ value: String(id), label: name }`. 수정 모드에서는 비활성 (확인 필요 3) |
| `date`      | 근무 날짜         | ○    | `DatePicker`         | 근무 날짜를 선택해주세요      | 트리거 표시는 공통 DatePicker 포맷(`yyyy.MM.dd`)을 따른다                                                                     |
| `startTime` | 근무 시작 시간    | ○    | `FormDropdown` large | 근무 시작 시간을 선택해주세요 | 옵션은 `00:00` ~ `23:00` 1시간 단위 24개 (`HH:mm`, 2026-10-02 확정)                                                           |
| `endTime`   | 근무 마감 시간    | ○    | `FormDropdown` large | 근무 마감 시간을 선택해주세요 | 위와 같음                                                                                                                     |
| —           | 빠른 선택         | —    | 칩 버튼 3개          | —                             | 누르면 시작·마감 시간을 한 번에 채운다. 폼 값이 아니다 ("빠른 선택" 참고)                                                     |
| `memo`      | 메모              | —    | `Input`              | 간단한 메모를 작성해주세요    | 한 줄 입력                                                                                                                    |

- **폼 값 타입** — `staffId`·`startTime`·`endTime`은 `FormDropdown`의 `value`가 string이라 string으로, `date`는 `DatePicker`의 `value`가 `Date`라 `Date | undefined`로 둔다. `PartTimeSchedule`(`date: string`)로의 변환은 제출 시점에 한다. 폼 값 타입은 모달 파일 안에 둔다
- **RHF 연결** — `FormDropdown`·`DatePicker`는 controlled(`value` + `onChange`)라 `Controller`로, `Input`은 `forwardRef`라 `register`로 연결한다
- **라벨** — 공통 `InputField`는 `Input` 전용이고 필수 표시(`*`)가 없다. 필드 6개가 같은 라벨 행(라벨 + `*` `primary-500`)을 쓰므로 도메인에 라벨 컴포넌트(`PartTimeScheduleFormField`)를 둔다. 공통 컴포넌트는 수정하지 않는다. `FormDropdown`·`DatePicker`는 `id`를 받지 않아 `<label htmlFor>`로 묶을 수 없으므로, 라벨 행과 입력을 `role="group"` + `aria-labelledby`로 묶는다
- **크기** — large 기준 라벨 16px / 입력 56px / 필드 간격 16px, 모바일(`max-tablet:`) 라벨 14px / 입력 44px / 필드 간격 12px. `FormDropdown`·`DatePicker`·`Input`의 반응형 지원 여부에 맞춰 호출부 `className`으로 맞춘다
- **메모 placeholder 색은 호출부에서 덮어쓴다** (2026-10-02 확정) — 공통 `Input`의 `placeholder:text-slate-500`은 코드 토큰 기준 `#1C1917`이라 입력값처럼 진하게 보인다. 메모 `Input`의 `className`에 `[&_input]:placeholder:text-muted-foreground`(`#6B6A68`, DatePicker placeholder와 같은 색)를 준다. 공통 `Input`은 수정하지 않고 담당자에게 전달한다. Input이 고쳐지면 이 덮어쓰기를 제거한다
- **포커스 링 여백** — 입력의 좌·우·아래 끝이 스크롤 영역(`Modal.Body`, `overflow-y: auto`)과 맞닿아 Input의 바깥 포커스 링(`ring-2`)이 잘린다. `Modal.Body`에 `-m-1 p-1`을 줘 링이 그려질 4px만 확보하고 레이아웃은 유지한다

### 검증

검증 라이브러리(zod 등)는 의존성에 없으므로 RHF 기본 `rules`로 처리한다.

| 규칙             | 동작                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| 필수 4개 필드    | 모두 채워지기 전에는 제출 버튼이 `disabled`다 (Figma 추가 화면의 회색 `생성`)                                         |
| 자정을 넘는 근무 | 허용한다 (2026-10-02 확정). 마감이 시작보다 이르면 다음 날 마감으로 본다(예: `22:00` ~ `02:00`). `date`는 시작 날짜다 |
| 시작 = 마감      | 확인 필요 4                                                                                                           |

- **필수 표시와 비활성 제출 버튼의 접근성** — 라벨의 `*`는 `aria-hidden`이고 `sr-only` "(필수)" 텍스트로 보조기술에 전달한다. 제출 버튼은 `focusableWhenDisabled`로 비활성일 때도 Tab으로 닿고 `aria-disabled`로 읽히게 한다. 이때 HTML `disabled` 속성이 없어 공통 Button의 `disabled:` 스타일이 적용되지 않으므로, 호출부에서 `data-disabled:`로 같은 회색(`#bbbbbb`)·`cursor-not-allowed`를 준다

### 빠른 선택

| 칩   | 라벨                 | 채우는 값       |
| ---- | -------------------- | --------------- |
| 오전 | 오전 (09:00 ~ 13:00) | `09:00`–`13:00` |
| 오후 | 오후 (13:00~18:00)   | `13:00`–`18:00` |
| 저녁 | 저녁 (18:00~22:00)   | `18:00`–`22:00` |

- 누르면 `setValue`로 `startTime`·`endTime`을 채운다. 채운 뒤에도 시간 드롭다운에서 따로 고칠 수 있다
- 라벨 표기는 Figma에서 오전만 `~` 양쪽에 공백이 있다. 구현은 `HH:mm ~ HH:mm`로 통일한다
- **칩은 공통 `CalendarEventChip`을 쓴다** (2026-10-02 확정) — 스케쥴 캘린더 셀과 같은 칩이다. `onClick`을 넘겨 버튼으로 렌더한다
  - 현재 `startTime`·`endTime`이 칩 시간과 일치하면 `tone="accent"`, 아니면 `tone="muted"`로 선택 상태를 표시한다
  - Figma의 회색 배경(`slate-200`)·`secondary-600` 글자는 따르지 않는다
  - `CalendarEventChip`은 `aria-pressed`를 받지 않는다. 칩은 시간을 채우는 동작이고 선택 상태는 시간 드롭다운 값으로도 드러나므로, 공통 컴포넌트를 수정하지 않고 그대로 쓴다
- 공통 `SelectButton`(46.67×38px, 6px)은 크기·모양이 달라 쓰지 않는다

### 반응형·레이어

| 폭                    | 모달                                    | 드롭다운·날짜 선택                                                   |
| --------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| 744px 이상 (`tablet`) | 488px 중앙, `rounded-[40px]`            | 드롭다운은 트리거 아래 팝업, DatePicker는 모달 위 팝오버             |
| 744px 미만            | 375px 바텀시트, 상단 32px 라운드, `p-6` | 드롭다운은 같은 팝업. 날짜 선택은 우선 팝오버로 연결한다 (아래 참고) |

- 드롭다운 팝업은 모달 안에서 열리므로 모달 위에 떠야 한다. `--z-dropdown: 100`일 때는 모달(`--z-modal-base: 1000`) 뒤에 가려져, 토큰을 `1500`으로 올렸다 (2026-10-02 확정, [Dropdown 설계 결정](../../component/dropdown/README.md)). 모달보다 위, DatePicker 팝오버(`2000`)보다 아래다
- **`FormDropdown`에 `disabled`·`contentClassName` 추가** (2026-10-02 확정) — 수정 모드의 이름 비활성과, 시간 옵션 24개 팝업의 높이 제한(`max-h-72` + 스크롤)에 필요하다 ([FormDropdown API](../../component/form-dropdown/README.md#formdropdown))
- DatePicker 팝오버는 `--z-popover: 2000`이라 모달 위에 뜬다 ([DatePicker 설계 결정](../../component/datepicker/README.md))
- **모바일 날짜 선택은 바텀시트로 바꾼다** (2026-10-02 확정) — Figma(`337:128232`)는 744px 미만에서 날짜 선택을 바텀시트로 띄운다. 공통 DatePicker는 지금 Base UI `Popover` 기반 팝오버만 지원하므로, DatePicker에 모바일 바텀시트를 추가하는 작업을 별도 이슈로 진행한다 (이슈 번호 미정). 그 전까지는 모바일에서도 팝오버로 연결해 두고, 바텀시트가 추가되면 이 필드를 바꾼다
  - **알려진 문제** — 바텀시트 폼 안에서 팝오버(높이 약 444px)가 트리거 위·아래 어디에도 들어가지 않아 화면 아래로 넘친다. 375×812에서는 아래가 조금 잘리지만 `확인`을 누를 수 있고, 375×667에서는 `취소`·`확인`이 화면 밖으로 나가 **날짜를 확정할 수 없다** (2026-10-02 실측). 공통 DatePicker는 `side` 옵션을 받지 않아 호출부에서 우회하지 않고, DatePicker 바텀시트 PR에서 해결한다. 바텀시트가 머지되면 이 필드는 별도 수정 없이 바뀐 DatePicker를 쓸 것으로 예상한다

### 열기·닫기

- **여는 방식은 overlay-kit** (2026-10-02 확정) — 6단계 삭제 확인이 `openConfirmModal`(overlay-kit)을 쓰므로 모달을 여는 경로를 하나로 맞춘다. 나중에 이 모달 위에 다른 모달을 띄우게 되어도 부모가 이미 overlay-kit 경로라 쌓임 순서가 맞는다 ([Modal 중첩 모달](../../component/modal/README.md#경로를-섞으면-안-되는-이유-실측))
- 호출 API는 공통 프리셋의 `openXxxModal` 형태를 따라 `openPartTimeScheduleFormModal({ mode, schedule?, staffs })`로 두고, overlay-kit 컨트롤러가 `useOverlayStackIndex`를 호출해 `stackIndex`를 넘긴다
- 모달은 overlay Provider 위치에 렌더돼 페이지 상태 Context를 읽지 못한다. 아르바이트생 목록·수정 대상은 props로 넘긴다
- 닫기 경로: X, `취소`, ESC, 딤 클릭
- **입력 중 닫아도 확인 모달을 띄우지 않는다** (2026-10-02 확정) — 입력한 값은 저장되지 않고 바로 닫힌다. 다시 열면 초기값부터 시작한다. 닫을 때 입력 내용을 남겨 둘지는 확인 필요 1
- **중복 열기 방지** — overlay-kit으로 연 모달은 더블클릭으로 연달아 열리면 닫힌 뒤에도 페이지에 `aria-hidden`이 남는다(공통 `openConfirmModal`도 같은 증상). 공통 실행 함수에서 해결되기 전까지 `openPartTimeScheduleFormModal`이 열려 있는 동안에는 다시 열지 않는다

### Figma와 다르게 구현하는 점

| 항목                   | Figma                                                                    | 구현                                  | 근거                                          |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------- | --------------------------------------------- |
| 이름 필드 placeholder  | `이메일을 입력해주세요`(744), 값 `자바스크립트로 웹 서비스 만들기`(1920) | `아르바이트생을 선택해주세요`         | 다른 화면에서 복사된 문구로 보인다            |
| 시간 필드 placeholder  | `~을 입력해주세요`                                                       | `~을 선택해주세요`                    | 입력이 아니라 드롭다운 선택이다               |
| 수정 화면 시간·메모    | 시간 빈 값, 메모 `chedacheese@slid.kr`                                   | 수정 대상 값으로 채운다               | 목업 값이 채워지지 않은 것으로 보인다         |
| 날짜 표시              | `2025-01-10`(선택 화면), `2025. 01. 10`(수정 화면)                       | 공통 DatePicker `yyyy.MM.dd`          | 화면마다 다르므로 공통 컴포넌트 기준을 따른다 |
| 날짜 필드 아이콘       | 트리거 왼쪽에 캘린더 아이콘                                              | 아이콘 없음                           | 공통 DatePicker 트리거에 아이콘 슬롯이 없다   |
| 삭제 확인 설명 (6단계) | `삭제된 목표는 복구할 수 없습니다.`                                      | `삭제된 스케쥴은 복구할 수 없습니다.` | 다른 도메인 문구가 복사된 것으로 보인다       |

## 단계별 PR 계획

| 단계 | 브랜치                             | 범위                                                                                                                                     | 상태          |
| ---- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1    | `feat/part-time-schedule-docs`     | 아르바이트 스케쥴 관리 docs 작성 — 이 문서                                                                                               | 머지 (#104)   |
| 2    | `feat/part-time-schedule-ui`       | 아르바이트 스케쥴 관리 목업 UI — 캘린더·필터·날짜 상세·반응형, FE 타입·목업, `--z-dropdown` 토큰                                         | 머지 (#107)   |
| 3    | `feat/part-time-schedule-modal-ui` | 아르바이트 스케쥴 관리 추가/수정 모달 UI — RHF 폼 UI, "스케쥴 추가" 버튼·모바일 FAB(공통 `ActionButton`)·날짜 상세 행 `수정` → 모달 열기 | 진행 중       |
| 4    | 미정                               | 조회 API 연동 — API 명세 확정, DTO 타입·Formatter, fetcher, Query Key, prefetch + hydration, 목업 제거                                   | 2단계 이후    |
| 5    | 미정                               | 출근 확인 토글 — `useMutation`, 날짜 상세 체크박스 활성화                                                                                | API 명세 확정 |
| 6    | 미정                               | 스케쥴 추가·수정·삭제 기능 — 3단계 모달에 `useMutation` 연결, 날짜 상세 행 `삭제`에 삭제 확인 모달·`useMutation` 연결, 조회 쿼리 무효화  | 3·4단계 이후  |
| 7    | 미정                               | 스케쥴 공유 — 캘린더 + 날짜 상세 영역을 PNG로 캡처해 다운로드                                                                            | 2단계 이후    |

1·2단계는 stacked PR로 진행해 `dev`에 머지했다 (1단계 #104, 2단계 #107). 3단계는 2단계 브랜치에서 분기했지만, 앞 단계가 모두 머지되어 `dev` 위로 rebase하고 `dev`를 base로 PR을 연다 (2026-10-02).

이 페이지 PR 흐름 밖에서 다룰 작업:

- **사이드바 메뉴 연결** — 라우트는 `app/partTime/schedule/page.tsx`로 이미 동작하지만, 사이드바 "아르바이트 > 스케쥴 관리"가 `disabled`("준비 중")라 진입 경로가 없다. `ROUTE_PATHS` 추가와 메뉴 연결은 별도 이슈로 다룬다 (이슈 번호 미정)
- **하드코딩 색상 토큰화** — #51
- **DatePicker 모바일 바텀시트** — 공통 DatePicker에 744px 미만 바텀시트 표시를 추가한다. 추가되면 이 페이지 추가/수정 모달의 근무 날짜 필드를 팝오버에서 바텀시트로 바꾼다 (이슈 번호 미정)
- **아이콘 lucide 교체** — 2단계에서 추가한 SVG 아이콘(`ic_checkbox`, `ic_plus-white`)을 `lucide-react`로 바꾼다. #102 헤더 "스케쥴 공유" 버튼은 처음부터 lucide `LinkIcon`을 쓴다
  - 모바일 FAB 아이콘(`ic_link`, `ic_pencil`, `ic_plus-large`)은 교체 대상이 아니다. FAB를 공통 `ActionButton`으로 만들면 메인 `+`는 컴포넌트 안의 lucide `PlusIcon`을 쓰고, 보조 아이콘도 lucide로 넘기므로 SVG를 추가하지 않는다 ([ActionButton 레이어 구조](../../component/ActionButton/README.md#레이어-구조))

## 확인 필요

아래 항목은 임의로 확정하지 않는다. 확인 후 이 문서에 반영한다. 모두 "추가/수정 모달"(3단계) 항목이다.

1. **닫을 때 입력 내용 유지** — 지금은 닫으면 입력한 값을 버린다. 실수로 닫았을 때를 대비해 다음에 열 때 입력 내용을 남겨 둘지
2. **수정 모드의 제출 버튼** — Figma `수정 완료`는 활성 상태로만 그려져 있다. 바뀐 값이 없을 때(`isDirty === false`) 비활성화할지
3. **수정 모드의 아르바이트생 변경** — Figma 수정 화면에서는 이름 드롭다운이 활성이다. 우선 비활성으로 둔다 (2026-10-02). 다른 아르바이트생으로 바꿀 수 있게 할지는 다시 확인한다
4. **시작 = 마감** — 자정을 넘는 근무를 허용하면 `09:00` ~ `09:00`이 0시간인지 24시간인지 모호하다. 에러로 막을지
5. **모달 파일의 폴더 위치** — 모달과 그 컨트롤러·launcher·하위 컴포넌트를 `partTime/schedule/modal/`에, 여는 쪽(버튼 등)은 `partTime/schedule/`에 두었다. [folder-structure.md](../../architecture/folder-structure.md)의 예시는 `partTime/schedule/`까지 두 단계만 있어, 도메인 하위 폴더 안에 기능 단위 폴더를 한 단계 더 둘 수 있는지 팀 합의가 필요하다. 허용한다면 폴더명 표기("컴포넌트 폴더는 `PascalCase`" 규칙과 달리 도메인 폴더는 소문자로 시작한다)도 함께 정하고, 합의되면 folder-structure.md에 반영한다. 허용되지 않으면 파일을 `partTime/schedule/`로 옮긴다
