# DatePicker 컴포넌트 설계

날짜 하나를 선택하는 입력 UI를 하나의 공통 컴포넌트로 통일하기 위한 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 단계별 PR로 진행한다.

## 개요

Figma 원본: [Figma — BizSched](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched)

| 이름                        | 설명                                                         | 노드 ID      |
| --------------------------- | ------------------------------------------------------------ | ------------ |
| `_Calendar cell`            | 셀 컴포넌트셋 — `Type`(4) × `State`(3) = 12 variant          | `71:70371`   |
| Date picker (배치)          | 캘린더 + 취소·확인 footer가 팝오버 안에 들어간 인스턴스 배치 | `105:193109` |
| Date picker (메인 컴포넌트) | 위 배치가 참조하는 인스턴스 원본                             | `71:70370`   |

`_Calendar cell`의 variant 축은 다음과 같다.

| `Type`         | `State`                          |
| -------------- | -------------------------------- |
| `Default`      | `Default` / `Hover` / `Disabled` |
| `Today's date` | `Default` / `Hover` / `Disabled` |
| `Selected`     | `Default` / `Hover` / `Disabled` |
| `Active`       | `Default` / `Hover` / `Disabled` |

셀은 40×40px, 팝오버 패널 폭은 328px다.

## 설계 결정 요약

| 결정             | 선택                                                                                          | 근거                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 확정 방식        | **버퍼링 선택** — 열 때 임시 상태에 선택값을 스냅샷하고, 취소/확인으로 커밋                   | Figma 배치(`105:193109`)가 캘린더 아래 취소·확인 버튼 footer를 고정 슬롯으로 둔다. 클릭 즉시 반영이 아니라 명시적 확정이 필요      |
| 제어/비제어 겸용 | `value` prop 유무로 판정                                                                      | 다른 공통 컴포넌트와 동일하게 호출부가 상태를 가질지 맡길지 선택 가능                                                              |
| 팝오버 엔진      | Base UI `Popover` (`@base-ui/react/popover`)                                                  | Modal이 이미 Base UI `Dialog`로 통일했다. 포커스·오픈 상태를 같은 프리미티브 패밀리로 맞춘다                                       |
| 날짜 계산/포맷   | `date-fns` + `date-fns/locale/ko`                                                             | 트리거 `yyyy.MM.dd`, 캡션 `yyyy년 M월` 포맷이 필요                                                                                 |
| 셀 골격          | `react-day-picker`의 `DayButton` 슬롯을 커스텀 셀로 교체                                      | `shadcn add calendar` 구조를 참고하되, 생성물은 남기지 않고 처음부터 커스터마이징된 상태로 둔다                                    |
| 셀 타입 판정     | `react-day-picker`의 `modifiers`를 4가지 타입(`default`/`active`/`selected`/`today`)으로 분류 | `_Calendar cell`의 `Type` 축과 1:1 대응                                                                                            |
| 취소·확인 버튼   | 공통 `Button` 컴포넌트 사용 (직접 `<button>` 마크업 작성 안 함)                               | Figma footer의 두 버튼도 다른 화면과 같은 버튼 톤을 유지해야 한다. `Button`이 아직 설계되지 않아 선행 필요 (아래 "확인 필요" 참고) |

## 레이어 구조

shadcn 생성물을 별도 파일로 남기지 않기로 팀 논의로 결정했다. `react-day-picker`·Base UI `Popover`를 감싸는 코드도 전부 커스터마이징된 상태로 `DatePicker` 폴더 안에 바로 둔다.

```
src/components/_common/DatePicker/
├── DatePicker.tsx          공개 컴포넌트 — 트리거 + 팝오버 조립
├── DatePickerCalendar.tsx  캘린더 (react-day-picker 커스터마이징)
├── DatePickerCell.tsx      셀 (DayButton 대체)
└── DatePickerPopover.tsx   팝오버 (Base UI Popover 커스터마이징)
```

내부 파일 분리·폴더 구조는 구현 단계에서 조정될 수 있다. [naming.md](../../convention/naming.md)에 따라 파일명은 `PascalCase`를 쓰고, [code-style.md](../../convention/code-style.md)에 따라 배럴 `index.ts` 없이 named export만 노출한다.

## API

```tsx
export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: React.ComponentProps<typeof PopoverContent>['align'];
}
```

```tsx
const [date, setDate] = useState<Date | undefined>();

<DatePicker value={date} onChange={setDate} placeholder="날짜 선택" />;
```

