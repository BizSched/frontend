# TextButton 컴포넌트 설계

## 개요

텍스트만으로 구성된 단일 액션 트리거 컴포넌트다. [Button](../button/README.md)과 달리 배경·보더로 계층을 나누지 않고, 텍스트 색상(경고/삭제 의미의 `warning/500`)만으로 액션을 드러낸다. Figma 컴포넌트 셋은 `state(default/active) × size(large/small)` 4개 인스턴스로 구성되어 있고, 코드는 `size` 1축 cva variant로 대응한다. `state`는 Button과 동일한 방침으로 별도 prop을 두지 않고 `hover:` pseudo-class로 처리한다(아래 "설계 결정 요약" 참고).

Figma에 등록된 4개 인스턴스는 모두 라벨이 "삭제"로 고정되어 있지만, 이는 예시 라벨이고 컴포넌트 자체는 범용 텍스트 트리거로 판단해 라벨을 `children`으로 받는다(사용자 확인 완료 — 아래 "설계 결정 요약" 1번 참고).

Base UI `Button`은 서브파츠 없는 단일 엘리먼트 primitive라 compound 구조를 두지 않는다. Button과 동일한 primitive다.

Figma: [BizSched / design 캔버스 — btn_text](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=105-196628&m=dev) (`105:196628`)

## 설계 결정 요약

| 결정                  | 선택                                                       | 근거                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 라벨                  | `children` prop으로 임의 텍스트 허용                       | Figma 인스턴스 4개가 모두 "삭제"로 고정되어 있어 하드코딩할지 `children`으로 받을지 판단이 필요했다. 사용자 확인 결과 `children` prop으로 결정 — Button과 동일하게 텍스트를 호출부에서 주입한다                                                                                                                                 |
| 색상                  | `warning/500` 고정, `hierarchy` variant 없음               | Figma에 색상 variant가 하나뿐이라 Button의 `hierarchy`(primary/secondary/tertiary) 같은 축을 두지 않는다. 다른 색상 텍스트 버튼이 필요해지면 그때 variant를 추가한다                                                                                                                                                            |
| `state` 처리          | prop 없이 `hover:` pseudo-class                            | Figma의 `state=default/active`가 명칭상 hover처럼 보이지 않지만(마우스 오버 시각 상태), 실제 트리거는 마우스 오버 액션이다. 사용자 확인 결과 Button과 동일 방침(prop 대신 pseudo-class)으로 결정                                                                                                                                |
| hover 시 배경 padding | 기본 상태에도 `p-px`를 항상 적용, `hover:`는 배경색만 토글 | Figma는 `default`에 padding이 없고 `active`에만 `p-px`가 생겨 그대로 구현하면 hover 시 padding 1px만큼 레이아웃이 흔들린다. Button이 border를 항상 렌더하고 색상만 hover로 바꾸는 패턴과 동일한 원칙으로, padding을 상시 적용해 시프트를 없앴다(시각적으로는 배경이 없으면 padding이 보이지 않아 Figma 기본 상태와 차이가 없다) |
| 너비                  | 고정폭 없음, 텍스트 길이에 맞춰 자동                       | Figma 인스턴스 너비가 텍스트 길이에 따라 가변이다(라벨이 고정값이 아니므로 Button처럼 픽셀 고정폭을 둘 수 없다). `truncate` 처리도 하지 않는다                                                                                                                                                                                  |
| 아이콘                | prop 없음                                                  | Figma `btn_text`에 아이콘이 없다. 필요해지면 Button의 `icon` prop 패턴을 그대로 가져온다                                                                                                                                                                                                                                        |
| disabled              | 미지원                                                     | Figma `btn_text`에 disabled variant가 없어 시각 스펙이 없다. `disabled` prop 자체를 막지는 않지만(네이티브 `button` 속성 상속) 전용 스타일은 만들지 않는다. 실제 사용처가 생기면 Figma 확인 후 추가한다                                                                                                                         |

## 레이어 구조

```
src/components/_common/TextButton/TextButton.tsx
```

