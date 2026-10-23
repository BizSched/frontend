# MonthSelectDropdown 컴포넌트 설계

## 개요

현재 월을 보여 주는 트리거를 누르면 1~12월 리스트 팝업이 열리고, 항목을 고르면 월이 바뀌는 **월 선택 드롭다운**이다. [Dropdown 설계 문서](../dropdown/README.md)의 ③ "dropdown 날짜 변경"에 해당한다.

새 부품을 만들지 않고 이미 있는 두 컴포넌트를 조합한다.

| 부품   | 컴포넌트                                                       | 문서                                                                  |
| ------ | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| 트리거 | `MonthDropdownButton`                                          | [month-dropdown-button/README.md](../month-dropdown-button/README.md) |
| 팝업   | `Dropdown`(`DropdownContent` + `DropdownItem`, Base UI `Menu`) | [dropdown/README.md](../dropdown/README.md)                           |

Figma: [BizSched — dropdown 날짜 변경](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=105-194286&m=dev) (`105:194286`)

| 인스턴스                      | 노드         | 트리거    | 팝업       | 리스트 셀                   |
| ----------------------------- | ------------ | --------- | ---------- | --------------------------- |
| `size=large`, `state=default` | `105:194231` | 84 × 31px | —          | —                           |
| `size=large`, `state=active`  | `105:194287` | 84 × 32px | 84 × 232px | `DropdownItem` large와 동일 |
| `size=small`, `state=active`  | `105:201445` | 71 × 26px | 71 × 205px | `DropdownItem` small과 동일 |

공통: 트리거–팝업 간격 4px, 팝업 너비 = 트리거 너비, 팝업 `radius 20px`, 그림자 `0px 2px 2px rgba(0,0,0,0.25)`, 배경 `white/50`(`#fffffe`). 팝업 높이가 고정이라 12개 항목 중 일부만 보이고 나머지는 잘린다.

## 설계 결정 요약

| 결정             | 선택                                                                         | 근거                                                                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 결합 방식        | **별도 컴포넌트.** `Dropdown` + `MonthDropdownButton`을 조합한 전용 컴포넌트 | 월 리스트(1~12)·라벨 포맷·팝업 크기가 ③ 전용이다. ④ Form 드롭다운과 하나의 compound로 묶으면 ④ 설계까지 이번에 확정해야 한다 — Dropdown 문서 "확인 필요" 1번 중 ③ 부분 확정    |
| 이름             | `MonthSelectDropdown`                                                        | Dropdown 문서의 가칭이자 Figma 팝업 노드 이름(`Month Select Dropdown`)과 일치. `MonthDropdownButton`(트리거만)과 `Button` 접미사 유무로 구분된다                               |
| 선택 상태        | **controlled.** `value`(1~12) + `onChange`를 호출부가 가진다                 | 월은 캘린더·목록 조회 등 화면 상태와 묶이는 값이라 호출부(또는 URL)가 소유해야 한다. [state-management.md](../../architecture/state-management.md)의 "상태는 쓰는 범위에" 원칙 |
| 라벨 포맷        | 컴포넌트 안에서 `${month}월`로 만든다                                        | `MonthDropdownButton`은 범용 트리거라 포맷을 호출부에 맡겼지만, 이 컴포넌트는 월 전용이라 포맷이 책임 범위 안에 있다                                                           |
| 12개월 넘침      | **고정 높이 + 내부 스크롤.** 열릴 때 현재 월 항목이 보이도록 스크롤          | Figma 높이(large 232px / small 205px)를 그대로 쓴다 — Dropdown 문서 "확인 필요" 4번 확정                                                                                       |
| 팝업 스타일      | `Dropdown`의 `className`으로 너비·radius·그림자·높이만 덮어쓴다              | 셀은 ②와 픽셀 단위로 같아 `DropdownItem`을 그대로 쓴다. 팝업만 ①과 값이 달라 variant를 추가하지 않고 조합 쪽에서 덮어쓴다                                                      |
| 그림자           | arbitrary value `drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]` 유지            | ①② 구현과 같은 방식. 토큰 신설 여부는 ④까지 끝난 뒤 4종을 한 번에 검토한다 — Dropdown 문서 "확인 필요" 2번 중 ③ 부분 확정                                                      |
| 트리거–팝업 간격 | `Dropdown`에 `sideOffset` prop을 추가해 `4`를 전달                           | 현재 `Dropdown`/`DropdownContent`는 `Menu.Positioner` 옵션을 열어 두지 않았다. ①② API에 선택 prop 하나를 추가하는 변경이라 기존 호출부에 영향이 없다                           |

