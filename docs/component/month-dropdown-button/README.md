# MonthDropdownButton 컴포넌트 설계

## 개요

현재 월을 보여 주고, 누르면 월 선택 팝업을 여는 **드롭다운 트리거 버튼**이다. Figma 컴포넌트 셋 `btn_change_month`는 `size(large/small)` 2개 인스턴스로 구성되어 있고, 두 인스턴스 모두 "라벨(`9월`) + `ic_chevron-down` 아이콘"을 `radius 20px` 아웃라인 pill로 감싼 형태다.

`Button`의 variant로 넣지 않고 형제 컴포넌트로 분리한다 — 모양(아웃라인 pill, 고정 아이콘 위치)과 역할(단발 액션이 아니라 팝업을 여는 트리거)이 모두 달라서다([button/README.md](../button/README.md) "버튼 계열 컴포넌트 분리" 5번).

이 컴포넌트는 **트리거 버튼만** 담당한다. 팝업(월 리스트)은 [Dropdown 설계 문서](https://github.com/BizSched/Frontend/blob/design/common-dropdown/docs/component/dropdown/README.md)(`design/common-dropdown` 브랜치, 미병합)의 `Dropdown`이 맡고, `MonthDropdownButton`은 그 `children`(트리거)으로 주입된다. Dropdown 문서의 "③ 월 변경 트리거 (설계 제안)"를 이 문서에서 구체화한다.

Figma: [BizSched / design 캔버스 — btn_change_month](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=147-233325&m=dev) (`147:233325`)

| 인스턴스     | 노드         | 크기      | 라벨 타이포                 | 라벨–아이콘 간격 |
| ------------ | ------------ | --------- | --------------------------- | ---------------- |
| `size=large` | `105:189623` | 84 × 31px | Inter Bold 20px / 29px      | 10px             |
| `size=small` | `147:233326` | 71 × 26px | Pretendard Bold 16px / 24px | 4px              |

공통: 보더 1px `slate/200`(`#c6c5c5`), `radius 20px`, 좌우 padding 8px, 라벨 `slate/900`(`#0f0e0d`), 아이콘 `ic_chevron-down` 24px(`slate/400`, `#A4A4A4`). large는 너비 84px 고정, small은 콘텐츠 너비(hug).

## 네이밍

| 대상       | 이름                                                                 | 근거                                                                                                                                                                                                                                |
| ---------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 컴포넌트   | `MonthDropdownButton`                                                | 역할(월) + 동작(드롭다운을 연다) + 형태(버튼)가 모두 드러난다. Dropdown 문서가 ③ 전체(트리거 + 팝업) 조합에 제안한 가칭 `MonthSelectDropdown`과 겹치지 않도록 `Button` 접미사로 "트리거만"임을 구분한다. 작업 브랜치명과도 일치한다 |
| 코드 경로  | `src/components/_common/MonthDropdownButton/MonthDropdownButton.tsx` | [naming.md](../../convention/naming.md)의 `name/Name.tsx` 규칙, `Button`·`SelectButton`과 같은 `_common/<Component>/<Component>.tsx` 구조                                                                                           |
| 문서 경로  | `docs/component/month-dropdown-button/README.md`                     | 기존 문서 폴더의 다수(`button`·`card`·`modal`·`pagination`·`dropdown`·`datepicker`·`select-button`)가 kebab-case다. `IconButton`·`TextButton`(미병합)만 PascalCase라, 다수 쪽인 kebab-case로 작성한다 — "확정 사항" 1번             |
| Figma 원명 | `btn_change_month`                                                   | `ChangeMonthButton`도 후보였지만, "월을 바꾼다"는 결과보다 "드롭다운을 연다"는 트리거 역할이 이 컴포넌트의 책임 범위와 더 맞아 채택하지 않았다                                                                                      |

## 설계 결정 요약

| 결정             | 선택                                                       | 근거                                                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 책임 범위        | 트리거 버튼만. 팝업·선택 상태는 갖지 않음                  | 팝업 리스트는 Dropdown(①②)이 재사용 단위로 설계되어 있다. 트리거를 독립 컴포넌트로 두면 Dropdown 쪽 "③④ 결합 방식"(Dropdown 문서 확인 필요 1번)이 어떻게 정해지든 그대로 끼워 쓸 수 있다                                      |
| 기반 primitive   | Base UI `Button` (`@base-ui/react/button`)                 | `Button`과 같은 primitive. props·ref를 그대로 전달하므로 Base UI `Menu.Trigger`의 `render` 위임 대상으로 쓸 수 있고, 트리거가 받아야 하는 `aria-haspopup`·`aria-expanded`·`data-popup-open`이 별도 배선 없이 붙는다           |
| variant 축       | `size`(`large`/`small`) 1축 — `cva`                        | Figma 컴포넌트 셋의 축이 `size` 하나뿐이다                                                                                                                                                                                    |
| 라벨             | `children`으로 받음 (`"9월"` 등 완성된 문자열)             | 월 포맷(`M월`)·로케일은 호출부 책임. 컴포넌트가 `Date`/숫자를 받아 포맷하면 표시 규칙이 바뀔 때마다 공통 컴포넌트를 고쳐야 한다                                                                                               |
| 아이콘           | lucide `ChevronDownIcon` 고정 렌더 (prop 아님)             | [pagination](../pagination/README.md) 선례: `components.json`의 `iconLibrary: "lucide"`, 글리프가 Figma `ic_chevron-down`과 1:1 대응해 에셋 커밋이 불필요. Figma 인스턴스에서 아이콘이 교체되지 않으므로 prop으로 열지 않는다 |
| 열림 상태        | 별도 prop 없이 `data-popup-open` 속성으로 아이콘 180° 회전 | Dropdown 문서 ③은 열림 시 `chevron-up`을 명시한다. `Menu.Trigger`가 열림 동안 붙여 주는 `data-popup-open`을 쓰면 상태 prop 없이 열림/닫힘에 따라 회전이 따라간다 — "확정 사항" 3번                                            |
| 접근 가능한 이름 | 시각적으로 숨긴 `"월 선택"` 접두어 + 라벨                  | 라벨(`9월`)만으로는 역할이 드러나지 않는다. 접두어를 `sr-only`로 두어 현재 값과 역할을 함께 읽힌다 — "확정 사항" 6번                                                                                                          |
| 구조             | compound 아닌 단일 컴포넌트                                | Figma 인스턴스가 단일 노드이고, 라벨·아이콘 외 교체 가능한 슬롯이 없다                                                                                                                                                        |

## 레이어 구조

```
src/components/_common/MonthDropdownButton/MonthDropdownButton.tsx
```

`Button`과 동일하게 단일 파일로 둔다. shadcn 레지스트리에 대응하는 생성물이 없으므로 `_common/ui/`에는 아무것도 두지 않는다. named export를 유지하고 배럴 `index.ts`는 두지 않는다([code-style.md](../../convention/code-style.md)).

## API

```tsx
import { MonthDropdownButton } from '@components/_common/MonthDropdownButton/MonthDropdownButton';

// 단독 렌더
<MonthDropdownButton>9월</MonthDropdownButton>
<MonthDropdownButton size="small">9월</MonthDropdownButton>

// Dropdown 트리거로 조합 (Dropdown 구현 후)
<Dropdown items={monthItems} size="small">
  <MonthDropdownButton size="small">{`${month}월`}</MonthDropdownButton>
</Dropdown>
```

| prop        | 기본값    | 설명                                   |
| ----------- | --------- | -------------------------------------- |
| `children`  | —         | 표시 라벨(예: `"9월"`)                 |
| `size`      | `"large"` | `"large"` \| `"small"`                 |
| `className` | —         | base·variant 클래스 뒤에 `cn`으로 병합 |

`MonthDropdownButtonProps`는 `ButtonPrimitive.Props`와 `VariantProps<typeof monthDropdownButtonVariants>`를 확장한다(`Button`과 같은 형태). `onClick`·`type`·`disabled` 등 네이티브 속성은 그대로 전달된다.

## variant (cva)

| 축     | 값      | 매핑                                                           |
| ------ | ------- | -------------------------------------------------------------- |
| `size` | `large` | `min-w-[5.25rem] gap-2.5 text-xl` (최소 84px, 20/30, gap 10px) |
|        | `small` | `gap-1 text-base` (hug, 16/24, gap 4px)                        |

`defaultVariants`는 `size: 'large'`.

공통 base 클래스(제안):

```
inline-flex shrink-0 cursor-pointer items-center rounded-full border border-slate-200 px-2
font-bold text-slate-900 whitespace-nowrap outline-none transition-colors
focus-visible:ring-3 focus-visible:ring-ring/50
disabled:pointer-events-none disabled:cursor-not-allowed
[&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 [&_svg]:text-[#a4a4a4] [&_svg]:transition-transform
data-[popup-open]:[&_svg]:rotate-180
```

- `radius 20px`는 두 사이즈 모두 높이(31/26px)의 절반 이상이라 `rounded-full`과 렌더 결과가 같다. `Button`과 표기를 맞춰 `rounded-full`을 쓴다.
- 높이는 고정하지 않는다. 라벨 line-height + 보더 2px로 결정되며(large 32px, small 26px), large는 Figma(31px)와 1px 차이가 난다 — "디자인 토큰 매핑 — 불일치" 참고.
- large 너비는 Figma의 84px 고정 대신 `min-w-[5.25rem]`(최소 84px)으로 둔다. `10월`~`12월`처럼 라벨이 길어지면 텍스트에 맞춰 넓어진다 — "확정 사항" 4번.
- `focus-visible:*`·`disabled:*`는 Figma에 정의된 상태가 아니지만, [accessibility.md](../../convention/accessibility.md)의 "focus 상태 제거 금지"와 `Button`과의 일관성을 위해 `Button`의 처리를 그대로 가져온다.

## 디자인 토큰 매핑

### 일치

| Figma 변수       | 값        | 코드 토큰                 | 용도       |
| ---------------- | --------- | ------------------------- | ---------- |
| `slate/200`      | `#c6c5c5` | `--color-slate-200`       | 보더       |
| `slate/900`      | `#0f0e0d` | `--color-slate-900`       | 라벨       |
| `text-base/bold` | 16/24 700 | `text-base` + `font-bold` | small 라벨 |

### 불일치

| 항목            | Figma                                    | 코드                                       | 처리                                                                                                                                                                                                            |
| --------------- | ---------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 아이콘 색       | `slate/400` `#A4A4A4`                    | `--color-slate-400` `#6B6A68`              | [dropdown](https://github.com/BizSched/Frontend/blob/design/common-dropdown/docs/component/dropdown/README.md)·[pagination](../pagination/README.md)의 "이름이 아니라 값 기준" 원칙대로 `text-[#a4a4a4]` 인라인 |
| large 라벨 폰트 | **Inter** Bold 20px / 29px (변수 미연결) | `--font-sans`(Pretendard), `text-xl` 20/30 | 프로젝트 폰트는 Pretendard 단일이고 Figma의 small 인스턴스도 Pretendard다. large만 Inter로 남은 것은 디자인 누락으로 보고 `text-xl font-bold`로 맞춘다(높이 31 → 32px 허용) — "확정 사항" 2번                   |

letter-spacing은 Figma 값이 `0`이라 `tracking-*`를 두지 않는다(`Button`의 `-0.03em`과 다름).

## 접근성

- Base UI `Button`이 네이티브 `button`의 역할·`disabled` 동작을 담당한다.
- `Menu.Trigger`로 조합되면 `aria-haspopup="menu"`, `aria-expanded`가 Base UI에 의해 붙는다. 단독 렌더 시에는 붙지 않으므로, 팝업 없이 쓰는 경우는 상정하지 않는다.
- 아이콘은 장식이므로 `aria-hidden="true"`.
- 버튼 안에 `<span className="sr-only">월 선택: </span>`을 라벨 앞에 렌더해 접근 가능한 이름을 `"월 선택: 9월"`로 만든다. `aria-label="월 선택"`을 직접 쓰면 라벨 텍스트를 덮어써 현재 선택된 월이 읽히지 않고, 보이는 텍스트가 이름에 포함되어야 한다는 WCAG 2.5.3(Label in Name)도 어기게 되어 이 방식을 택했다.
- 포커스 표시는 `Button`과 동일한 `focus-visible:ring-3 focus-visible:ring-ring/50`.

## 렌더링 경계

`MonthDropdownButton.tsx`에는 `"use client"`를 두지 않는다. 자체 상태·이벤트 핸들러가 없고 받은 props를 Base UI `Button`에 전달만 하므로 [rendering.md 4항](../../architecture/rendering.md#4-ui-primitive의-클라이언트-경계는-전염되지-않는다)에 해당한다. 클라이언트 경계는 이를 감싸는 `Dropdown`(Base UI `Menu`)이 갖는다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다.

```
test/components/_common/MonthDropdownButton/MonthDropdownButton.test.tsx
```

| 대상    | 검증                                                                                      |
| ------- | ----------------------------------------------------------------------------------------- |
| 렌더    | `children` 라벨 노출, 아이콘 렌더 + `aria-hidden`                                         |
| variant | `size` `large`/`small`에 따른 클래스 적용, 기본값 `large`                                 |
| 열림    | `data-popup-open` 부여 시 아이콘 회전 클래스 적용                                         |
| 접근성  | 접근 가능한 이름이 `"월 선택: {라벨}"`, `role="button"`, `disabled` 시 클릭 이벤트 미발생 |

`Dropdown`과의 조합(열림/닫힘·`aria-expanded`)은 `Dropdown`이 병합된 뒤 Dropdown 테스트 쪽에서 다룬다.

## 단계별 PR 계획

`Button`과 같은 순차 전략(머지 후 분기)을 따른다.

| 단계 | 브랜치                                   | 내용                                   | 상태                 |
| ---- | ---------------------------------------- | -------------------------------------- | -------------------- |
| 1/2  | `feat/common-month-dropdown-button`      | 설계 문서 + `MonthDropdownButton` 구현 | 구현 완료, 병합 대기 |
| 2/2  | `feat/common-month-dropdown-button-test` | Vitest 테스트                          | 예정                 |

### Dropdown 스택과의 순서 — 이 PR 우선

**이 PR(`feat/common-month-dropdown-button`)을 우선적으로 `dev`에 병합한다.** Dropdown 스택의 월 변경 단계(`feat/common-dropdown-month`, "③ 월 변경 트리거 + 팝업")는 트리거를 새로 만들지 않고 이 브랜치를 base로 분기해 `MonthDropdownButton`을 재사용한다. 해당 단계의 범위는 "팝업 조합"으로 줄어든다.

Dropdown 설계 문서는 이 브랜치에 없고 `design/common-dropdown` 브랜치에만 있으므로, 위 내용은 그 브랜치에서 Dropdown 문서를 수정할 때 반영한다. 이 PR 본문에도 "우선 병합 대상이며 Dropdown 월 변경 단계가 이 브랜치를 base로 한다"는 점을 적어 리뷰어가 순서를 알 수 있게 한다.

## 확정 사항

설계 중 "확인 필요"였다가 확정된 항목이다.

| #   | 항목                   | 결정                                                                                                                                 |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 문서 폴더 네이밍       | kebab-case(`month-dropdown-button`)로 작성. `docs/component/` 전체 규칙으로 [component/README.md](../README.md)에 명시하는 것은 별도 |
| 2   | large 라벨 폰트·높이   | Figma의 Inter 20/29 대신 Pretendard `text-xl`(20/30). 높이 31 → 32px 차이는 허용                                                     |
| 3   | 열림 상태 표현         | `data-popup-open` 기반 아이콘 180° 회전                                                                                              |
| 4   | large 너비             | Figma의 84px 고정 대신 `min-w-[5.25rem]`(최소 84px). `10월`~`12월`은 라벨에 맞춰 넓어진다                                            |
| 5   | Dropdown 스택과의 순서 | 이 PR 우선 병합, Dropdown 월 변경 단계가 이 브랜치를 base로 작업 ("단계별 PR 계획" 참고)                                             |
| 6   | 접근 가능한 이름       | `"월 선택"` 라벨 부여. `sr-only` 접두어(`월 선택: `)로 구현해 "라벨: 값" 형태인 `"월 선택: 9월"`로 읽힌다("접근성" 참고)             |

## 확인 필요

현재 남은 항목은 없다. 새로 생기면 **임의로 확정하지 않고** 확인 후 이 문서에 반영한다.

## 참고

- 형제 컴포넌트·분리 근거: [component/button/README.md](../button/README.md)
- 팝업(월 리스트): Dropdown 설계 문서 (`design/common-dropdown` 브랜치 `docs/component/dropdown/README.md`)
- 값 기준 토큰 매핑·lucide 아이콘 선례: [component/pagination/README.md](../pagination/README.md)
- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
