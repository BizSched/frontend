# 아르바이트생 관리 페이지 설계

## 개요

사장님이 등록한 아르바이트생을 카드 목록으로 보고, 카드를 눌러 인적 사항·이번 주 근무 스케쥴·첨부파일·메모를 확인하며, 더보기 메뉴로 수정·삭제하는 페이지다.

- Figma: [아르바이트생 관리/목록 page](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127279&m=dev)
- 라우트: `/partTime/staff` (2026-10-02 확정). 추가는 `/partTime/staff/new`, 수정은 `/partTime/staff/[id]/edit`

| 화면                     | 데스크톱 (1920)                                                                                     | 태블릿 (744)                                                                                        | 모바일 (375)                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 목록                     | [337-127280](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127280&m=dev) | [337-127375](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127375&m=dev) | [337-127399](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127399&m=dev) |
| 상세                     | [337-127300](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127300&m=dev) | [337-127434](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127434&m=dev) | [337-127476](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127476&m=dev) |
| 상세 — 첨부파일 미리보기 | [337-128995](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-128995&m=dev) | [337-129076](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-129076&m=dev) | [337-127567](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127567&m=dev) |
| 빈 목록                  | [337-127365](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127365&m=dev) | [337-127390](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127390&m=dev) | [337-127412](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127412&m=dev) |
| 삭제 확인                | [337-127513](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127513&m=dev) | [337-127535](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127535&m=dev) | [337-127552](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127552&m=dev) |

컴포넌트 단위 노드:

| 컴포넌트            | 노드                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 카드 (`note_card`)  | large(데스크톱·태블릿) [99-130895](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=99-130895&m=dev) · small(모바일) [99-130922](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=99-130922&m=dev)                                                                                                                                                                                                             |
| 상세 패널           | 데스크톱 [337-127300](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127300&m=dev) (패널 배경 [337-127323](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127323&m=dev)) · 태블릿 [337-127434](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127434&m=dev) · 모바일 [337-127476](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127476&m=dev) |
| 첨부파일 뷰어       | 데스크톱 [337-129075](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-129075&m=dev) · 태블릿 [337-129076](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-129076&m=dev) · 모바일 [337-127567](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-127567&m=dev)                                                                                                                 |
| 추가·수정 폼 (참고) | [1256-34389](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=1256-34389&m=dev) — 상세 패널과 레이아웃을 공유한다 ("상세·폼 공유 구조" 참고)                                                                                                                                                                                                                                                                                       |

## 화면 구성

모든 컴포넌트는 도메인 컴포넌트로 `src/components/partTime/staff/`에 둔다. 공통 컴포넌트(`_common/`)는 새로 만들지 않고 기존 `Card`·`Dropdown`·`Pagination`·`ConfirmModal`을 조합한다.

### 목록

- `PartTimeStaffHeader` — 제목, 검색 입력, "+ 아르바이트생" 버튼(`/partTime/staff/new`로 이동). 검색 입력은 마크업만 두고 `hidden`으로 숨긴다 (2026-10-02 확정). 모바일은 버튼 대신 우하단 공통 `ActionButton` — 스케쥴 관리와 같게 `+`로 펼친 뒤 연필 아이콘(`추가`)을 눌러 이동한다 (2026-10-02 확정, 확인 필요 2)
- `PartTimeStaffList` — 현재 페이지 카드 목록·`Pagination`·빈 목록을 조합하는 클라이언트 컨테이너. 상세 패널 열림 상태와 삭제 확인도 여기서 연다. 한 페이지 10개, 1024px 이상 2열, 미만 1열
- `PartTimeStaffCard` — `note_card`. 공통 `Card` 기반으로 아이콘·이름·`PHONE` 배지·번호·등록일(확인 필요 1)·더보기(⋮)를 그린다. 더보기는 공통 `Dropdown`에 ⋮ 버튼을 트리거로 넘기고 `수정하기`·`삭제하기` 두 항목을 둔다. 메뉴가 카드에서만 쓰여 별도 파일로 나누지 않는다
  - Figma의 `size=large`·`small`은 prop으로 나누지 않고 `max-mobile:` 반응형 클래스로 전환한다. 화면 폭에 따라서만 바뀌고 같은 폭에서 둘이 섞이지 않는다

    | 항목      | large (744px 이상)             | small (744px 미만)           |
    | --------- | ------------------------------ | ---------------------------- |
    | 카드      | padding 28/38/32, radius 24px  | padding 16px, radius 20px    |
    | 줄 간격   | 16px                           | 12px                         |
    | 아이콘    | 40px, radius 12px, 이름과 16px | 32px, radius 8px, 이름과 8px |
    | 이름      | 20px/600                       | 14px/600                     |
    | ⋮         | 24px                           | 16px                         |
    | 번호      | 14px                           | 12px                         |
    | 배지·날짜 | 12px                           | 12px                         |