| prop           | 기본값        | 설명                                     |
| -------------- | ------------- | ---------------------------------------- |
| `value`        | —             | 지정하면 제어 컴포넌트로 동작            |
| `defaultValue` | —             | 비제어 모드의 초기값                     |
| `onChange`     | —             | 확인 버튼을 눌러 선택이 커밋될 때 호출   |
| `placeholder`  | `"날짜 선택"` | 선택값이 없을 때 트리거에 표시할 문구    |
| `disabled`     | —             | 트리거 비활성화                          |
| `align`        | `"start"`     | `PopoverContent`의 정렬 방향 그대로 전달 |
| `className`    | —             | 트리거 루트에 병합                       |

선택 로직(`pending`/`selected`/열림 상태)은 `DatePicker` 내부 `useState` 몇 개로 충분하다. Pagination의 `usePaginationRange`처럼 별도 `hooks/`로 분리할 만큼의 순수 계산이 없기 때문이다.

## 셀 타입 매핑

| Figma `Type`   | 판정에 쓸 `modifiers`             | 배경                                   |
| -------------- | --------------------------------- | -------------------------------------- |
| `Default`      | 아래 세 조건에 모두 해당하지 않음 | 없음                                   |
| `Today's date` | `modifiers.today`                 | 옅은 회색 배경 (`Active`와 동일)       |
| `Active`       | `modifiers.range_middle`          | 옅은 회색 배경 (`Today's date`와 동일) |
| `Selected`     | `modifiers.selected`              | `primary` 배경                         |

우선순위는 `range_middle → selected → today → default` 순서로 하나만 반환하도록 판정 함수를 둔다. `range_start`/`range_end`는 별도 타입이 아니라, 인접 셀 배경을 이어 붙이는 커넥터 처리에만 쓴다 (range 선택 지원 여부는 아래 "확인 필요" 참고).

Figma의 `State`(`Default`/`Hover`/`Disabled`) 3종은 별도 variant가 아니라 Tailwind 상태 변형자(`hover:`/`disabled:`)로 구현한다. 키보드 접근성을 위한 `focus-visible` 상태는 Figma variant 축에는 없지만 추가로 둔다.

## 디자인 토큰 매핑

### 기존 토큰으로 표현 가능

| Figma 값                                   | 적용 유틸리티                                                                                                                                                           |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 선택 배경 `#FFD98A`                        | `bg-primary` (`--color-primary-500`, 완전히 같은 값)                                                                                                                    |
| 확인 버튼 배경/hover `#FFD98A` / `#EBDDB9` | `bg-primary` / `hover:bg-secondary-600`                                                                                                                                 |
| 취소 버튼 보더 `#CCCCCC`                   | `border-input`(`--input`, `#CCC9C0`)과 근접 — 완전 동일은 아님                                                                                                          |
| 셀 40×40px                                 | `size-10`                                                                                                                                                               |
| 팝오버 328px                               | `w-82` (82 × `--spacing`)                                                                                                                                               |
| 오늘/active 셀 배경 `#FAFAFA`              | 정확히 같은 토큰은 없음. [pagination](../pagination/README.md)이 같은 Figma 값을 값 기준으로 `bg-slate-50`(`#F4F3F3`)에 매핑한 전례가 있다 — 이 전례를 따를지 확인 필요 |

### 대응 토큰 없는 값