## 레이어 구조

```
src/components/_common/MonthSelectDropdown/MonthSelectDropdown.tsx   조합 + 월 리스트 + 선택 상태 연결
src/components/_common/Dropdown/Dropdown.tsx                         sideOffset prop 추가
src/components/_common/Dropdown/DropdownContent.tsx                  sideOffset을 Menu.Positioner에 전달
src/components/_common/Dropdown/DropdownItem.tsx                     isSelected 상태 + 열릴 때 선택 항목으로 스크롤
```

"열릴 때 현재 월로 스크롤"은 `MonthSelectDropdown`이 아니라 `DropdownItem`이 맡는다. 팝업 DOM은 Base UI Portal 안에 있어 조합 쪽에서 닿기 어렵고, 선택된 항목이 스크롤 영역 밖에 있는 문제는 ④ Form 드롭다운에서도 똑같이 생기기 때문이다.

`MonthDropdownButton`과 같은 `_common/<Component>/<Component>.tsx` 단일 파일 구조다. named export를 유지하고 배럴 `index.ts`는 두지 않는다([code-style.md](../../convention/code-style.md)).

## API

```tsx
import { MonthSelectDropdown } from '@components/_common/MonthSelectDropdown/MonthSelectDropdown';

const [month, setMonth] = useState(9);

<MonthSelectDropdown value={month} onChange={setMonth} />
<MonthSelectDropdown value={month} onChange={setMonth} size="small" />
```

| prop        | 기본값    | 설명                                               |
| ----------- | --------- | -------------------------------------------------- |
| `value`     | —         | 현재 월. `1`~`12`                                  |
| `onChange`  | —         | `(month: number) => void`. 항목 선택 시 호출       |
| `size`      | `"large"` | `"large"` \| `"small"`. 트리거·팝업·셀에 함께 적용 |
| `className` | —         | 트리거(`MonthDropdownButton`)에 병합               |

내부 조합(요약):

```tsx
<Dropdown
  size={size}
  sideOffset={4}
  items={months.map((month) => ({
    label: `${month}월`,
    isSelected: month === value,
    onSelect: () => onChange(month),
  }))}
  className={monthSelectDropdownContentVariants({ size })}
>
  <MonthDropdownButton
    size={size}
    className={className}
  >{`${value}월`}</MonthDropdownButton>
</Dropdown>
```

### `Dropdown` 변경

