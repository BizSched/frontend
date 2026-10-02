# FormDropdown 컴포넌트 설계

## 개요

폼에서 옵션 하나를 고르는 **Form 드롭다운**이다. 현재 값을 보여 주는 채움형 트리거를 누르면 옵션 리스트 팝업이 열리고, 항목을 고르면 값이 바뀐다. [Dropdown 설계 문서](../dropdown/README.md)의 ④ "form dropdown"에 해당한다.

[MonthSelectDropdown](../month-select-dropdown/README.md)(③)과 같은 구조로, 트리거 컴포넌트를 새로 만들고 팝업은 기존 `Dropdown`을 재사용한다.

| 부품   | 컴포넌트                                                       | 비고                           |
| ------ | -------------------------------------------------------------- | ------------------------------ |
| 트리거 | `FormDropdownButton`                                           | 이 문서에서 설계(신규)         |
| 팝업   | `Dropdown`(`DropdownContent` + `DropdownItem`, Base UI `Menu`) | `medium` size·구분선 옵션 추가 |

Figma: [BizSched — form dropdown](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=271-55318&m=dev) (`271:55318`, 컴포넌트 셋 `FormDropdown`, 트리거 노드명 `nav_from`)

| 인스턴스                       | 노드         | 트리거     | 팝업                 | 리스트 셀                                |
| ------------------------------ | ------------ | ---------- | -------------------- | ---------------------------------------- |
| `size=large`, `state=default`  | `271:55317`  | 276 × 56px | —                    | —                                        |
| `size=large`, `state=spread`   | `271:55308`  | 276 × 56px | 276px, `radius 16px` | `DropdownItem` large + 항목별 `border-b` |
| `size=medium`, `state=default` | `291:104877` | 150 × 44px | —                    | —                                        |
| `size=medium`, `state=spread`  | `271:55329`  | 150 × 44px | 150px, `radius 12px` | `DropdownItem` small 셀 + 항목 높이 44px |
| `size=small`, `state=default`  | `291:104952` | 102 × 36px | —                    | —                                        |
| `size=small`, `state=spread`   | `291:104924` | 102 × 36px | 102px, `radius 12px` | `DropdownItem` small과 동일              |

공통: 트리거–팝업 간격 1px(`gap-px`), 팝업 너비 = 트리거 너비, 팝업 그림자 `drop-shadow 0px 6px 8px rgba(0,0,0,0.12)`, 배경 `white/50`(`#fffffe`). 팝업 높이는 고정이 아니라 항목 수만큼 늘어난다.

## 설계 결정 요약