[ui-component.md](../../convention/ui-component.md)의 배치 기준과 [Button의 레이어 구조](../button/README.md#레이어-구조) 결정을 그대로 따라 단일 파일로 둔다. shadcn CLI 생성물이 아니라 Base UI `Button`을 직접 감싼다 — shadcn에는 텍스트 전용 버튼 템플릿이 없고, Figma 쪽도 색상 하나짜리 단순 컴포넌트라 Button처럼 CLI로 받은 뒤 커스텀할 이유가 없다.

## API

```tsx
import { TextButton } from '@components/_common/TextButton/TextButton';

<TextButton>삭제</TextButton>
<TextButton size="small">삭제</TextButton>
```

`TextButtonProps`는 Base UI `ButtonPrimitive.Props`를 그대로 확장하므로 `onClick`·`type` 등 네이티브 `button` 속성을 별도 배선 없이 받는다. `size` 미지정 시 `large`가 기본값이다. `disabled`는 타입상 막지 않았지만(네이티브 `button` 속성 상속), 아래 "접근성"에 적은 대로 지금은 지원 대상이 아니다 — 실사용처가 생기면 별도 설계로 확정한다.

## variant (cva)

| 축     | 값      | 매핑                |
| ------ | ------- | ------------------- |
| `size` | `large` | `text-sm leading-5` |
|        | `small` | `text-xs leading-4` |

`defaultVariants`는 `size: 'large'`.

공통 base 클래스: `inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[0.25rem] p-px font-medium text-warning-500 whitespace-nowrap outline-none transition-colors hover:bg-primary-100 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed`.

## 디자인 토큰 매핑

### 일치

| Figma 변수       | 값        | 코드 토큰                              | 용도                         |
| ---------------- | --------- | -------------------------------------- | ---------------------------- |
| `warning/500`    | `#ff4242` | `--color-warning-500`                  | 텍스트 색상(기본·hover 공통) |
| `primary/100`    | `#fff9ed` | `--color-primary-100`                  | hover 배경                   |
| `text-sm/medium` | 14px      | `text-sm` (500 weight은 `font-medium`) | `large` 사이즈 타이포그래피  |
| `text-xs/medium` | 12px      | `text-xs` (500 weight은 `font-medium`) | `small` 사이즈 타이포그래피  |

Figma variable API로 조회한 두 스타일 모두 `letterSpacing: 0`이라 Button과 달리 `tracking-*` 인라인 값을 추가하지 않는다. line-height(`large` 20px·`small` 16px)는 Tailwind `text-sm`/`text-xs` 기본 line-height와 일치해 별도 커스텀 값 없이 `leading-5`/`leading-4`로 명시했다.

### 불일치 — 토큰 없이 하드코딩됨

| 용도              | Figma 값 | 코드                | 비고                                                                                                                                                                                                                                                                                                                                                          |
| ----------------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hover 배경 radius | `4px`    | `rounded-[0.25rem]` | 코드의 `--radius-sm`(6px) 등 기존 radius 스케일과 값이 맞지 않아 재사용 불가. px 대신 다른 arbitrary 값과 마찬가지로 rem으로 하드코딩. Button의 하드코딩 컬러(`#bbbbbb` 등)와 같은 성격의 불일치이며, [이슈 #51 "[Design] Figma Token 불일치 문제"](https://github.com/BizSched/Frontend/issues/51)에서 함께 추적한다 — 별도 "확인 필요" 항목으로 두지 않는다 |

## 접근성

- Base UI `Button`이 네이티브 `button`의 기본 동작(역할)을 담당한다.
- base 클래스는 [Button과 동일하게](../button/README.md#접근성) `outline-none` 대신 `focus-visible:ring-3 focus-visible:ring-ring/50`으로 포커스 스타일을 대체한다.
- 텍스트만으로 구성되어 `icon` 전용 조합이 없으므로 Button의 "확인 필요 2번"(아이콘 전용 `aria-label`)과 무관하다.
- **disabled 상태는 지원하지 않는다.** Figma `btn_text`에 disabled variant가 없어 시각·상호작용 스펙 자체가 없다. `disabled:pointer-events-none disabled:cursor-not-allowed`는 Button 등 다른 버튼 계열과 동일하게 상속되는 기본 클래스일 뿐, TextButton을 위해 설계된 disabled 스타일이 아니다. 실제 disabled 사용처가 생기면 그때 Figma 디자인부터 확인한다.

## 렌더링 경계

`TextButton.tsx`에는 `"use client"`가 없다. [rendering.md 4항](../../architecture/rendering.md#4-ui-primitive의-클라이언트-경계는-전염되지-않는다)에 따라, Base UI `Button`을 감싼 이 파일이 자체적으로 상태·이벤트 핸들러를 선언하지 않는 한 클라이언트 경계를 선언할 필요가 없다. Server Component가 `<TextButton>`을 렌더링해도 부모는 Client Component가 되지 않는다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다. [Button과 동일한 순차 전략](../button/README.md#단계별-pr-계획)으로, 설계+구현(`feat/common-text-button`)이 `dev`에 머지된 뒤 테스트를 별도 PR(`feat/common-text-button-test`)로 분리한다.

```
test/components/_common/TextButton/TextButton.test.tsx
```

| 대상    | 검증                                              |
| ------- | ------------------------------------------------- |
| variant | `size`별 클래스 적용                              |
| 접근성  | `role="button"`, `focus-visible:ring-*` 적용 여부 |

## 단계별 PR 계획

[Button 문서의 "버튼 계열 컴포넌트 분리"](../button/README.md#버튼-계열-컴포넌트-분리) 1차 그룹(`IconButton`·`TextButton`·`SelectButton`·드롭다운 트리거, 서로 의존 없이 병렬 진행)에 속한다. 현재 브랜치(`feat/common-text-button`)에서 설계 문서 + `size` 구현을 함께 진행하고, 테스트는 위 "테스트 전략"대로 별도 PR로 분리한다.

| 단계 | 브랜치                         | 내용                    | 상태    |
| ---- | ------------------------------ | ----------------------- | ------- |
| 1/2  | `feat/common-text-button`      | 설계 문서 + `size` 구현 | 진행 중 |
| 2/2  | `feat/common-text-button-test` | Vitest 테스트           | 예정    |

## 확인 필요

현재 열려 있는 항목은 없다. 이전에 남겨두었던 두 가지는 아래처럼 정리했다.

- 하드코딩된 radius의 토큰화 여부: 새 "확인 필요"로 남기지 않고 [이슈 #51 "[Design] Figma Token 불일치 문제"](https://github.com/BizSched/Frontend/issues/51)에서 Button의 하드코딩 컬러와 함께 추적한다("디자인 토큰 매핑 — 불일치" 참고). 값 표기는 px 대신 rem(`rounded-[0.25rem]`)으로 통일했다.
- disabled 상태: 지원하지 않는 것으로 결정했다("접근성" 참고). Figma에 disabled variant가 생기면 그때 설계를 추가한다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 목표: [convention/accessibility.md](../../convention/accessibility.md)
- 형제 컴포넌트 설계: [component/button/README.md](../button/README.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
