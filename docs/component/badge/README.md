# Badge 컴포넌트 설계

## 개요

짧은 라벨로 상태·분류를 표시하는 pill 형태의 표시용 컴포넌트다. Figma 컴포넌트 셋은 `color(gray/green/yellow/red/purple) × delete(true/false)` 10개 인스턴스로 구성되어 있다. 코드는 `color` 1축 cva variant로 대응하고, `delete=true`(× 버튼)는 이번 범위에서 제외한다.

상호작용이 없는 단일 엘리먼트라 compound 구조와 Base UI primitive를 두지 않는다.

Figma: [BizSched — Badge](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-70335&m=dev) (`71:70335`)

| 인스턴스                        | 노드          |
| ------------------------------- | ------------- |
| `color=gray`, `delete=false`    | `71:70359`    |
| `color=green`, `delete=false`   | `71:70354`    |
| `color=yellow`, `delete=false`  | `71:70349`    |
| `color=red`, `delete=false`     | `71:70344`    |
| `color=purple`, `delete=false`  | `71:70339`    |
| `color=*`, `delete=true` (각색) | `71:70336` 외 |

## 설계 결정 요약

| 결정         | 선택                                               | 근거                                                                                                                |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 범위         | 표시용(`delete=false`)만 구현                      | 현재 사용처(아르바이트생 재직 상태)가 표시용이다. × 버튼은 클릭 동작·접근성 이름이 필요해 사용처가 생길 때 설계한다 |
| variant 축   | `color` 하나, 기본값 `gray`                        | Figma 축 이름을 그대로 쓴다. 기본값은 Figma 컴포넌트 셋 기본값(`gray`)을 따른다                                     |
| 라벨         | `children`                                         | Figma의 `Label`은 예시 라벨이다                                                                                     |
| 엘리먼트     | `span`                                             | 문장·제목 옆에 붙는 인라인 표시 요소다. 의미 있는 role이 없어 별도 ARIA를 두지 않는다                               |
| `color` 충돌 | `span`의 HTML `color` 속성을 타입에서 제외         | variant 이름을 Figma와 맞추기 위해서다. HTML `color` 속성은 `span`에서 쓰이지 않는다                                |
| 너비         | 고정폭 없음, 라벨 길이에 맞춤. `whitespace-nowrap` | Figma 인스턴스가 라벨 길이에 따라 가변이고 줄바꿈이 없다                                                            |

## 레이어 구조

```
src/components/_common/Badge/Badge.tsx
```

[ui-component.md](../../convention/ui-component.md)의 배치 기준에 따라 단일 파일로 둔다.

## API

```tsx
import { Badge } from '@components/_common/Badge/Badge';

<Badge>Label</Badge>
<Badge color="yellow">휴직</Badge>
```

`BadgeProps`는 `span` 속성(`color` 제외)을 확장하므로 `className`·`aria-*` 등을 그대로 받는다.

## variant (cva)

| 축      | 값       | 매핑                                           |
| ------- | -------- | ---------------------------------------------- |
| `color` | `gray`   | `border-[#e9eaeb] bg-[#fafafa] text-[#414651]` |
|         | `green`  | `border-[#abefc6] bg-[#ecfdf3] text-[#067647]` |
|         | `yellow` | `border-[#fedf89] bg-[#fffaeb] text-[#b54708]` |
|         | `red`    | `border-[#fecdca] bg-[#fef3f2] text-[#b42318]` |
|         | `purple` | `border-[#e9d7fe] bg-[#f9f5ff] text-[#6941c6]` |

공통 base 클래스: `inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-center text-xs leading-4 font-medium whitespace-nowrap`.

## 디자인 토큰 매핑

### 일치

| Figma 변수            | 값             | 코드                            | 용도      |
| --------------------- | -------------- | ------------------------------- | --------- |
| `radius-full`         | `9999px`       | `rounded-full`                  | pill 모양 |
| `text-xs/font-medium` | 12px/16px, 500 | `text-xs leading-4 font-medium` | 라벨      |
| padding               | 8px / 4px      | `px-2 py-1`                     | 라벨 여백 |

`letterSpacing`이 0이라 `tracking-*`을 두지 않는다.

### 불일치 — 토큰 없이 하드코딩됨

Figma는 `component-colors/utility/{gray,success,warning,error,brand}` 변수를 쓰지만, 코드의 [colors.css](../../../src/assets/styles/colors.css)에는 같은 값의 토큰이 없다. 프로젝트의 `warning` 계열(`#ff4242` 등)도 Figma의 `utility/warning`(노랑)과 이름만 같고 색이 다르다. 그래서 [TextButton](../TextButton/README.md#불일치--토큰-없이-하드코딩됨)·DatePicker와 같이 HEX를 하드코딩하고, [이슈 #51 "[Design] Figma Token 불일치 문제"](https://github.com/BizSched/Frontend/issues/51)에서 함께 추적한다.

| `color`  | Figma 변수 (배경 / 테두리 / 텍스트)    | 값                                |
| -------- | -------------------------------------- | --------------------------------- |
| `gray`   | `utility-gray-50` / `-200` / `-700`    | `#fafafa` / `#e9eaeb` / `#414651` |
| `green`  | `utility-success-50` / `-200` / `-700` | `#ecfdf3` / `#abefc6` / `#067647` |
| `yellow` | `utility-warning-50` / `-200` / `-700` | `#fffaeb` / `#fedf89` / `#b54708` |
| `red`    | `utility-error-50` / `-200` / `-700`   | `#fef3f2` / `#fecdca` / `#b42318` |
| `purple` | `utility-brand-50` / `-200` / `-700`   | `#f9f5ff` / `#e9d7fe` / `#6941c6` |

## 접근성

- 텍스트 라벨만 표시하므로 스크린리더에 라벨이 그대로 읽힌다.
- 색만으로 의미를 전달하지 않는다. 상태 구분은 라벨 텍스트가 맡고 색은 보조다 ([accessibility.md](../../convention/accessibility.md)).
- 모든 `color`의 텍스트(700)와 배경(50) 대비는 WCAG AA(4.5:1) 이상이다.

## 렌더링 경계

`Badge.tsx`에는 `"use client"`가 없다. 상태·이벤트 핸들러가 없어 Server Component에서 그대로 렌더링된다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다. 다른 공통 컴포넌트와 같이 설계+구현이 `dev`에 머지된 뒤 테스트를 별도 PR로 나눈다.

```
test/components/_common/Badge/Badge.test.tsx
```

| 대상    | 검증                                 |
| ------- | ------------------------------------ |
| variant | `color`별 클래스 적용, 기본값 `gray` |
| 렌더링  | `children` 라벨, `className` 병합    |

## 단계별 PR 계획

| 단계 | 브랜치                   | 내용                     | 상태    |
| ---- | ------------------------ | ------------------------ | ------- |
| 1/2  | `feat/common-badge`      | 설계 문서 + `color` 구현 | 진행 중 |
| 2/2  | `feat/common-badge-test` | Vitest 테스트            | 예정    |

## 확인 필요

- `delete=true`(× 버튼) 인스턴스: 사용처가 생기면 클릭 동작(`onDelete`), 접근성 이름, × 아이콘 에셋을 정해 추가한다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 목표: [convention/accessibility.md](../../convention/accessibility.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