| 결정          | 선택                                                                                                                                          | 근거                                                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 결합 방식     | **별도 컴포넌트 2개.** 트리거 `FormDropdownButton` + 조합 `FormDropdown`                                                                      | ③과 같은 구조(`MonthDropdownButton` + `MonthSelectDropdown`). 트리거를 분리해 두면 팝업 없이 트리거만 필요한 곳에서도 쓸 수 있다 — Dropdown 문서 "확인 필요" 1번 확정 |
| 선택 상태     | **controlled.** `value` + `onChange`를 호출부가 가진다                                                                                        | 폼 값은 폼 상태(RHF 등)가 소유해야 한다. [state-management.md](../../architecture/state-management.md)의 "상태는 쓰는 범위에" 원칙. ③과 동일                          |
| 옵션 형태     | `{ value: string; label: string }[]`                                                                                                          | 표시 문자열과 저장 값을 분리한다. 같은 라벨이 여러 개여도 `value`로 구분된다                                                                                          |
| `medium` size | 공통 `Dropdown`의 `size`에 `medium` 추가                                                                                                      | Dropdown 문서 개요의 "④ `size`에 `medium` 추가"와 일치. 셀은 small과 같고 항목 높이만 44px이라 variant 한 줄로 표현된다                                               |
| large 구분선  | `Dropdown`에 `hasDivider` 옵션 추가, `FormDropdown`이 `size === 'large'`일 때 기본으로 켠다. 구분선이 없는 화면은 `hasDivider={false}`로 끈다 | 구분선은 ④ large 전용 차이라 Dropdown 기본값으로 일반화하지 않는다(Dropdown 문서 "④ Form 드롭다운 트리거"). 마지막 항목은 제외 — "확정 사항" 3번                      |
| placeholder   | `placeholder` prop 추가. 값이 없으면 `#a4a4a4`로 표시                                                                                         | Figma에는 값이 선택된 상태만 있다. 폼 초기 상태(미선택)를 표현해야 해서 추가한 **임시 스타일**이며, Figma에 추가되면 그 값으로 교체한다 — "확정 사항" 4번             |
| 팝업 스타일   | `Dropdown`의 `className`으로 너비·radius·그림자만 덮어쓴다                                                                                    | ③과 같은 방식. 팝업 값만 ①과 달라 `DropdownContent`에 variant를 늘리지 않고 조합 쪽에서 덮어쓴다                                                                      |
| 그림자        | arbitrary value 유지 (트리거 `0px 2px 4px rgba(0,0,0,0.08)`, 팝업 `0px 6px 8px rgba(0,0,0,0.12)`)                                             | ①②③과 같은 방식. 토큰 신설 여부는 Dropdown 문서 "확인 필요" 2번에서 4종을 한 번에 검토한다                                                                            |
| 아이콘        | lucide `ChevronDownIcon`, 열림 시 180° 회전                                                                                                   | [MonthDropdownButton](../month-dropdown-button/README.md) 선례. 글리프가 Figma `ic_chevron-down`/`ic_chevron-up`과 1:1 대응해 에셋 커밋이 불필요하다                  |

## 레이어 구조

```
src/components/_common/FormDropdownButton/FormDropdownButton.tsx   트리거 버튼 (cva: size)
src/components/_common/FormDropdown/FormDropdown.tsx               조합 + 옵션 → items 변환 + 선택 상태 연결
src/components/_common/Dropdown/Dropdown.tsx                       size에 medium, hasDivider prop 추가
src/components/_common/Dropdown/DropdownContent.tsx                size medium 추가
src/components/_common/Dropdown/DropdownItem.tsx                   size medium, hasDivider variant 추가
src/components/_common/MonthSelectDropdown/MonthSelectDropdown.tsx size 타입을 large | small로 좁힘
```

`DropdownSize`에 `medium`이 추가되면서 `MonthSelectDropdown`의 `size`는 `Exclude<DropdownSize, 'medium'>`으로 좁혔다. 트리거 `MonthDropdownButton`에 medium이 없기 때문이다.

각 파일은 named export를 유지하고 배럴 `index.ts`는 두지 않는다([code-style.md](../../convention/code-style.md)).

## API

```tsx
import { FormDropdown } from '@components/_common/FormDropdown/FormDropdown';

const options = [
  { value: 'js', label: '자바스크립트로 웹서비스 만들기' },
  { value: 'ts', label: '타입스크립트 입문' },
];

const [course, setCourse] = useState<string>();

<FormDropdown value={course} onChange={setCourse} options={options} placeholder="강의 선택" />
<FormDropdown size="medium" value={course} onChange={setCourse} options={options} />
<FormDropdown size="small" value={course} onChange={setCourse} options={options} />
```

### FormDropdown

| prop               | 기본값             | 설명                                                                                                                                     |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `value`            | —                  | 현재 선택된 옵션의 `value`. 없으면 `placeholder` 표시                                                                                    |
| `options`          | —                  | `FormDropdownOption[]` (`{ value: string; label: string }`)                                                                              |
| `onChange`         | —                  | `(value: string) => void`. 항목 선택 시 호출                                                                                             |
| `placeholder`      | —                  | 선택값이 없을 때 트리거에 표시할 내용                                                                                                    |
| `size`             | `"large"`          | `"large"` \| `"medium"` \| `"small"`. 트리거·팝업·셀에 함께 적용                                                                         |
| `hasDivider`       | `size === "large"` | 항목 사이 구분선. large 기본값은 Figma `271:55308` 기준. 구분선이 없는 화면(예: 스케쥴 추가/수정 모달 `337:127914`)에서는 `false`로 끈다 |
| `disabled`         | —                  | 트리거 비활성화. 팝업이 열리지 않는다                                                                                                    |
| `className`        | —                  | 트리거(`FormDropdownButton`)에 병합. 너비 변경 등                                                                                        |
| `contentClassName` | —                  | 팝업(`Dropdown`)에 병합. 옵션이 많을 때 `max-h-*` + `overflow-y-auto` 등                                                                 |