- 빈 목록 — 일러스트 + "등록된 아르바이트생이 없어요." 이 페이지에서만 쓰므로 `PartTimeStaffList` 안에 둔다
- 삭제 확인 — 공통 삭제 확인 모달([85-121501](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=85-121501&m=dev)). 제목 "아르바이트생을 삭제하시겠어요?", 경고 "삭제된 상세 내용은 복구할 수 없습니다." ⋮ `삭제하기` → 모달 열기 → 취소/확인까지 UI 단계에서 만들고, 확인 시 실제 삭제 요청은 기능 단계에서 연결한다. 모달 자체는 이 페이지 흐름 밖의 공통 컴포넌트 작업으로 만든다 ("단계별 PR 계획" 참고)

### 상세

Figma의 상세 노드는 **패널 껍데기 + 내용**으로 나뉜다. 데스크톱(800px 우측 패널, 좌측 radius 40px, dim)과 태블릿(전체 화면) 노드를 비교하면 내용은 같고 껍데기만 다르다. 그래서 둘을 나눈다.

- `PartTimeStaffDetailPanel` — 껍데기. Base UI `Dialog`로 dim·포커스 트랩·Esc 닫기를 처리한다. 1024px 이상은 우측 800px 패널(좌측 radius 40px, padding 48/40), 미만은 전체 화면(padding 태블릿 40/24, 모바일 24/24). 첨부파일 뷰어가 열리면 뷰어도 이 안에 함께 배치한다
- `PartTimeStaffDetail` — 내용. 아래 공유 레이아웃에 값을 채우고, 그 사이에 주간 스케쥴을 넣는다. 닫기(×) 버튼은 패널이 넘긴다. 744px 미만은 배치가 바뀐다:
  - 닫기(×)가 헤더 줄에서 빠져 그 위 오른쪽 한 줄을 차지한다
  - 아이콘 32px, 이름 18px/600 (744px 이상 40px, 24px/600)
  - 인적 사항이 2열에서 1열(나이·성별·번호·시급, 간격 8px)로 바뀐다
  - 주간 스케쥴이 칩에서 날짜 + 6px 점으로 바뀐다
- `PartTimeStaffWeeklySchedule` — "N월 N째 주 근무 스케쥴". 7일 날짜 + 근무일 칩, 744px 미만은 날짜 + 점. 상세에만 있다. 칩 내용과 상태는 "주간 스케쥴 칩" 참고
- `PartTimeStaffAttachmentViewer` — 첨부파일 뷰어. `#fafafa` 배경 안에 `#ccc` 테두리 미리보기 영역. PDF는 `iframe`, 이미지는 `img`로 그린다 (2026-10-02 확정). 별도 다운로드 버튼은 두지 않는다 (2026-10-02 확정) — PDF는 데스크톱 브라우저 내장 뷰어의 다운로드를, 이미지는 데스크톱 우클릭 저장·모바일 길게 눌러 저장을 쓴다. 모바일 브라우저 중에는 `iframe` 안 PDF를 그리지 못하는 경우가 있어, 구현 단계에서 실제 기기로 확인한다

  | 폭          | 배치                                                    | 크기                                              | 접기 탭                                         |
  | ----------- | ------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
  | 1024px 이상 | 상세 패널 오른쪽 세로 영역. 상세 패널은 왼쪽으로 밀린다 | 폭 734px, 높이 화면 전체, 좌측 보더, padding 40px | 뷰어 왼쪽 위에 붙은 38×60 탭, `‹` 아이콘 24px   |
  | 744~1023px  | 상세 화면 하단 시트                                     | 폭 전체, 상단 보더, padding 40px                  | 시트 오른쪽 위에 붙은 60×38 탭, `^` 아이콘 24px |
  | 744px 미만  | 위와 같음                                               | 폭 전체, 높이 230px, padding 16px                 | 41×28 탭, 아이콘 20px                           |

  탭은 뷰어를 접었다 펼치는 토글이다 (2026-10-02 확정). 접으면 탭만 남고, 탭을 누르면 다시 펼친다. 뷰어를 완전히 닫는 것은 상세 패널을 닫을 때다