| 대상                | 추가          | 설명                                                                                                                                                                       |
| ------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dropdown` prop     | `sideOffset`  | 트리거와 팝업 사이 간격(px). `Menu.Positioner`에 전달                                                                                                                      |
| `DropdownOption`    | `isSelected?` | 현재 선택된 항목 여부. `DropdownItem`의 `isSelected`로 전달                                                                                                                |
| `DropdownItem` prop | `isSelected?` | 선택 스타일 + `aria-current="true"` 부여, 열릴 때 스크롤 영역 가운데로 이동. 자세한 값은 [dropdown "DropdownItem 선택 상태"](../dropdown/README.md#dropdownitem-선택-상태) |

모두 선택 prop이라 기존 호출부에 영향이 없다. `isSelected`는 ④ Form 드롭다운에서도 그대로 쓴다.

## variant (cva)

트리거·셀은 기존 컴포넌트의 `size` variant를 그대로 쓴다. 이 컴포넌트가 새로 정의하는 것은 **팝업 덮어쓰기 클래스** 하나다.

| 축     | 값      | 매핑        |
| ------ | ------- | ----------- |
| `size` | `large` | `h-[232px]` |
|        | `small` | `h-[205px]` |

공통 base 클래스:

```
w-(--anchor-width) overflow-auto rounded-[20px] [scrollbar-width:none]
drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]
```

- 너비는 Figma의 84/71px 고정값 대신 Base UI `Menu.Positioner`가 주는 `--anchor-width`(트리거 너비)를 쓴다. 트리거 large가 `min-w-[5.25rem]`이라 `10월`~`12월`에서 넓어지면 팝업도 함께 넓어진다([month-dropdown-button "확정 사항" 4번](../month-dropdown-button/README.md#확정-사항)).
- `DropdownContent`의 기본 `w-100`/`w-25.5`, `rounded-[16px]`/`[12px]`, 그림자, `overflow-clip`은 `cn`으로 덮어쓴다. `overflow-y-auto`는 `overflow-clip`과 다른 그룹이라 둘 다 남으므로, 같은 그룹인 `overflow-auto`로 `overflow-clip`을 확실히 대체한다(병합 결과 확인 완료).
- 스크롤바는 `[scrollbar-width:none]`으로 숨긴다. Figma에 스크롤바가 없고, 84/71px 폭에서는 스크롤바가 셀 폭을 크게 줄인다. 아래쪽 항목이 반쯤 잘려 보이는 것으로 스크롤 가능함을 드러내고, 휠·터치·키보드 스크롤은 그대로 동작한다 — "확정 사항" 6번.

## 디자인 토큰 매핑

### 일치

| Figma                         | 코드 토큰                                | 비고                     |
| ----------------------------- | ---------------------------------------- | ------------------------ |
| 팝업 배경 `#fffffe`(white/50) | `--color-white-50`                       | `DropdownContent` 기본값 |
| 트리거 전체                   | `MonthDropdownButton` 문서의 매핑 그대로 |                          |
| 리스트 셀 전체                | `DropdownItem` large/small 매핑 그대로   |                          |

### 불일치