내부 조합(요약):

```tsx
<Dropdown
  size={size}
  sideOffset={1}
  hasDivider={hasDivider}
  items={options.map((option) => ({
    label: option.label,
    isSelected: option.value === value,
    onSelect: () => onChange(option.value),
  }))}
  className={cn(formDropdownContentVariants({ size }), contentClassName)}
>
  <FormDropdownButton
    size={size}
    placeholder={placeholder}
    className={className}
  >
    {selectedOption?.label}
  </FormDropdownButton>
</Dropdown>
```

### FormDropdownButton

Base UI `Button`(`@base-ui/react/button`) 기반. `MonthDropdownButton`과 같이 props·ref를 그대로 전달하므로 `Menu.Trigger`의 `render` 위임 대상으로 쓸 수 있다.

| prop          | 기본값    | 설명                                                      |
| ------------- | --------- | --------------------------------------------------------- |
| `children`    | —         | 표시할 현재 값. `undefined`/`null`이면 `placeholder` 표시 |
| `placeholder` | —         | 값이 없을 때 표시할 내용                                  |
| `size`        | `"large"` | `"large"` \| `"medium"` \| `"small"`                      |
| 그 외         | —         | Base UI `Button` props                                    |

### `Dropdown` 변경

| 대상                | 추가          | 설명                                                                |
| ------------------- | ------------- | ------------------------------------------------------------------- |
| `DropdownSize`      | `'medium'`    | `DropdownContent`·`DropdownItem`에 medium variant 추가              |
| `Dropdown` prop     | `hasDivider?` | 항목 사이 구분선 표시. `DropdownItem`의 `hasDivider`로 전달         |
| `DropdownItem` prop | `hasDivider?` | `border-b border-slate-100`, 마지막 항목은 `last:border-b-0`로 제외 |

모두 선택 prop이라 기존 호출부에 영향이 없다.

## variant (cva)

### FormDropdownButton (트리거)

| 축     | 값       | 매핑                                                                                                 |
| ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `size` | `large`  | `w-[276px] rounded-[20px] py-3.5` 텍스트 `text-lg font-semibold tracking-[-0.03em]`, 아이콘 `size-6` |
|        | `medium` | `h-11 w-37.5 rounded-[14px]` 텍스트 `text-sm font-medium`, 아이콘 `size-5`                           |
|        | `small`  | `h-9 w-25.5 rounded-[14px]` 텍스트 `text-sm font-medium`, 아이콘 `size-5`                            |

공통: `bg-white-50 px-4 justify-between gap-2`, 텍스트 `#333333`, 아이콘 `#a4a4a4`.

| 상태            | 매핑                                                                            |
| --------------- | ------------------------------------------------------------------------------- |
| `default`(닫힘) | 그림자 없음, 화살표 아래                                                        |
| `spread`(열림)  | `data-[popup-open]:shadow-[0px_2px_4px_rgba(0,0,0,0.08)]`, 화살표 180° 회전(위) |
| placeholder     | `data-placeholder:text-[#a4a4a4]`                                               |
| focus-visible   | `ring-3 ring-ring/50` (Figma에 없음 — `MonthDropdownButton`과 동일한 기본값)    |

열림 상태는 prop 없이 `Menu.Trigger`가 붙여 주는 `data-popup-open`으로 처리한다(MonthDropdownButton과 동일). 라벨은 `truncate`로 트리거 너비를 넘으면 말줄임한다.

### FormDropdown (팝업 덮어쓰기)

| 축     | 값                 | 매핑             |
| ------ | ------------------ | ---------------- |
| `size` | `large`            | `rounded-[16px]` |
|        | `medium` / `small` | `rounded-[12px]` |