### 상세·폼 공유 구조

추가·수정 폼([1256-34389](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=1256-34389&m=dev))은 상세와 **같은 골격**을 쓴다.

| 영역          | 상세                                          | 추가·수정 폼                                                |
| ------------- | --------------------------------------------- | ----------------------------------------------------------- |
| 헤더          | `img_note` + 이름(24px/600) + 닫기(×)         | `img_note` + 이름 입력(placeholder `#bbb`) + 글자 수 `0/30` |
| 인적 사항     | 2열 × 2행 — 나이·성별 / 번호·시급, 라벨 40px  | 같은 배치, 값 자리에 입력 요소                              |
| 구분선        | 있음                                          | 있음                                                        |
| 주간 스케쥴   | 있음                                          | 없음                                                        |
| 첨부파일 박스 | `#fafafa`·radius 14px, 파일 목록(누르면 뷰어) | 같은 박스, "첨부파일" 업로드 트리거                         |
| 본문          | 메모 표시 — 일반 텍스트, 줄바꿈 유지          | 메모 입력 + 하단 "공백포함 N자 \| 공백제외 N자"             |

공유 방식:

- **레이아웃과 표시 부품만 공유하고, 상세와 폼은 별도 컴포넌트로 둔다.** `mode="view" | "edit"` 하나로 합치면 폼 쪽의 React Hook Form 의존과 입력 검증이 상세에도 섞이고, 영역마다 분기가 생긴다
- 공유 부품 (`src/components/partTime/staff/`):
  - `PartTimeStaffProfileLayout` — 헤더·인적 사항·구분선·(선택)중간 영역·첨부파일·본문 순서와 간격을 잡는 레이아웃. 각 영역은 slot prop(`title`, `fields`, `extra`, `attachments`, `body`)으로 받는다. 상세는 `extra`에 주간 스케쥴을 넣고, 폼은 비운다
  - `PartTimeStaffFieldRow` — 라벨(40px, `#a4a4a4`) + 값 한 줄. 값은 `ReactNode`라 상세는 텍스트, 폼은 입력 요소를 넣는다
  - `PartTimeStaffAttachmentBox` — `#fafafa` 박스와 파일 행 스타일. 행 목록은 children으로 받아 상세는 "열기" 버튼 행, 폼은 업로드·삭제 행을 넣는다
  - `img_note` 아이콘 — 카드·상세·폼이 함께 쓰는 정적 자산. Figma는 large(40px, 사각형 조합)와 small(32px, SVG 하나) 두 벌이지만, 안쪽 노트 그림은 같으므로 small의 SVG 하나를 `src/assets/`에 두고 배경 상자 크기·radius만 반응형으로 바꾼다
- 폼 고유 요소(이름 글자 수, 본문 글자 수, 업로드)는 폼 페이지 설계 문서에서 다룬다

## 상태·데이터