| 항목                   | Figma                                    | 코드                                | 처리                                                                                                                                                                   |
| ---------------------- | ---------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| large 열림 상태 화살표 | `ic_chevron-down` (small은 `chevron-up`) | `data-popup-open`으로 180° 회전(위) | large만 down으로 남은 것은 디자인 누락으로 보고 small과 같게 위 방향으로 맞춘다([month-dropdown-button "확정 사항" 3번](../month-dropdown-button/README.md#확정-사항)) |
| 팝업 너비              | 84 / 71px 고정                           | `--anchor-width`                    | 위 "variant" 참고                                                                                                                                                      |

### Figma에 없는 값 (코드에서 결정)

| 항목           | 코드                                    | 비고                                                                                |
| -------------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| 선택된 항목 셀 | `bg-primary-alpha-30` + `font-semibold` | Figma dropdown list에 `selected` 상태가 없어 기존 토큰으로 정했다 — "확정 사항" 5번 |

### 신설 필요

없음. 그림자는 arbitrary value로 유지한다("설계 결정 요약" 참고).

## 접근성

- 트리거의 `aria-haspopup`·`aria-expanded`, 팝업의 `role="menu"`·`"menuitem"`, 키보드 내비게이션(↑↓/Home/End/Esc)은 Base UI `Menu`가 제공한다.
- 트리거의 접근 가능한 이름은 `MonthDropdownButton`의 `sr-only` 접두어로 `"월 선택: 9월"`이 된다.
- 현재 월 항목에는 `aria-current="true"`가 붙어 스크린리더가 "현재 항목"임을 함께 읽는다. 색만으로 선택을 구분하지 않도록 `font-semibold`를 함께 적용한다.
- 팝업 내부 스크롤은 키보드 포커스 이동을 따라 브라우저가 포커스된 항목을 스크롤 영역 안으로 옮긴다. 열릴 때 현재 월 항목을 보이게 하는 스크롤은 시각적 위치만 맞추며 포커스를 옮기지 않는다.
- **키보드(Enter/Space/↓)로 열면** Base UI가 첫 항목(`1월`)을 하이라이트해 스크롤이 맨 위로 돌아간다. Base UI `Menu`에는 처음 하이라이트할 항목을 지정하는 옵션이 없어 이 동작을 유지한다. 마우스·터치로 열 때만 현재 월로 스크롤된다.
- 항목 선택 후 팝업이 닫히고 포커스는 트리거로 돌아간다(Base UI 기본 동작, 테스트로 확인).

## 렌더링 경계

| 파일                                                  | `"use client"` | 이유                                                                                                                        |
| ----------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `_common/MonthSelectDropdown/MonthSelectDropdown.tsx` | ○              | 항목마다 `onSelect` 함수를 만들어 클라이언트 컴포넌트(`Dropdown`)에 전달한다. 함수는 서버에서 클라이언트로 직렬화할 수 없다 |
| `_common/Dropdown/DropdownItem.tsx`                   | ○ (기존)       | 스크롤 이동용 ref·effect가 추가되지만 이미 클라이언트 파일이다                                                              |

호출부는 `onChange`를 넘겨야 하므로 클라이언트 컴포넌트에서 렌더한다. 월 상태를 URL에 두는 경우 `useSearchParams` 훅을 가진 말단 클라이언트 컴포넌트가 이 컴포넌트를 감싼다([rendering.md](../../architecture/rendering.md)).

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다. 테스트는 Dropdown 스택의 `feat/common-dropdown-test` 단계에서 작성한다.

```
test/components/_common/MonthSelectDropdown/MonthSelectDropdown.test.tsx
```

| 대상     | 검증                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 렌더     | 트리거에 `"{value}월"` 노출, 열면 `1월`~`12월` 12개 항목                 |
| 선택     | `value`에 해당하는 항목에만 `aria-current="true"`와 선택 스타일 적용     |
| 상호작용 | 항목 클릭 시 `onChange(month)` 호출 후 팝업 닫힘, 포커스가 트리거로 복귀 |
| 키보드   | ↑↓로 항목 이동, Esc로 닫힘                                               |
| variant  | `size` `large`/`small`에 따라 팝업 높이 클래스 적용                      |

## 단계별 PR 계획

Dropdown 스택의 3단계다([dropdown "단계별 PR 계획"](../dropdown/README.md#단계별-pr-계획)).

| 브랜치                       | base                      | 내용                                                                                  |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| `feat/common-dropdown-month` | `feat/common-dropdown-ui` | 이 설계 문서 + `Dropdown` `sideOffset`·`isSelected` 추가 + `MonthSelectDropdown` 구현 |

## 확정 사항

| #   | 항목                | 결정                                                                                                                                                                                                                     |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 결합 방식           | 별도 컴포넌트, `value`/`onChange` controlled                                                                                                                                                                             |
| 2   | 이름                | `MonthSelectDropdown`                                                                                                                                                                                                    |
| 3   | 12개월 넘침         | 고정 높이(large 232px / small 205px) + 내부 스크롤, 열릴 때 현재 월로 스크롤                                                                                                                                             |
| 4   | 그림자              | arbitrary value 유지, 토큰 신설은 ④ 이후 일괄 검토                                                                                                                                                                       |
| 5   | 현재 월 표시        | 공통 `DropdownItem`에 `isSelected` 상태 추가. `bg-primary-alpha-30` + `font-semibold` + `aria-current="true"`. 별도 디자이너가 없어 기존 토큰으로 정한 임시 스타일이며, Figma에 `selected`가 추가되면 그 값으로 교체한다 |
| 6   | 스크롤바            | `[scrollbar-width:none]`으로 숨긴다. Figma에 스크롤바가 없고 84/71px 폭에서 셀 폭을 크게 줄이기 때문. 스크롤 가능 여부는 반쯤 잘린 아래쪽 항목으로 드러낸다                                                              |
| 7   | 표시 가능한 월 범위 | 항상 1~12월 전체를 노출하고 모두 선택 가능하다. 미래 월 제한 등 비활성 항목은 두지 않는다(Figma에도 disabled 상태 없음)                                                                                                  |

## 확인 필요

현재 남은 항목은 없다. 새로 생기면 **임의로 확정하지 않고** 확인 후 이 문서에 반영한다.

## 참고

- 트리거: [component/month-dropdown-button/README.md](../month-dropdown-button/README.md)
- 팝업 리스트: [component/dropdown/README.md](../dropdown/README.md)
- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
