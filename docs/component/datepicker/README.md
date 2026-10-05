# DatePicker 컴포넌트 설계

날짜 하나를 선택하는 입력 UI를 하나의 공통 컴포넌트로 통일하기 위한 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 단계별 PR로 진행한다.

## 개요

Figma 원본: [Figma — BizSched](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched)

| 이름                        | 설명                                                         | 노드 ID      |
| --------------------------- | ------------------------------------------------------------ | ------------ |
| `_Calendar cell`            | 셀 컴포넌트셋 — `Type`(4) × `State`(3) = 12 variant          | `71:70371`   |
| Date picker (배치)          | 캘린더 + 취소·확인 footer가 팝오버 안에 들어간 인스턴스 배치 | `105:193109` |
| Date picker (메인 컴포넌트) | 위 배치가 참조하는 인스턴스 원본                             | `71:70370`   |
| Date picker (모바일)        | 같은 캘린더 + footer가 하단 앵커 바텀시트 안에 들어간 배치   | `337:128306` |

`_Calendar cell`의 variant 축은 다음과 같다.

| `Type`         | `State`                          |
| -------------- | -------------------------------- |
| `Default`      | `Default` / `Hover` / `Disabled` |
| `Today's date` | `Default` / `Hover` / `Disabled` |
| `Selected`     | `Default` / `Hover` / `Disabled` |
| `Active`       | `Default` / `Hover` / `Disabled` |

셀은 40×40px, 팝오버 패널 폭은 328px다.

## 설계 결정 요약

| 결정              | 선택                                                                                          | 근거                                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 선택 모드         | **단일 날짜 선택만** 지원 — range 선택은 이번 범위에서 제외                                   | 화면 레이어상 DatePicker는 현재 알바 페이지에서만 쓰이고, 단일 날짜 선택으로 충분하다는 팀 논의 결과. range가 필요해지면 그때 별도로 설계한다                                               |
| 확정 방식         | **버퍼링 선택** — 열 때 임시 상태에 선택값을 스냅샷하고, 취소/확인으로 커밋                   | Figma 배치(`105:193109`)가 캘린더 아래 취소·확인 버튼 footer를 고정 슬롯으로 둔다. 클릭 즉시 반영이 아니라 명시적 확정이 필요                                                               |
| 제어/비제어 겸용  | `value` prop 유무로 판정                                                                      | 다른 공통 컴포넌트와 동일하게 호출부가 상태를 가질지 맡길지 선택 가능                                                                                                                       |
| 팝오버 엔진       | Base UI `Popover` (`@base-ui/react/popover`)                                                  | Modal이 이미 Base UI `Dialog`로 통일했다. 포커스·오픈 상태를 같은 프리미티브 패밀리로 맞춘다                                                                                                |
| 날짜 계산/포맷    | `date-fns` + `date-fns/locale/ko`                                                             | 트리거 `yyyy.MM.dd`, 캡션 `yyyy년 M월` 포맷이 필요                                                                                                                                          |
| 셀 골격           | `react-day-picker`의 `DayButton` 슬롯을 커스텀 셀로 교체                                      | `shadcn add calendar` 구조를 참고하되, 생성물은 남기지 않고 처음부터 커스터마이징된 상태로 둔다                                                                                             |
| 셀 타입 판정      | `react-day-picker`의 `modifiers`를 4가지 타입(`default`/`active`/`selected`/`today`)으로 분류 | `_Calendar cell`의 `Type` 축과 1:1 대응                                                                                                                                                     |
| 취소·확인 버튼    | 공통 `Button` 컴포넌트 사용 (직접 `<button>` 마크업 작성 안 함)                               | Figma footer의 두 버튼도 다른 화면과 같은 버튼 톤을 유지해야 한다. `Button`은 `dev`에 구현돼 있으나 Figma footer와 크기·색이 달라 `className` 덮어쓰기가 필요하다 (아래 "확인 필요" 1 참고) |
| 선택 해제         | **불가** — DayPicker `required`                                                               | 이미 선택된 날짜를 다시 누르면 해제되는 DayPicker 기본 동작을 막는다. 실수 클릭으로 선택이 풀리는 경우가 더 흔하고, 기존 `Calendar`도 `required`를 쓴다                                     |
| 시간대            | "오늘"·날짜 계산을 `Asia/Seoul`(`CALENDAR_TIME_ZONE`) 기준으로 고정                           | 기존 `Calendar`와 같은 기준. 해외 접속 등 브라우저 시간대가 달라도 서비스 기준 날짜가 유지된다                                                                                              |
| 이전·다음 달 날짜 | 표시(`showOutsideDays`)하고 **선택 가능** — 잠정                                              | Figma는 이 칸을 Disabled 스타일로 그렸지만 선택 가능하게 둔다. 팀 의견을 더 받을 수 있어 잠정 결정으로 둔다 (아래 "확인 필요" 3 참고)                                                       |
| 팝오버 z-index    | 신규 토큰 `--z-popover: 2000` (`theme.css`)                                                   | 모달(`--z-modal-base` 1000 + 중첩 단계 × 10) 안에서 열어도 모달 위에 뜨도록 한다                                                                                                            |
| 모바일 표시 방식  | `max-tablet`(744px 미만)에서는 팝오버 대신 **바텀시트**로 연다                                | 팝오버(약 444px)가 모바일 폼 안에서 트리거 위·아래 어디에도 들어가지 않아 375×667에서 확정 버튼이 화면 밖으로 나간다. 아래 "모바일 바텀시트" 참고                                           |