공통 base: `w-(--anchor-width) drop-shadow-[0px_6px_8px_rgba(0,0,0,0.12)]`.

- 너비는 Base UI `Menu.Positioner`의 `--anchor-width`(트리거 너비)를 쓴다. 호출부가 `className`으로 트리거 너비를 바꿔도 팝업이 따라간다.
- `DropdownContent`의 기본 너비·radius·그림자는 `cn`으로 덮어쓴다.

### Dropdown 추가 variant

| 대상               | `medium` 매핑                                                    |
| ------------------ | ---------------------------------------------------------------- |
| `DropdownContent`  | `w-37.5`(150px) `rounded-[12px]`                                 |
| `DropdownItem`     | 바깥 `flex h-11 items-center p-[5px]`                            |
| 셀                 | small과 동일(`rounded-[8px] px-[6px] py-[3px]` 14/20) + `flex-1` |
| 포커스(hover) 배경 | small과 동일(`primary-alpha-20`)                                 |

## 디자인 토큰 매핑

### 일치

| Figma                                       | 코드 토큰           | 비고                        |
| ------------------------------------------- | ------------------- | --------------------------- |
| 트리거·팝업 배경 `#fffffe`(white/50)        | `--color-white-50`  |                             |
| large 트리거 텍스트 `18px/28px`             | `--text-lg`         |                             |
| medium/small 트리거·항목 텍스트 `14px/20px` | `--text-sm`         |                             |
| large 항목 텍스트 `16px/24px`               | `--text-base`       | `DropdownItem` large 그대로 |
| 구분선 `#dddcdc`(slate/100)                 | `--color-slate-100` |                             |

### 불일치 (값 기준 arbitrary)

| 항목             | Figma     | 코드 토큰                      | 처리                                                            |
| ---------------- | --------- | ------------------------------ | --------------------------------------------------------------- |
| 텍스트 slate/700 | `#333333` | `--color-slate-700`(`#161412`) | `text-[#333333]` — Dropdown 문서 "색상 불일치 매핑 방침"과 동일 |
| 화살표 slate/400 | `#A4A4A4` | `--color-slate-400`(`#6B6A68`) | `text-[#a4a4a4]`                                                |

letter-spacing은 `tracking-[-0.03em]`(large -0.54px)로 인라인 적용한다. medium/small 트리거 텍스트는 Figma `text-sm/medium`(letterSpacing 0)이라 tracking을 두지 않는다.

### Figma에 없는 값 (코드에서 결정)

| 항목               | 코드                                    | 비고                                                  |
| ------------------ | --------------------------------------- | ----------------------------------------------------- |
| placeholder 텍스트 | `#a4a4a4`                               | 화살표와 같은 보조 색 — "확정 사항" 4번               |
| 선택된 항목 셀     | `bg-primary-alpha-30` + `font-semibold` | `DropdownItem`의 `isSelected` 그대로 (③에서 확정)     |
| medium 항목 hover  | `primary-alpha-20`                      | Figma에 medium hover가 없어 셀이 같은 small 값을 쓴다 |

### 신설 필요

없음. 그림자는 arbitrary value로 유지한다("설계 결정 요약" 참고).

## 접근성

- 트리거의 `aria-haspopup`·`aria-expanded`, 팝업의 `role="menu"`·`"menuitem"`, 키보드 내비게이션(↑↓/Home/End/Esc)은 Base UI `Menu`가 제공한다.
- 현재 선택된 항목에는 `aria-current="true"`가 붙고 `font-semibold`를 함께 적용해 색만으로 구분하지 않는다.
- 트리거의 접근 가능한 이름은 현재는 **표시 텍스트(선택값 또는 placeholder)뿐**이다. 폼 라벨과 연결하는 방법은 "확인 필요" 1번에서 다룬다.
- 항목 선택 후 팝업이 닫히고 포커스는 트리거로 돌아간다(Base UI 기본 동작, 테스트로 확인).

## 렌더링 경계

