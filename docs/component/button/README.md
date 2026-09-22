# Button 컴포넌트 설계

## 개요

프로젝트 전역에서 쓰는 단일 액션 트리거(버튼) 컴포넌트다. Figma 컴포넌트 셋은 `hierarchy(primary/secondary/tertiary) × state(default/hover/disabled) × size(large/medium/small)` 27개 인스턴스로 구성되어 있고, 코드도 같은 2축(`hierarchy`, `size`) cva variant로 대응한다. `state`는 별도 prop이 아니라 `disabled` 속성과 `hover:` pseudo-class로 처리한다.

Base UI `Button`은 서브파츠 없는 단일 엘리먼트 primitive라 compound 구조를 두지 않는다.

Figma: [BizSched / design 캔버스 — Button](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-70665&m=dev) (`71:70665`)

## 설계 결정 요약

| 결정           | 선택                                                                         | 근거                                                                                                                                                                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 기반 산출물    | `shadcn` CLI 생성물(`pnpm dlx shadcn@latest add button`, style: `base-nova`) | [tech-stack.md](../../architecture/tech-stack.md)·[ui-component.md](../../convention/ui-component.md)의 "기본 UI는 Shadcn/ui 기반" 규칙을 따름. `components.json`의 테마 토큰(`--ring`·`--destructive` 등)이 이미 `colors.css` 스케일에 매핑되어 있어 생성물이 바로 프로젝트 토큰으로 렌더링됨 |
| 기반 primitive | Base UI `Button`                                                             | shadcn 생성물도 동일하게 `@base-ui/react/button`을 감싼 구조라 별도 교체 없이 유지. 네이티브 접근성 동작(역할·`disabled`)을 위임하며 `Dialog`와 같은 Base UI 계열로 통일                                                                                                                       |
| variant 축     | `hierarchy`(3) × `size`(3)                                                   | shadcn 생성물의 기본 `variant`/`size` 축(default/outline/... × default/sm/lg/icon...)은 Figma 컴포넌트 셋과 맞지 않아 폐기하고, Figma가 정확히 수렴하는 2축 × 3값(27개 인스턴스)으로 새로 정의. base 클래스의 구조(`data-slot`, `cva`+`cn` 조합)는 생성물 방식을 그대로 따름                   |
| 아이콘         | `icon?: ReactNode` prop, `children` 앞 렌더                                  | shadcn 생성물의 `data-icon` 속성 기반 패턴 대신 채택. 버튼마다 유무가 선택적이라 variant축이 아닌 prop으로 처리                                                                                                                                                                                |
| 구조           | compound 아닌 단일 컴포넌트                                                  | Base UI `Button`이 서브파츠 없는 단일 엘리먼트 primitive이고, Figma 인스턴스도 하나의 노드로 구성됨                                                                                                                                                                                            |

## 레이어 구조

```
src/components/_common/Button/Button.tsx
```

[ui-component.md](../../convention/ui-component.md)의 _"기본 UI는 `_common/<Component>/<Component>.tsx`에서 관리"_ 기준대로 단일 파일로 둔다. `pnpm dlx shadcn@latest add button` 생성물은 `components.json`의 `aliases.ui`(`@components/_common`) 설정에 따라 `_common/` 바로 아래에 생성되며, 이를 이 경로(`Button/Button.tsx`)로 옮겨 커스텀한다. `_common/ui/` 폴더는 사용하지 않는다.

Figma에는 이 외에 모양·역할이 다른 버튼 그룹이 더 있다 — 아이콘 전용 원형 버튼(`btn_social`·`btn_notification`·`btn_action-...`·`btn_read_more`·`btn_d...`), 텍스트 전용 버튼(`btn_text`), 드롭다운 트리거(`btn_change_month`), select/toggle 버튼(`btn_select`). `Button`의 variant로 넣기엔 shape 자체가 달라 `_common/`에 형제 컴포넌트로 분리한다(자세한 내용은 "단계별 PR 계획", "확인 필요" 4번 참고).

## API