## 레이어 구조

shadcn 생성물을 별도 파일로 남기지 않기로 팀 논의로 결정했다. `react-day-picker`·Base UI `Popover`를 감싸는 코드도 전부 커스터마이징된 상태로 `DatePicker` 폴더 안에 바로 둔다.

```
src/components/_common/DatePicker/
├── DatePicker.tsx          공개 컴포넌트 — 트리거 + 팝오버/바텀시트 조립
├── DatePickerPanel.tsx     캘린더 + 취소·확인 footer (팝오버·바텀시트 공용 본문)
├── DatePickerCalendar.tsx  캘린더 (react-day-picker 커스터마이징)
├── DatePickerCell.tsx      셀 (DayButton 대체)
├── DatePickerPopover.tsx   팝오버 (Base UI Popover 커스터마이징)
└── DatePickerSheet.tsx     바텀시트 (Base UI Dialog 커스터마이징)

src/hooks/datePicker/
└── useDatePickerLayout.ts  화면 폭으로 'popover' | 'sheet' 판정
```

내부 파일 분리·폴더 구조는 구현 단계에서 조정될 수 있다. [naming.md](../../convention/naming.md)에 따라 파일명은 `PascalCase`를 쓰고, [code-style.md](../../convention/code-style.md)에 따라 배럴 `index.ts` 없이 named export만 노출한다.

## API

```tsx
export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: DatePickerPopoverContentProps['align'];
}
```

```tsx
const [date, setDate] = useState<Date | undefined>();

<DatePicker value={date} onChange={setDate} placeholder="날짜 선택" />;
```

| prop           | 기본값        | 설명                                                                                |
| -------------- | ------------- | ----------------------------------------------------------------------------------- |
| `value`        | —             | prop이 있으면(`value={undefined}` 포함) 제어 컴포넌트로 동작                        |
| `defaultValue` | —             | 비제어 모드의 초기값                                                                |
| `onChange`     | —             | 확인 버튼을 눌러 선택이 커밋될 때 호출. 선택 해제가 불가하므로 항상 `Date`를 받는다 |
| `placeholder`  | `"날짜 선택"` | 선택값이 없을 때 트리거에 표시할 문구                                               |
| `disabled`     | —             | 트리거 비활성화                                                                     |
| `align`        | `"start"`     | `DatePickerPopoverContent`의 정렬 방향 그대로 전달                                  |
| `className`    | —             | 트리거 루트에 병합                                                                  |