| 상태                   | 범위             | 도구                                | 근거                                                                                                                                  |
| ---------------------- | ---------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 현재 페이지            | 목록             | URL `?page=` (`usePageSearchParam`) | 목록 페이지 번호는 URL로 관리한다는 [Pagination 규칙](../../component/pagination/README.md#url-연동--usepagesearchparam)을 따른다     |
| 상세를 연 아르바이트생 | 목록 → 상세 패널 | URL `?staffId=`                     | 상세가 모바일에서 전체 화면이라, 뒤로가기가 페이지 이탈이 아니라 패널 닫기여야 한다. 새로고침 유지·링크 공유도 된다 (2026-10-02 확정) |
| 미리보기 중인 첨부파일 | 상세 패널        | `useState`                          | 상세 패널 안에서만 쓰고, 패널을 닫으면 함께 닫힌다                                                                                    |
| 아르바이트생 목록      | 서버 데이터      | 목업 → TanStack Query               | 삭제 후 무효화가 필요하다                                                                                                             |
| 아르바이트생 상세      | 서버 데이터      | 목업 → TanStack Query               | 목록 응답에 없는 필드(성별·시급·첨부파일·메모)를 상세 조회로 받는다고 가정. API 명세 확정 시 다시 판단                                |

API 명세는 [스케쥴 관리](./schedule.md#상태데이터)와 같이 UI를 먼저 구현한 뒤 API 연동 단계에서 정하고, 도메인 문서(`feature/partTime/README.md`)에 작성한다. 목업 단계에서는 UI가 쓰는 FE 타입만 둔다. 스케쥴 관리의 `PartTimeStaff`(`id`·`name`·`isDeleted`)는 필터용 최소 타입이라 이 페이지의 필드를 더하지 않고, 목록·상세용 타입을 따로 둔다.

### API 연동 계획

1. 목록: Query Key에 `page`를 넣는다. 첫 화면은 `page.tsx`에서 `prefetchQuery` → `HydrationBoundary` → `useQuery`
2. 상세: `?staffId=`가 있으면 클라이언트에서 단건 조회한다. 카드에 이미 있는 이름·번호는 목록 캐시로 먼저 그린다. URL로 바로 들어와 현재 페이지에 없는 `staffId`도 단건 조회로 그린다
3. 이번 주 근무 스케쥴은 스케쥴 조회 API를 `staffId`·주 범위로 재사용할 수 있는지 명세 확정 시 확인한다
4. 삭제: `useMutation` 성공 시 목록 쿼리를 무효화하고, 현재 페이지가 비면 이전 페이지로 이동한다

## 렌더링 경계

- `page.tsx`는 Server Component다
- `PartTimeStaffList`는 `usePageSearchParam`(`useSearchParams`)을 쓰므로 `"use client"`이고, `page.tsx`에서 `<Suspense>`로 감싼다
- `PartTimeStaffCard`는 `Dropdown` 항목에 `onSelect` 함수를 넘겨야 해서 Client 쪽에서만 렌더된다. 지시어 없이 작성하고 `PartTimeStaffList`가 import한다
- `PartTimeStaffDetailPanel`은 Base UI `Dialog`와 뷰어 열림 상태를 써서 `"use client"`다. `PartTimeStaffDetail`·공유 부품은 지시어 없이 작성한다
- 모바일 플로팅 버튼은 `onClick`을 받아야 해서 Client Component다

[금지 목록](../../architecture/rendering.md#금지-목록-리뷰-체크리스트) 점검:

- [x] `page.tsx`에 `"use client"` 없음
- [x] Server → Client로 직렬화 불가능한 값 전달 없음
- [x] Client Component에 `Date` 객체 전달 없음 — 날짜는 string
- [x] 비공개 환경변수 참조 없음
- [x] 서버 전용 모듈 없음 — API 연동 단계에서 서버 fetcher를 추가하면 `server-only` 적용
- [x] 서버 QueryClient 전역 싱글턴 없음 — API 연동 단계에서 요청 단위로 생성
- [x] Client Component가 Server Component를 직접 import하지 않음

## 설계 결정

### Figma와 다르게 해석하는 부분

| 항목                 | Figma                                                                      | 구현                   | 근거                                                                         |
| -------------------- | -------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| 모바일·빈 목록 제목  | "노트 모아보기"                                                            | "아르바이트생 관리"    | 다른 화면 템플릿에서 남은 문구다. 데스크톱·태블릿 목록은 "아르바이트생 관리" |
| 빈 목록 사이드바     | 목표·캘린더·소통 게시판 등 이전 메뉴                                       | 공통 레이아웃 사이드바 | 위와 같음. 사이드바는 페이지 책임이 아니다                                   |
| 검색 입력            | 빈 목록·삭제 확인 화면에만 "노트를 검색해주세요" 입력이 있고 목록에는 없음 | 헤더에 두되 `hidden`   | 검색 기능은 아직 범위 밖이다. 자리만 잡아 두고 기능이 생기면 드러낸다        |
| 상세 첨부파일 아이콘 | 기본 화면은 업로드 아이콘, 미리보기 화면은 서비스 로고                     | 한 가지 파일 아이콘    | 같은 첨부파일 행이 화면마다 다르게 그려져 있다                               |

### 카드 클릭과 더보기 메뉴

- 카드 전체를 `<button>`으로 만들면 안에 ⋮ 버튼이 중첩돼 잘못된 HTML이 된다. 카드 루트는 그대로 두고, 카드 전체를 덮는 상세 열기 버튼과 그 위에 올린 ⋮ 버튼을 형제로 둔다
- ⋮ 메뉴는 `수정하기`·`삭제하기`. `수정하기`는 `/partTime/staff/[id]/edit`로 이동, `삭제하기`는 삭제 확인 모달을 연다. 메뉴를 열거나 항목을 골라도 상세 패널은 열리지 않는다
- 드롭다운 크기는 공통 `Dropdown`의 `small`(102px)을 쓴다

### 주간 스케쥴 칩

칩에는 이름 대신 **근무 시간**(`09:00~13:00`)을 표시한다 (2026-10-02 확정). 한 사람의 상세라 이름은 반복 정보다. 시간이 들어가면 Figma 칩의 좌우 padding(30px)으로는 7칸에 들어가지 않으므로 padding을 줄인다.

| 상태      | 표시                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| 근무 예정 | 노란 칩 (Figma `secondary/500` 배경)                                                    |
| 근무 완료 | disabled 스타일 (회색) — 출근 확인됨(`isCheckedIn`) 기준 (2026-10-02 확정, 확인 필요 4) |
| 미출근    | 확인 필요 3                                                                             |

744px 미만의 점도 같은 상태 색을 따른다.

### 그 외

- **상세 패널은 공통 컴포넌트로 만들지 않는다** — 이 페이지에서만 쓰는 화면이라 도메인 컴포넌트로 둔다. 공통 `Modal`은 중앙 고정 패널이라 위치·크기가 맞지 않아, 같은 Base UI `Dialog`를 직접 쓴다
- **삭제 확인은 공통 컴포넌트로 만든다** — 기존 `ConfirmModal`은 설명이 일반 텍스트 한 줄이라, Figma 삭제 모달의 경고 아이콘 + `accent/500` 경고 문구를 그대로 표현할 수 없다. 삭제 확인은 다른 도메인(목표·매출 등)에도 반복되므로 공통으로 둔다
- **한 페이지 카드 수는 화면 폭과 관계없이 10개** (2026-10-02 확정) — Figma는 데스크톱 9개, 태블릿·모바일 6개다. 폭마다 다르면 `?page=` 값이 같은 위치를 가리키지 않고, 서버 페이지네이션 크기도 하나로 정할 수 없다. 데스크톱 2열에서 빈칸이 생기지 않도록 짝수로 정했다
- **메모는 줄바꿈을 유지하는 일반 텍스트** (2026-10-02 확정) — `whitespace-pre-wrap`으로 표시하고, 폼은 `textarea`로 입력받는다. Figma의 굵은 제목·글머리표는 표현하지 않는다. 마크다운 지원은 이후에 검토한다
- **삭제된 아르바이트생은 목록에 나오지 않는다** — 스케쥴 관리에서 `isDeleted`를 숨기기로 한 것과 맞춘다. 서버가 삭제를 soft delete로 처리하면 목록 API가 제외해 주는지 명세 확정 시 확인한다

## 단계별 PR 계획

| 단계 | 브랜치                                  | 범위                                                                                                                                                                                | 상태          |
| ---- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1    | `feat/part-time-list-docs`              | 아르바이트생 관리 docs 작성 — 이 문서                                                                                                                                               | 진행 중       |
| 2    | `feat/part-time-list-card`              | `PartTimeStaffCard` large·small(⋮ 메뉴 UI 포함 — 항목 선택 시 동작은 5단계에서 연결), `img_note` 자산, 목록용 FE 타입·목업                                                          | 1단계 이후    |
| 3    | `feat/part-time-list-detail`            | 공유 부품(`PartTimeStaffProfileLayout`·`FieldRow`·`AttachmentBox`), `PartTimeStaffDetail`·`WeeklySchedule`·`DetailPanel`, 상세용 FE 타입·목업                                       | 2단계 이후    |
| 4    | `feat/part-time-list-attachment-viewer` | `PartTimeStaffAttachmentViewer`, 상세 패널과의 배치(데스크톱 옆 패널·모바일 하단 시트)                                                                                              | 3단계 이후    |
| 5    | `feat/part-time-list-ui`                | 페이지 조립 — 목록 그리드·`Pagination`·빈 목록·헤더·플로팅 버튼, 카드 → 상세 연결, ⋮ `수정하기` → 수정 페이지 이동, ⋮ `삭제하기` → 삭제 확인 모달 열기·닫기(확인 시 요청 없이 닫힘) | 4단계 이후    |
| 6    | 미정                                    | 목록·상세 조회 API 연동 — DTO 타입·Formatter, fetcher, Query Key, prefetch + hydration, 목업 제거                                                                                   | API 명세 확정 |
| 7    | 미정                                    | 삭제 기능 연결 — 5단계 삭제 확인 모달의 확인에 `useMutation` 연결, 목록 무효화                                                                                                      | 6단계 이후    |

1~5단계는 stacked PR로 진행한다. 각 단계 브랜치는 바로 앞 단계 브랜치에서 분기하고, 1 → 5 순서로 `dev`에 머지한다. 앞 단계 PR이 머지되면 다음 단계 PR의 base를 `dev`로 바꾸고, 2단계부터 PR 본문에 머지 순서를 명시한다.

이 페이지 PR 흐름 밖에서 다룰 작업:

- **사이드바 메뉴 연결** — "아르바이트 > 아르바이트생 관리"가 `disabled`라 진입 경로가 없다. `ROUTE_PATHS`에 `/partTime/staff` 추가와 메뉴 연결은 스케쥴 관리와 함께 다룬다
- **공통 삭제 확인 모달** — 별도 이슈·브랜치로 `dev`에서 분기한다. 5단계 PR은 이 브랜치가 `dev`에 머지된 뒤 올린다
- **아르바이트생 추가·수정 페이지** — 3단계의 공유 부품을 가져다 쓴다. 페이지 설계 문서는 따로 작성한다

## 확인 필요

1. **카드 날짜 — 등록일, 이후 입사일 전환 여부** — 지금은 서버가 주는 생성 시각(등록일)을 표시한다 (2026-10-02 확정). 사장님께 더 의미 있는 정보는 입사일이라, 전환하려면 추가·수정 폼에 입사일 입력(DatePicker)과 BE 필드가 필요하다. Figma 폼에는 아직 입사일 칸이 없다
2. **모바일 추가 버튼 UX** — 스케쥴 관리와의 일관성을 위해 `ActionButton`(`+` → 연필)으로 확정했다. 액션이 "추가" 하나뿐이라 두 번 눌러야 하므로, 이후 개선 사항으로 단일 플로팅 버튼 전환이나 보조 액션 추가를 다시 검토한다
3. **미출근 표시** — 근무 시간이 지났는데 출근 확인이 안 된 스케쥴. 정해야 할 것:
   - 판정 시점: 시작 시각이 지나면 미출근인지, 종료 시각이 지나야 미출근인지. 그 사이(근무 중 시간대)는 "근무 예정"으로 둘지
   - 표시: 노랑(예정)·회색(완료)과 구분되는 색이나 아이콘이 필요한지. 744px 미만의 점에도 같은 구분이 필요하다
   - 사후 처리: 미출근으로 표시된 뒤 사장님이 출근 확인을 하면 바로 "근무 완료"로 바뀌는지
   - 다른 화면과의 일관성: 스케쥴 관리 캘린더·날짜 상세에서도 같은 상태를 보여줄지
4. **근무 완료 판정 기준** — "출근 확인됨(`isCheckedIn`)"을 완료로 본다 (2026-10-02 확정, MVP). 출근만 확인되고 아직 근무 중인 경우, 근무 전에 미리 체크한 경우에도 완료로 보여 혼선이 생길 수 있다. 이후 출근·퇴근 확인을 나누거나 종료 시각을 함께 보는 방식으로 다시 판단한다
5. **기준 주** — "N월 N째 주"를 오늘이 속한 주로 볼지, 주 이동(이전·다음 주)이 필요한지