```tsx
import { Button } from '@components/_common/Button/Button';

<Button>확인</Button>
<Button hierarchy="secondary" size="medium">취소</Button>
<Button hierarchy="tertiary" size="small" icon={<PlusIcon />}>추가</Button>
<Button disabled>비활성</Button>
```

`ButtonProps`는 Base UI `ButtonPrimitive.Props`를 그대로 확장하므로 `onClick`·`type`·`disabled` 등 네이티브 `button` 속성을 별도 배선 없이 받는다. `hierarchy`·`size` 미지정 시 각각 `primary`·`large`가 기본값이다.

## variant (cva)

| 축          | 값          | 매핑                                                                                                                                               |
| ----------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hierarchy` | `primary`   | `bg-primary-500 text-white-50 hover:bg-secondary-600 disabled:bg-[#bbbbbb]`                                                                        |
|             | `secondary` | `border border-primary-500 text-secondary-600 hover:border-secondary-600 hover:text-primary-500 disabled:border-slate-400 disabled:text-slate-400` |
|             | `tertiary`  | `border border-[#cccccc] text-secondary-300 hover:border-[#bbbbbb] hover:text-accent-300 disabled:border-slate-400 disabled:text-slate-400`        |
| `size`      | `large`     | `h-14 w-[13.9375rem] py-3.5 text-lg leading-7 tracking-[-0.03em]`                                                                                  |
|             | `medium`    | `h-12 w-[11.375rem] py-3 text-base leading-6 tracking-[-0.03em]`                                                                                   |
|             | `small`     | `h-11 w-[8.375rem] py-2.5 text-sm leading-5 tracking-[-0.03em]`                                                                                    |

너비는 Figma 스펙(16px 기준 `large` 223px·`medium` 182px·`small` 134px)을 rem으로 변환한 고정값이다.

`defaultVariants`는 `hierarchy: 'primary'`, `size: 'large'`.

공통 base 클래스: `rounded-full px-[18px] gap-1 font-semibold whitespace-nowrap outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed`. 아이콘은 사이즈 variant와 무관하게 `[&_svg]:size-6`(24px)로 고정한다.

너비가 고정값이라 텍스트가 넘칠 수 있어, base 클래스에 `overflow-hidden`을 두고 텍스트(`children`)는 `<span className="truncate">`로 감싸 말줄임 처리한다. `icon`은 truncate 대상에서 제외해 항상 온전히 렌더된다.

## 디자인 토큰 매핑

### 일치

| Figma 변수                                     | 값         | 코드 토큰                                              | 용도                                               |
| ---------------------------------------------- | ---------- | ------------------------------------------------------ | -------------------------------------------------- |
| `primary/500`                                  | `#ffd98a`  | `--color-primary-500`                                  | primary 배경(default)                              |
| `secondary/600`                                | `#ebddb9`  | `--color-secondary-600`                                | primary 배경(hover) · secondary 텍스트/보더(hover) |
| `white/50`                                     | `#fffffe`  | `--color-white-50`                                     | primary 텍스트                                     |
| `slate/400`                                    | `#6b6a68`  | `--color-slate-400`                                    | secondary·tertiary disabled 텍스트/보더            |
| `accent/300`                                   | `#c3af91`  | `--color-accent-300`                                   | tertiary 텍스트(hover)                             |
| `text-lg/base/sm` (SemiBold, letterSpacing -3) | 18/16/14px | `text-lg`/`text-base`/`text-sm` + `tracking-[-0.03em]` | 사이즈별 타이포그래피                              |

### 불일치 — 토큰 없이 하드코딩됨

Figma 노드별 변수를 직접 조회한 결과, 아래 두 색상은 **같은 변수명(`slate/300`)이 노드마다 다른 값으로 해석**된다(`gray/500`이라는 별도 이름으로도 같은 값이 나온다 — 라이브러리 내부 별칭으로 추정). 코드의 `--color-slate-300`(`#999797`)과도 값이 달라 재사용할 수 없어서 `Button.tsx`는 hex를 직접 하드코딩했다.

| 용도                  | Figma에서 조회된 변수 | 값        | 코드                     | 비고                                                     |
| --------------------- | --------------------- | --------- | ------------------------ | -------------------------------------------------------- |
| primary disabled 배경 | `gray/500`            | `#BBBBBB` | `disabled:bg-[#bbbbbb]`  | `--color-slate-300`(`#999797`)과 다른 값이라 재사용 불가 |
| tertiary 기본 보더    | `slate/300`           | `#CCCCCC` | `border-[#cccccc]`       | 위와 동일한 변수명이지만 다른 노드에서는 다른 값을 반환  |
| tertiary hover 보더   | `slate/300`           | `#BBBBBB` | `hover:border-[#bbbbbb]` | 위와 동일한 변수명이지만 또 다른 값을 반환               |

Modal 설계 문서는 같은 상황(Figma·코드 컬러 불일치)에서 _"컬러는 CSS 토큰 기준(colors.css)"_ 을 확정 방침으로 잡았다([modal/README.md](../modal/README.md#방침--컬러는-css-토큰-기준-확정)). 하지만 이번 경우는 매핑할 기존 토큰 자체가 없어서(`slate-300` 값이 다름) 그 방침을 그대로 적용할 수 없다. 신규 토큰(예: `--color-gray-500`)을 추가할지, 지금처럼 인라인 하드코딩을 유지할지는 "확인 필요"에 남긴다.

### letter-spacing — 인라인 (Modal과 동일 방침)

Modal 설계 문서에서 이미 _"`--tracking-*` 토큰을 신설하지 않고 `tracking-[-0.03em]`을 인라인으로 적용"_ 방침이 확정되었다([modal/README.md](../modal/README.md#방침--letter-spacing은-인라인-확정)). Button도 같은 값(`-0.03em`)을 동일한 방식(인라인)으로 쓰고 있어 일관적이다.

## 접근성

- Base UI `Button`이 네이티브 `button`의 기본 동작(역할, `disabled` 시 상호작용 차단)을 담당한다.
- base 클래스는 `outline-none`으로 기본 아웃라인을 제거하는 대신 `focus-visible:ring-3 focus-visible:ring-ring/50`으로 대체 스타일을 제공한다. `--ring` 토큰은 `theme.css`에서 `--color-primary-500`에 매핑되어 있어 별도 신규 토큰 없이 [accessibility.md](../../convention/accessibility.md)의 "focus 상태 제거 금지" 규칙을 만족한다. shadcn CLI 생성물의 `focus-visible:` 처리를 그대로 채택했다.
- `icon`만 있고 `children`(텍스트)이 없는 조합의 접근 가능한 이름(`aria-label`) 규칙은 아직 없다. 아이콘 전용 버튼 사용처가 생기는 시점에 확정한다.
- disabled 상태는 `disabled:pointer-events-none disabled:cursor-not-allowed`로 시각·인터랙션을 함께 차단한다.

## 렌더링 경계

`Button.tsx`에는 `"use client"`가 없다. [rendering.md 4항](../../architecture/rendering.md#4-ui-primitive의-클라이언트-경계는-전염되지-않는다) _"UI primitive의 클라이언트 경계는 전염되지 않는다"_ 에 따라, Base UI `Button`을 감싼 이 파일이 자체적으로 상태·이벤트 핸들러를 선언하지 않는 한 클라이언트 경계를 선언할 필요가 없다. `onClick` 등은 사용하는 쪽(호출부)에서 주입되는 값이며 `Button.tsx`는 이를 그대로 전달만 한다.

Server Component가 `<Button>`을 렌더링해도 부모는 Client Component가 되지 않는다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다. 구현(`design/common-button`)과 분리해 `feat/common-button-test` 브랜치에서 별도 PR로 진행한다("단계별 PR 계획" 참고).

```
test/components/_common/Button/Button.test.tsx
```

| 대상     | 검증                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| variant  | `hierarchy` × `size` 조합별 클래스 적용                                        |
| 아이콘   | `icon` prop 유무에 따른 렌더                                                   |
| disabled | `disabled` 시 클릭 이벤트가 발생하지 않는지, `pointer-events-none` 적용        |
| 접근성   | `role="button"`, `disabled` 시 상호작용 차단, `focus-visible:ring-*` 적용 여부 |

## 단계별 PR 계획

### `Button` 자체 단계

설계 문서와 구현(`hierarchy × size`)은 같은 PR로 묶되, 테스트는 별도 PR로 분리한다. `design/common-button`(1/2)이 `dev`에 머지된 뒤, `feat/common-button-test`(2/2)는 그 시점의 `dev`를 기준으로 새로 분기한다. 이는 [pr-flow.md](../../collaboration/pr-flow.md)의 기본 Feat Workflow(머지 후 분기)를 두 차례 순서대로 적용하는 **순차(sequential) 전략**이며, 아래 "버튼 계열 컴포넌트 분리"의 stacked PR과는 다른 방식이다 — 테스트가 설계/구현 완료를 전제로 하므로 병렬 진행할 이유가 없어 순차로 정했다.

| 단계 | 브랜치                    | 내용                                | 상태                 |
| ---- | ------------------------- | ----------------------------------- | -------------------- |
| 1/2  | `design/common-button`    | 설계 문서 + `hierarchy`×`size` 구현 | 구현 완료, 병합 대기 |
| 2/2  | `feat/common-button-test` | Vitest 테스트                       | 예정                 |

### 버튼 계열 컴포넌트 분리

Figma의 나머지 버튼 그룹(아이콘 전용·텍스트 전용·드롭다운 트리거·select)은 `Button`과 별도 컴포넌트로 분리하고, 컴포넌트별 stacked PR로 순차 진행한다. 각 컴포넌트도 위와 같이 구현/테스트 PR을 나눈다.

| 순서 | 컴포넌트(가칭)        | Figma 레이어                                                                    | 상태                 |
| ---- | --------------------- | ------------------------------------------------------------------------------- | -------------------- |
| 1    | `Button`              | hierarchy × size (27 instances)                                                 | 구현 완료, 병합 대기 |
| 2    | `IconButton`          | `btn_social`, `btn_notification`, `btn_action-...`, `btn_read_more`, `btn_d...` | 확인 필요            |
| 3    | `TextButton`          | `btn_text`                                                                      | 확인 필요            |
| 4    | 드롭다운 트리거(가칭) | `btn_change_month`                                                              | 확인 필요            |
| 5    | `SelectButton`(가칭)  | `btn_select`                                                                    | 확인 필요            |

정확한 컴포넌트명·variant 범위·PR 순서는 확정된 게 아니라 "확인 필요" 4번 항목에 남긴다.

## 확인 필요

아래 항목은 **임의로 확정하지 않는다.** 확인 후 이 문서에 반영한다.

### 1. 하드코딩된 `#bbbbbb`/`#cccccc`의 토큰화 여부

"디자인 토큰 매핑 — 불일치" 참고. Figma의 `gray/500`/`slate/300`(`#BBBBBB`, `#CCCCCC`)에 대응하는 코드 토큰이 없다. 신규 토큰을 추가할지, 지금처럼 `Button.tsx`에 hex를 직접 쓸지 확인이 필요하다.

### 2. 아이콘 전용 버튼의 `aria-label` 규칙

`children` 없이 `icon`만 쓰는 조합이 아직 없어 접근 가능한 이름을 어떻게 강제할지(props 필수화 등) 미정이다.

### 3. 아이콘-텍스트 간격 값

Figma에서 조회된 `spacing-xxs` 값(2)과 코드의 `gap-1`(4px)이 일치하는지 육안 비교만으로는 확정할 수 없었다. 픽셀 단위 검증이 필요하다.

### 4. 아이콘 전용/텍스트 전용/드롭다운/select 버튼의 컴포넌트 분리 범위

Figma의 `btn_social`·`btn_notification`·`btn_action-...`·`btn_read_more`·`btn_d...`·`btn_text`·`btn_change_month`·`btn_select` 그룹을 몇 개의 컴포넌트로 나눌지, 각 컴포넌트 이름·variant 축·PR 순서가 아직 미정이다("단계별 PR 계획" 참고). `button-group`(취소/확인 쌍)은 기존 `Button`을 그대로 배치한 것으로 보여 별도 컴포넌트가 필요 없어 보이지만, 이 판단도 확인이 필요하다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 목표: [convention/accessibility.md](../../convention/accessibility.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