트리거 값은 `Asia/Seoul` 기준 `yyyy.MM.dd`로 표시한다(`formatCalendarDate` 재사용). 트리거는 Figma에 없어서 [Input](../input/README.md)의 `large` 톤(`h-14`, `rounded-[16px]`, `border-slate-300`, `px-4`, `text-base`)에 맞췄다.

선택 로직(`pending`/`selected`/열림 상태)은 `DatePicker` 내부 `useState` 몇 개로 충분하다. Pagination의 `usePaginationRange`처럼 별도 `hooks/`로 분리할 만큼의 순수 계산이 없기 때문이다.

## 셀 타입 매핑

| Figma `Type`   | 판정에 쓸 `modifiers`             | 배경                 |
| -------------- | --------------------------------- | -------------------- |
| `Default`      | 아래 두 조건에 모두 해당하지 않음 | 없음                 |
| `Today's date` | `modifiers.today`                 | 옅은 회색 배경       |
| `Selected`     | `modifiers.selected`              | `primary` 배경       |
| `Active`       | — (구현하지 않음)                 | range 선택 전용 타입 |

우선순위는 `selected → today → default` 순서로 하나만 반환하도록 판정 함수를 둔다. `Active` 타입과 `range_start`/`range_middle`/`range_end` 커넥터 처리는 단일 날짜 선택만 지원하기로 했으므로 만들지 않는다 (위 "설계 결정 요약"의 선택 모드 참고).

Figma의 `State`(`Default`/`Hover`/`Disabled`) 3종은 별도 variant가 아니라 Tailwind 상태 변형자(`hover:`/`disabled:`)로 구현한다. 키보드 접근성을 위한 `focus-visible` 상태는 Figma variant 축에는 없지만 추가로 둔다.

## 디자인 토큰 매핑

### 기존 토큰으로 표현 가능

| Figma 값                                   | 적용 유틸리티                                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 선택 배경 `#FFD98A`                        | `bg-primary` (`--color-primary-500`, 완전히 같은 값)                                                                                                         |
| 확인 버튼 배경/hover `#FFD98A` / `#EBDDB9` | `bg-primary` / `hover:bg-secondary-600`                                                                                                                      |
| 취소 버튼 보더 `#CCCCCC`                   | `Button` tertiary의 `border-[#cccccc]`와 일치 — 그대로 사용                                                                                                  |
| 셀 40×40px                                 | `size-10`                                                                                                                                                    |
| 팝오버 328px                               | `w-82` (82 × `--spacing`)                                                                                                                                    |
| 오늘 셀 배경 `#FAFAFA`                     | 정확히 같은 토큰은 없음. Pagination 전례(`bg-slate-50`, `#F4F3F3`)를 따르지 않고 아래 "대응 토큰 없는 값"으로 분류해 임의값 `bg-[#fafafa]`를 쓰기로 확정했다 |

### 대응 토큰 없는 값