아래는 기존 전역 토큰과 일치하지 않는 값이다. 재사용 근거가 없으므로 전역 토큰으로 올리지 않고, Pagination의 `rounded-[1rem]`([pagination](../pagination/README.md#radius-16px) — "전역 스케일을 건드리지 않기로 했으므로 임의값을 쓴다")과 같은 방식으로 Tailwind 임의값(`text-[#hex]`, `shadow-[...]`)을 그대로 사용한다.

| 값                                                           | 위치               |
| ------------------------------------------------------------ | ------------------ |
| `#A4A4A4`                                                    | 비활성 셀 글자     |
| `#333333`                                                    | 셀 기본/요일 글자  |
| `#414651`                                                    | 캡션(월 표기) 글자 |
| 3레이어 그림자 (`0px 20px 24px -4px rgba(10,13,18,0.08)` 등) | 팝오버 패널        |

다른 컴포넌트에서도 같은 값이 필요해지면 그때 토큰화를 재검토한다.

> **확인 필요 — 취소 버튼 글자색**: Figma의 `#737373`을 어떤 규칙으로 매핑할지 두 전례가 갈린다. [pagination](../pagination/README.md#디자인-토큰-매핑)은 값 기준으로 `text-muted-foreground`(`#6B6A68`)를 쓰기로 했고, [modal](../modal/README.md)의 "컬러는 CSS 토큰 기준" 방침은 이름 기준으로 `--color-slate-500`(`#1C1917`, 거의 검정)을 그대로 쓰기로 했다. DatePicker는 어느 쪽을 따를지 확인이 필요하다.

## 상호작용 상태

Figma가 `Hover`/`Disabled`를 명시적으로 정의하고 있으므로(Pagination과 달리 추측이 아니다) 셀의 상태값은 그대로 옮긴다. 트리거는 Figma variant에 없으므로 아래를 구현 기본값으로 삼는다.

| 대상      | 상태          | 처리                                                                                                            |
| --------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| 트리거    | 열림          | 보더 색을 `ring` 계열로 강조                                                                                    |
| 트리거    | 비활성        | `disabled:pointer-events-none disabled:opacity-50`                                                              |
| 트리거    | focus-visible | `focus-visible:ring` 계열 — [accessibility.md](../../convention/accessibility.md)의 "focus 상태 제거 금지" 준수 |
| 확인 버튼 | 비활성        | 선택값이 없으면 비활성화                                                                                        |

## 접근성

- Base UI `Popover`가 오픈/클릭 아웃사이드/ESC를 담당한다 (Modal의 `Dialog`와 같은 패밀리).
- 캘린더 셀의 접근 가능한 이름은 `react-day-picker` 기본 포맷터로 충분한지 구현 시 확인한다.
- `disabled` 셀은 `disabled` 속성으로 스크린리더·키보드 모두에서 제외한다.
- 트리거에 `outline-none`을 쓸 경우 반드시 `focus-visible:ring` 등 대체 스타일을 함께 넣는다 — [accessibility.md](../../convention/accessibility.md)의 "focus 상태 제거 금지".
- 팝오버 진입/퇴장 애니메이션에는 `motion-reduce:` 대응을 넣는다 (Modal 문서의 동일 체크리스트 항목).

## 렌더링 경계

`"use client"`는 트리거가 실제로 필요한 말단 파일에만 둔다([rendering.md](../../architecture/rendering.md)).

| 파일                     | `"use client"` | 트리거                     |
| ------------------------ | -------------- | -------------------------- |
| `DatePicker.tsx`         | ○              | 1 (`useState`), 3 (이벤트) |
| `DatePickerCalendar.tsx` | ○              | 3 (DayPicker 콜백)         |
| `DatePickerCell.tsx`     | ○              | 3 (`onClick` 등)           |
| `DatePickerPopover.tsx`  | ○              | 3 (`onOpenChange`)         |

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

## 단계별 PR 계획

GitHub [stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)로 진행한다. 각 브랜치는 바로 아래 브랜치를 base로 하고, 맨 아래만 `dev`를 향한다.

| 순서 | 브랜치                            | base                              | 내용                                                                                                               |
| ---- | --------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1    | `design/common-datepicker`        | `dev`                             | **이 설계 문서** + `docs/README.md` · `docs/component/README.md` 인덱스 갱신                                       |
| 2    | `feat/common-datepicker-ui`       | `design/common-datepicker`        | `shadcn add calendar popover` 구조를 참고해 `DatePickerCalendar`·`DatePickerPopover`·`DatePickerCell` 커스터마이징 |
| 3    | `feat/common-datepicker-assemble` | `feat/common-datepicker-ui`       | `DatePicker` 조립 (버퍼링 선택, 접근성) — `Button` 설계가 선행돼야 시작 가능                                       |
| 4    | `feat/common-datepicker-test`     | `feat/common-datepicker-assemble` | Vitest 테스트                                                                                                      |

## 확인 필요

아래 항목은 임의로 확정하지 않는다. 확인 후 이 문서에 반영한다.

### 1. `Button` 컴포넌트 의존

`Button`이 아직 저장소에 설계·구현되지 않았다. [modal](../modal/README.md#1-button-컴포넌트-의존)이 이미 같은 의존성을 "확인 필요"로 남겨뒀다 — Button 설계 PR이 DatePicker 조립 PR보다 먼저 필요하다.

### 2. 회색 텍스트 컬러 정책

취소 버튼 글자(`#737373`)에 대해 Modal(이름 기준 `--color-slate-500`)과 Pagination(값 기준 `text-muted-foreground`)의 전례가 갈린다. 위 "디자인 토큰 매핑" 참고.

### 3. range 선택 지원 범위

`_Calendar cell`에 `range_start`/`range_middle`/`range_end`에 대응하는 커넥터 스타일을 미리 만들어 둘지, 아니면 단일 날짜 선택만 지원하고 range는 별도 컴포넌트로 분리할지 확인 필요.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 파일/폴더 네이밍: [convention/naming.md](../../convention/naming.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 기준: [convention/accessibility.md](../../convention/accessibility.md)
- 같은 문제를 먼저 다룬 문서: [component/modal/README.md](../modal/README.md), [component/pagination/README.md](../pagination/README.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
