# SelectButton 컴포넌트 설계

## 개요

선택/해제 두 상태를 오가는 작은 토글 버튼이다. Figma의 `btn_select` 컴포넌트 셋은 `select(true/false)` 2개 인스턴스로 구성되어 있으며, 예시 라벨이 `월`인 것으로 보아 요일처럼 짧은 항목을 여러 개 나열해 선택하는 용도다.

`Button`의 variant로 넣지 않고 형제 컴포넌트로 분리한다 — 크기·모양(작은 사각형, `rounded` 6px)과 역할(단발 액션이 아닌 on/off 상태 보유)이 모두 달라서다([button/README.md](../button/README.md) "버튼 계열 컴포넌트 분리" 5번).

Figma: [BizSched / design 캔버스 — btn_select](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=358-153200&m=dev) (`358:153200`)

| 인스턴스       | 노드         | 크기         |
| -------------- | ------------ | ------------ |
| `select=true`  | `358:153199` | 46.67 × 38px |
| `select=false` | `358:153201` | 46.67 × 38px |

## 설계 결정 요약

| 결정           | 선택                                                                                  | 근거                                                                                                                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 기반 primitive | Base UI `Toggle` (`@base-ui/react/toggle`)                                            | on/off 상태를 가진 버튼의 표준 primitive. `aria-pressed`를 자동으로 붙여 스크린리더에 선택 상태를 전달하고, `pressed`/`defaultPressed`/`onPressedChange`로 controlled·uncontrolled를 모두 지원한다. `Button`·`Dialog`와 같은 Base UI 계열로 통일 |
| 선택 상태 표현 | prop이 아닌 `data-pressed` 속성 스타일링                                              | Figma의 `select` 축은 코드에서 별도 variant가 아니라 Toggle의 pressed 상태 그 자체다. `Button`이 `state` 축을 `disabled`·`hover:`로 처리한 것과 같은 방식으로, `data-pressed:` variant로 스타일을 분기한다                                       |
| cva 사용 여부  | 사용하지 않음 — base 클래스를 `cn`으로만 병합                                         | Figma에 크기·위계 등 다른 variant 축이 없고, 유일한 축(`select`)은 위와 같이 속성으로 처리된다. variant 축이 생기면 그때 `cva`로 전환한다                                                                                                        |
| 너비           | 버튼에 고정 `w-*`를 두지 않고 패딩 `p-4`(1rem) + 라벨 `span` `w-[2.4rem]`로 크기 결정 | Figma 너비 `46.667px`는 정수가 아닌 값이라 버튼 자체에 고정 너비를 두지 않는다. 라벨 `span` 너비를 고정해 라벨 길이와 관계없이 모든 항목이 같은 크기로 렌더되게 한다                                                                             |
| 그룹           | 단일 항목만 제공 — 그룹 래퍼 컴포넌트는 만들지 않음                                   | Figma 노드가 단일 버튼이고, 여러 개를 묶어 쓰는 사용처가 아직 확정되지 않았다. 필요해지면 호출부에서 Base UI `ToggleGroup`으로 감싼다                                                                                                            |
| 구조           | compound 아닌 단일 컴포넌트                                                           | Base UI `Toggle`이 서브파츠 없는 단일 엘리먼트 primitive                                                                                                                                                                                         |
| 상태 범위      | `select` true/false 두 상태만 — hover·disabled·focus 전용 스타일 없음                 | Figma 컴포넌트 셋에 정의된 상태가 두 개뿐이다. focus는 전용 스타일을 두지 않되 `outline-none`도 쓰지 않아 브라우저 기본 outline을 유지한다("접근성" 참고)                                                                                        |
| 이름           | `SelectButton`                                                                        | Figma에 "select button"으로 명시되어 있음                                                                                                                                                                                                        |

## 레이어 구조

```
src/components/_common/SelectButton/SelectButton.tsx
```

`Button`과 동일하게 `_common/<Component>/<Component>.tsx` 단일 파일로 둔다. ([ui-component.md](../../convention/ui-component.md)는 `_common/ui/`를 명시하지만, 기존 `Button`·`Modal`·`Pagination`이 모두 `_common/<Component>/` 구조를 쓰고 있어 기존 코드 패턴을 따른다.)

## API

```tsx
import { SelectButton } from '@components/_common/SelectButton/SelectButton';

// uncontrolled
<SelectButton defaultPressed>월</SelectButton>

// controlled
<SelectButton pressed={isMonday} onPressedChange={setIsMonday}>월</SelectButton>
```

`SelectButtonProps`는 Base UI `Toggle.Props`를 그대로 확장한다. 별도로 추가하는 prop은 없다.

## 스타일

```tsx
<TogglePrimitive
  data-slot="select-button"
  className={cn('...base', className)}
  {...props}
>
  <span className="w-[2.4rem] truncate">{children}</span>
</TogglePrimitive>
```

| 구분          | 클래스                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| base          | `inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm p-[0.625rem] text-center text-xs font-medium transition-colors` |
| 해제(default) | `bg-slate-50 text-slate-500`                                                                                                                |
| 선택(pressed) | `data-pressed:bg-primary-100 data-pressed:text-slate-800 data-pressed:shadow-select-button`                                                 |
| 라벨 `span`   | `w-6 h-4.5 truncate`                                                                                                                        |