아래는 기존 전역 토큰과 일치하지 않는 값이다. 재사용 근거가 없으므로 전역 토큰으로 올리지 않고, Pagination의 `rounded-[1rem]`([pagination](../pagination/README.md#radius-16px) — "전역 스케일을 건드리지 않기로 했으므로 임의값을 쓴다")과 같은 방식으로 Tailwind 임의값(`text-[#hex]`, `shadow-[...]`)을 그대로 사용한다.

| 값                                                           | 위치                                   |
| ------------------------------------------------------------ | -------------------------------------- |
| `#FAFAFA`                                                    | 오늘 셀 배경, 기본 셀 hover 배경       |
| `#F5F5F5`                                                    | 오늘 셀 hover 배경                     |
| `#A4A4A4`                                                    | 비활성 셀 글자, 이전·다음 달 날짜 글자 |
| `#333333`                                                    | 셀 기본/요일 글자                      |
| `#414651`                                                    | 캡션(월 표기) 글자                     |
| 3레이어 그림자 (`0px 20px 24px -4px rgba(10,13,18,0.08)` 등) | 팝오버 패널                            |

다른 컴포넌트에서도 같은 값이 필요해지면 그때 토큰화를 재검토한다.

> **확정 — 취소 버튼 글자색**: Figma의 `#737373`은 [pagination](../pagination/README.md#디자인-토큰-매핑)과 같은 값 기준으로 `text-muted-foreground`(`#6B6A68`)에 매핑한다. [modal](../modal/README.md)의 이름 기준 방침(`--color-slate-500`, `#1C1917`)은 거의 검정이라 Figma 톤과 멀어 따르지 않았다.

## 상호작용 상태

Figma가 `Hover`/`Disabled`를 명시적으로 정의하고 있으므로(Pagination과 달리 추측이 아니다) 셀의 상태값은 그대로 옮긴다. 트리거는 Figma variant에 없으므로 아래를 구현 기본값으로 삼는다.

| 대상      | 상태          | 처리                                                                                                            |
| --------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| 트리거    | 열림          | 보더 색을 `ring` 계열로 강조                                                                                    |
| 트리거    | 비활성        | `disabled:pointer-events-none disabled:opacity-50`                                                              |
| 트리거    | focus-visible | `focus-visible:ring` 계열 — [accessibility.md](../../convention/accessibility.md)의 "focus 상태 제거 금지" 준수 |
| 확인 버튼 | 비활성        | 선택값이 없으면 비활성화 — 선택 해제가 불가하므로 초기값 없이 열었을 때만 해당                                  |

## 모바일 바텀시트

Figma `337:128306`은 캘린더 본문과 footer를 팝오버와 **같은 값**으로 두고, 겉 컨테이너만 바꿨다. 그래서 본문은 그대로 두고 컨테이너만 화면 폭에 따라 바꾼다.

### 팝오버와 다른 점

| 항목       | 팝오버 (`105:193109`)    | 바텀시트 (`337:128306`)                                                   |
| ---------- | ------------------------ | ------------------------------------------------------------------------- |
| 위치       | 트리거 기준 `align` 정렬 | 화면 하단 고정 (`fixed inset-x-0 bottom-0`)                               |
| 폭         | `w-82` (328px)           | 화면 전체 폭 (`w-full`)                                                   |
| 라운드     | 네 모서리 16px           | 위쪽 두 모서리만 16px (`rounded-t-[1rem]`)                                |
| 캘린더     | 280px                    | 280px 그대로, 가로 가운데 정렬                                            |
| 배경       | 없음                     | 딤 배경 `bg-overlay` — 잠정 (아래 "확인 필요" 4 참고)                     |
| 애니메이션 | fade + zoom              | 아래에서 위로 slide — Modal `sheetOnMobile`과 같은 `slide-in-from-bottom` |

보더(`rgb(0_0_0/0.08)`)·3레이어 그림자·본문 여백(`px-6 py-5`)·footer(`px-4 pb-4`, 버튼 `flex-1`)는 팝오버와 같다.

### 설계 결정

| 결정          | 선택                                                                          | 근거                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 바텀시트 엔진 | Base UI `Dialog` (`@base-ui/react/dialog`)                                    | 하단 고정 패널은 트리거 위치와 무관하고, 딤 배경·포커스 가두기·스크롤 잠금이 필요하다. Modal이 이미 `Dialog`로 같은 형태(`sheetOnMobile`)를 구현했다 |
| 전환 기준     | `(width < 46.5rem)` — `max-tablet`과 같은 744px                               | Modal `sheetOnMobile`이 `max-tablet:`에서 바텀시트가 되므로 같은 경계를 써야 모달 안에서 열었을 때 두 컴포넌트 형태가 어긋나지 않는다                |
| 전환 방법     | `useDatePickerLayout` 훅이 `matchMedia`로 판정 → `DatePicker`가 컨테이너 선택 | 팝오버와 다이얼로그는 프리미티브 자체가 달라 CSS 변형자만으로 바꿀 수 없다. `usePaginationSize`와 같은 `useSyncExternalStore` 패턴을 따른다          |
| SSR 기본값    | `'popover'`                                                                   | 첫 렌더는 항상 닫힌 상태라 트리거만 그려진다. 트리거 마크업은 두 경우가 같아 hydration 불일치가 없다                                                 |
| 본문 공유     | 캘린더 + footer를 `DatePickerPanel`로 분리해 두 컨테이너가 같이 쓴다          | Figma상 본문이 완전히 같다. 버퍼링 선택 상태(`pendingDate`)·취소/확인 로직은 `DatePicker`에 그대로 두고 `DatePickerPanel`은 props만 받는다           |
| z-index       | 딤 배경·패널 모두 기존 `--z-popover`(2000)                                    | 바텀시트 폼 모달(`--z-modal-base` + 단계) 안에서 열어도 그 위에 떠야 한다. 새 토큰을 만들 이유가 없다                                                |
| 닫기 방법     | 취소 버튼, 딤 배경 클릭, ESC                                                  | 팝오버와 같다. 셋 다 선택을 커밋하지 않는다                                                                                                          |
| 드래그 제스처 | **만들지 않음** — 드래그로 닫기·스냅 포인트 없음                              | Figma에 정의가 없고, Modal 바텀시트도 같은 이유로 보류 중이다 ([modal 확인 필요 2](../modal/README.md#2-바텀시트-상호작용-범위))                     |
| 호출부 API    | **변경 없음** — 새 prop 없음                                                  | 화면 폭에 따라 자동 전환한다. 호출부가 강제로 고를 필요가 생기면 그때 `layout` prop을 검토한다. `align`은 팝오버일 때만 쓰인다                       |
| 시트 스타일   | 하단 고정·라운드·`max-h-[85dvh]`·slide 애니메이션                             | Modal `sheetOnMobile`과 같은 값                                                                                                                      |

### 중첩 동작

Modal `sheetOnMobile` 안에서 DatePicker를 열면 바텀시트 위에 바텀시트가 뜬다.

- DatePicker 시트는 Modal 시트보다 위(`--z-popover`)에 뜬다.
- 딤 배경 클릭·ESC는 DatePicker 시트만 닫는다 — Base UI `Dialog`가 중첩 다이얼로그를 맨 위부터 닫는다.
- 닫히면 포커스가 DatePicker 트리거로 돌아간다.

위 세 가지는 [스케줄 폼 모달](../../feature/partTime/schedule.md) 병합 후 375×667에서 실측해 이 절에 결과를 기록한다.

## 접근성

- Base UI `Popover`가 오픈/클릭 아웃사이드/ESC를 담당한다 (Modal의 `Dialog`와 같은 패밀리).
- 캘린더 셀의 접근 가능한 이름은 `react-day-picker` 기본 포맷터로 충분하다 — `react-day-picker/locale`의 `ko`를 넘겨 셀은 "2025년 1월 10일 금요일, 선택됨", 월 이동 버튼은 "이전 달로 이동"처럼 한국어로 읽힌다. 캡션은 `aria-live`로 월 변경을 알린다.
- `disabled` 셀은 `disabled` 속성으로 스크린리더·키보드 모두에서 제외한다.
- 트리거에 `outline-none`을 쓸 경우 반드시 `focus-visible:ring` 등 대체 스타일을 함께 넣는다 — [accessibility.md](../../convention/accessibility.md)의 "focus 상태 제거 금지".
- 팝오버 진입/퇴장 애니메이션에는 `motion-reduce:` 대응을 넣는다 (Modal 문서의 동일 체크리스트 항목).
- 바텀시트는 Figma에 제목이 없으므로 `Dialog.Popup`에 `aria-label="날짜 선택"`을 둬 다이얼로그 이름을 준다. 포커스 가두기·배경 스크롤 잠금은 Base UI `Dialog`가 담당한다.
- 바텀시트 slide 애니메이션에도 `motion-reduce:animate-none`을 넣는다.

## 렌더링 경계

`"use client"`는 트리거가 실제로 필요한 말단 파일에만 둔다([rendering.md](../../architecture/rendering.md)).

| 파일                     | `"use client"` | 트리거                     |
| ------------------------ | -------------- | -------------------------- |
| `DatePicker.tsx`         | ○              | 1 (`useState`), 3 (이벤트) |
| `DatePickerCalendar.tsx` | ○              | 3 (DayPicker 콜백)         |
| `DatePickerCell.tsx`     | ○              | 3 (`onClick` 등)           |
| `DatePickerPopover.tsx`  | ○              | 3 (`onOpenChange`)         |
| `DatePickerPanel.tsx`    | ○              | 3 (취소·확인 `onClick`)    |
| `DatePickerSheet.tsx`    | ○              | 3 (`onOpenChange`)         |
| `useDatePickerLayout.ts` | ○              | 2 (`matchMedia`)           |

Server Component가 `<DatePicker>`를 렌더해도 부모는 클라이언트가 되지 않는다 (Modal 문서의 동일 규칙).

## 테스트 전략

[test.md](../../convention/test.md) 기준으로 `test/`가 `src/` 구조를 미러링한다.

```
test/components/_common/DatePicker/datePicker.test.tsx
```

| 대상           | 검증                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| 열기/취소/확인 | 취소 시 선택값 유지 + `onChange` 미호출, 확인 시 임시 선택값이 `onChange`로 커밋 |
| 제어/비제어    | `value` 전달 시 내부 상태 무시, 미전달 시 `defaultValue`로 초기화                |
| 셀 타입        | 오늘/선택/기본 셀에 각각 올바른 스타일 적용                                      |
| 비활성         | `disabled` prop 시 트리거 클릭 무반응                                            |
| 접근성         | 트리거 focus-visible 스타일 존재, `disabled` 셀이 접근성 트리에서 제외           |
| 레이아웃 전환  | `matchMedia` 모킹으로 744px 미만이면 `dialog`, 이상이면 팝오버로 열림            |
| 바텀시트 닫기  | 딤 배경 클릭·ESC 시 `onChange` 미호출, 선택값 유지                               |

## 단계별 PR 계획

GitHub [stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)로 진행한다. 각 브랜치는 바로 아래 브랜치를 base로 하고, 맨 아래만 `dev`를 향한다.

| 순서 | 브랜치                            | base                              | 내용                                                                                                               |
| ---- | --------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1    | `design/common-datepicker`        | `dev`                             | **이 설계 문서** + `docs/README.md` · `docs/component/README.md` 인덱스 갱신                                       |
| 2    | `feat/common-datepicker-ui`       | `design/common-datepicker`        | `shadcn add calendar popover` 구조를 참고해 `DatePickerCalendar`·`DatePickerPopover`·`DatePickerCell` 커스터마이징 |
| 3    | `feat/common-datepicker-assemble` | `feat/common-datepicker-ui`       | `DatePicker` 조립 (버퍼링 선택, 접근성, `Button` 기반 취소·확인 footer)                                            |
| 4    | `feat/common-datepicker-test`     | `feat/common-datepicker-assemble` | Vitest 테스트                                                                                                      |

모바일 바텀시트는 위 스택이 병합된 뒤 `dev`에서 딴 단일 PR(`feat/common-datepicker-bottom-sheet`)로 진행한다. 커밋은 다음 순서로 나눈다.

| 순서 | 타입       | 내용                                                                                 |
| ---- | ---------- | ------------------------------------------------------------------------------------ |
| 1    | `docs`     | 이 문서의 "모바일 바텀시트" 절                                                       |
| 2    | `refactor` | 캘린더 + footer를 `DatePickerPanel`로 분리 — 화면 동작 변화 없음                     |
| 3    | `feat`     | `DatePickerSheet` + `useDatePickerLayout` 추가, `DatePicker`에서 화면 폭에 따라 전환 |

## 확인 필요

아래 항목은 임의로 확정하지 않는다. 확인 후 이 문서에 반영한다.

### 1. `Button` 컴포넌트 의존 — 확정: `className` 덮어쓰기

`Button`이 [button](../button/README.md) 설계대로 구현돼 `dev`에 머지됐으므로 "Button 설계 PR 선행" 조건은 해소됐다. 다만 Figma footer 버튼과 `Button`의 variant 값이 그대로 맞지 않는다.

| 항목        | Figma footer (`105:193109`)              | `Button` `size="small"`            |
| ----------- | ---------------------------------------- | ---------------------------------- |
| 높이        | 40px (`py-[10px]` + `leading-5`)         | 44px (`h-11`)                      |
| 너비        | 두 버튼이 남은 폭을 나눠 가짐 (`flex-1`) | 134px 고정 (`w-[8.375rem]`)        |
| 취소 글자색 | `#737373`                                | tertiary `text-secondary-300`      |
| 취소 보더   | `#CCCCCC`                                | tertiary `border-[#cccccc]` (일치) |
| 확인 배경   | `primary/500`, hover `secondary/600`     | primary 동일 (일치)                |

[PaginationButton](../../../src/components/_common/Pagination/PaginationButton.tsx) 전례대로 공통 `Button`은 건드리지 않고, `DatePicker`에서 `size="small"` 위에 `className`으로 `h-10 w-auto min-w-0 flex-1`을 덮어쓴다. 취소 버튼은 여기에 `text-muted-foreground`를 더한다(아래 2번).

### 2. 회색 텍스트 컬러 정책 — 확정: `text-muted-foreground`

취소 버튼 글자(`#737373`)는 Pagination과 같은 값 기준으로 `text-muted-foreground`(`#6B6A68`)를 쓴다. 위 "디자인 토큰 매핑" 참고.

### 3. 이전·다음 달 날짜 선택 허용 — 잠정

Figma(`71:70370`)는 이전·다음 달 날짜를 `_Calendar cell`의 `Disabled` 스타일로 그렸다. 현재 구현은 글자색만 `#A4A4A4`로 맞추고 선택은 가능하게 두었다(hover 배경도 적용된다). 선택을 막고 Figma대로 `Disabled`로 처리할지는 팀 의견을 더 받아 확정한다.

### 4. 바텀시트 딤 배경 — 잠정: `bg-overlay`

Figma `337:128306`은 패널만 그렸고 뒤 배경이 없다. Modal 바텀시트와 같은 `bg-overlay`를 잠정 적용한다. 바텀시트 폼 모달 안에서 열면 Modal 딤 위에 한 번 더 어두워진다. 모달 안에서도 딤을 유지할지, 투명하게 둘지 확인이 필요하다.

### 5. 하단 안전 영역 — 확인 필요

iOS 홈 인디케이터가 있는 기기에서는 footer 버튼이 인디케이터와 겹칠 수 있다. Figma와 Modal 바텀시트 모두 안전 영역을 반영하지 않아 현재는 반영하지 않았다. footer 아래 여백을 `pb-[max(1rem,env(safe-area-inset-bottom))]`로 늘릴지 확인이 필요하다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 파일/폴더 네이밍: [convention/naming.md](../../convention/naming.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 기준: [convention/accessibility.md](../../convention/accessibility.md)
- 같은 문제를 먼저 다룬 문서: [component/modal/README.md](../modal/README.md), [component/pagination/README.md](../pagination/README.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