| 파일                                                | `"use client"` | 이유                                                                               |
| --------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| `_common/FormDropdown/FormDropdown.tsx`             | ○              | 항목마다 `onSelect` 함수를 만들어 클라이언트 컴포넌트(`Dropdown`)에 전달한다       |
| `_common/FormDropdownButton/FormDropdownButton.tsx` | ✕              | `MonthDropdownButton`과 동일. 상태·이벤트 없이 Base UI `Button`에 props만 전달한다 |

호출부는 `onChange`를 넘겨야 하므로 클라이언트 컴포넌트에서 렌더한다([rendering.md](../../architecture/rendering.md)).

## 테스트 전략

Dropdown 스택의 `feat/common-dropdown-test` 단계에서 작성한다([test.md](../../convention/test.md)).

```
test/components/_common/FormDropdown/FormDropdown.test.tsx
test/components/_common/FormDropdownButton/FormDropdownButton.test.tsx
```

| 대상     | 검증                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| 렌더     | 트리거에 선택된 옵션의 `label` 노출, 값이 없으면 `placeholder`와 `data-placeholder` |
| 선택     | `value`에 해당하는 항목에만 `aria-current="true"`                                   |
| 상호작용 | 항목 클릭 시 `onChange(option.value)` 호출 후 팝업 닫힘, 포커스가 트리거로 복귀     |
| 구분선   | `large`에서만 항목에 `border-b`, 마지막 항목은 `border-b-0`                         |
| variant  | `size` `large`/`medium`/`small`에 따른 트리거·팝업 클래스 적용                      |

## 단계별 PR 계획

Dropdown 스택의 4단계다([dropdown "단계별 PR 계획"](../dropdown/README.md#단계별-pr-계획)).

| 브랜치                      | base                         | 내용                                                                                            |
| --------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `feat/common-dropdown-form` | `feat/common-dropdown-month` | 이 설계 문서 + `Dropdown` `medium`·`hasDivider` 추가 + `FormDropdownButton`·`FormDropdown` 구현 |

## 확정 사항

| #   | 항목         | 결정                                                                                                                          |
| --- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | 결합 방식    | 트리거 `FormDropdownButton` + 조합 `FormDropdown` 분리, `value`/`onChange` controlled, 옵션은 `{ value, label }[]`            |
| 2   | medium size  | 공통 `Dropdown`의 `size`에 `medium` 추가                                                                                      |
| 3   | large 구분선 | 항목 "사이" 구분선. Figma는 5개 항목 모두에 `border-b`가 있지만 마지막 항목은 제외해 팝업 하단 모서리에 선이 겹치지 않게 한다 |
| 4   | placeholder  | `placeholder` prop 추가, `#a4a4a4`로 표시. Figma에 placeholder 상태가 없어 정한 임시 스타일이며, 추가되면 그 값으로 교체한다  |

## 확인 필요

아래 항목은 **임의로 확정하지 않는다.** 확인 후 이 문서에 반영한다.

### 1. 폼 라벨 연결

`FormDropdown`은 현재 `className` 외의 트리거 props(`aria-label`, `aria-labelledby`, `id` 등)를 받지 않는다. 폼에서 `<label>`과 연결하려면 트리거 props를 열어야 하는데, 어떤 props를 열지(개별 prop / 트리거 props 전체 전달)는 실제 폼 화면을 만들 때 확인한다.

### 2. 옵션이 많을 때 팝업 높이

Figma 팝업은 5개 항목 기준이고 최대 높이 지정이 없다. 옵션이 많아지면 `MonthSelectDropdown`처럼 고정 높이 + 내부 스크롤을 둘지 디자이너 확인이 필요하다.

### 3. 트리거 너비

Figma 고정 너비(276/150/102px)를 기본값으로 두었다. 폼 레이아웃에서 부모 너비를 채워야 하면 `className`(`w-full` 등)으로 덮어쓴다. 기본값을 반응형으로 바꿀지는 실제 폼 화면에서 확인한다.

## 참고

- 팝업 리스트: [component/dropdown/README.md](../dropdown/README.md)
- 같은 구조의 선례: [component/month-select-dropdown/README.md](../month-select-dropdown/README.md), [component/month-dropdown-button/README.md](../month-dropdown-button/README.md)
- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