- 버튼 크기는 패딩(1rem × 2) + 라벨 너비(2.4rem)로 정해져 **너비 4.4rem(70.4px)**, 높이는 라벨 line-height(`text-xs` → 1rem)를 더해 **3rem(48px)** 이 된다. Figma 인스턴스(46.67 × 38px)와 다르지만, 버튼에 고정 너비를 두지 않고 라벨 너비로 크기를 잡는다는 결정에 따른 값이다.
- 라벨이 2.4rem을 넘으면 `truncate`로 말줄임한다.
- 선택/해제 두 상태가 같은 패딩을 써서 상태 전환 시 레이아웃이 흔들리지 않는다. (Figma 원본은 `select=false`에만 좌우 패딩이 없다.)
- Figma의 `drop-shadow`(filter)는 배경이 꽉 찬 사각형에서 `box-shadow`와 결과가 같아 `shadow-*` 유틸리티로 옮긴다.

## 디자인 토큰 매핑

### 일치

| Figma 변수       | 값                            | 코드 토큰                                   | 용도        |
| ---------------- | ----------------------------- | ------------------------------------------- | ----------- |
| `primary/100`    | `#fff9ed`                     | `--color-primary-100`                       | 선택 배경   |
| `slate/800`      | `#131110`                     | `--color-slate-800`                         | 선택 텍스트 |
| `slate/50`       | `#f4f3f3`                     | `--color-slate-50`                          | 해제 배경   |
| `slate/500`      | `#1c1917`                     | `--color-slate-500`                         | 해제 텍스트 |
| `text-xs/medium` | Pretendard Medium 12/16, ls 0 | `text-xs`(`0.75rem`/`1rem`) + `font-medium` | 라벨 타이포 |
| corner radius    | 6px                           | `rounded-sm`(`--radius-sm` = 0.375rem)      | 모서리      |

### 신설 — `theme.css`

| 토큰                     | 값                              | 유틸리티               | 용도        |
| ------------------------ | ------------------------------- | ---------------------- | ----------- |
| `--shadow-select-button` | `0 1px 1px rgba(0, 0, 0, 0.06)` | `shadow-select-button` | 선택 그림자 |

Figma 그림자에 대응하는 토큰이 없고 Tailwind 기본 `shadow-xs`(`0 1px 2px rgb(0 0 0/0.05)`)와도 값이 달라, `--shadow-modal`과 같은 방식으로 `theme.css`의 `@theme inline` 블록에 추가한다.

letter-spacing은 Figma 값이 `0`이라 `tracking-*`를 적용하지 않는다.

## 접근성

- Base UI `Toggle`이 네이티브 `button` + `aria-pressed`를 렌더해 선택 상태가 보조기술에 전달된다.
- Figma에 focus 상태가 없어 전용 스타일(`focus-visible:ring-*`)은 두지 않는다. 대신 `outline-none`을 쓰지 않아 브라우저 기본 outline이 남으므로 [accessibility.md](../../convention/accessibility.md)의 "focus 상태 제거 금지"를 만족한다.
- `월`처럼 한 글자 라벨은 스크린리더에서 의미가 모호할 수 있다. 필요하면 호출부에서 `aria-label="월요일"`을 넘긴다(Toggle.Props가 그대로 전달됨).
- 선택/해제 구분이 배경색 차이(`#fff9ed` vs `#f4f3f3`)와 옅은 그림자뿐이라 시각적 구분이 약하다. 선택 상태 자체는 `aria-pressed`로 보조기술에 전달된다.

## 렌더링 경계

`SelectButton.tsx`에는 `"use client"`를 두지 않는다. [rendering.md 4항](../../architecture/rendering.md#4-ui-primitive의-클라이언트-경계는-전염되지-않는다) 기준으로, 이 파일은 Base UI `Toggle`을 감싸 props를 전달만 하고 자체 상태·핸들러를 선언하지 않는다. uncontrolled(`defaultPressed`)로 쓰면 Server Component에서도 렌더할 수 있고, controlled로 쓰는 호출부가 상태를 가지는 쪽에서 경계를 선언한다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다. 구현과 분리해 별도 PR로 진행한다.

```
test/components/_common/SelectButton/SelectButton.test.tsx
```

| 대상       | 검증                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| 렌더       | `children` 라벨 렌더, `role="button"`                                   |
| 선택 상태  | 클릭 시 `aria-pressed`·`data-pressed` 토글, `onPressedChange` 호출 인자 |
| controlled | `pressed` prop 변경이 그대로 반영되는지                                 |
| 라벨       | 라벨 `span`에 고정 너비·`truncate` 적용                                 |

## 단계별 PR 계획

`Button`과 같은 순차 전략(설계+구현 → 머지 후 테스트 분기)을 따른다.

| 단계 | 브랜치                           | 내용                            | 상태                  |
| ---- | -------------------------------- | ------------------------------- | --------------------- |
| 1/2  | `feat/common-select-button`      | 설계 문서 + `SelectButton` 구현 | 설계 완료 · 구현 예정 |
| 2/2  | `feat/common-select-button-test` | Vitest 테스트                   | 예정                  |

## 확인 필요

현재 남은 항목은 없다. 아래는 확인을 거쳐 확정한 결정 기록이다.

| 항목                 | 결정                                                       |
| -------------------- | ---------------------------------------------------------- |
| 너비 결정 방식       | 버튼 고정 너비 없이 `p-4`(1rem) + 라벨 `span` `w-[2.4rem]` |
| 그룹 래퍼 컴포넌트   | 만들지 않음 — 사용처 확정 후 재검토                        |
| hover·disabled·focus | 없음 — `select` true/false 두 상태만 구현                  |
| 선택 그림자          | `theme.css`에 `--shadow-select-button` 신설                |
| 컴포넌트명           | `SelectButton` (Figma 명칭 기준)                           |

## 참고

- 버튼 계열 분리 계획: [component/button/README.md](../button/README.md)
- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 목표: [convention/accessibility.md](../../convention/accessibility.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
