# Toast 컴포넌트 설계

저장·삭제·오류 같은 작업 결과를 화면을 막지 않고 알려주는 공통 Toast를 만들기 위한 설계 문서다. 구현은 이 문서를 단일 출처로 삼는다.

## 개요

Toast는 사용자의 흐름을 멈추지 않는 **비차단 피드백**이다. 모달(확인을 강제)과 달리 일정 시간 뒤 스스로 사라지며, 여러 개가 쌓일 수 있다.

Figma에는 Toast 디자인이 **연결되어 있지 않다.** 따라서 shadcn/ui 공식 기본 디자인을 그대로 쓴다 (확정). 디자인이 생기면 별도 이슈로 반영한다.

## 설계 결정 요약

| 결정            | 선택                                                                  | 근거                                                                                                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 기반 라이브러리 | `sonner` (shadcn/ui의 toast)                                          | 큐·타이머·스와이프 닫기·`aria-live`를 제공한다. 직접 구현하면 [accessibility.md](../../convention/accessibility.md)의 WCAG 2.1 AA 목표 달성 비용이 크다 (사용자 결정)                                                                       |
| overlay-kit     | **사용하지 않음**                                                     | Sonner가 자체 상태를 가지므로 modal의 overlay-kit 목록에 들어오지 않는다. 아래 "overlay-kit을 쓰지 않는 이유" 참고                                                                                                                          |
| 파일 위치       | `src/components/_common/Toast/Toaster.tsx` 한 파일                    | `_common/ui/`는 CLI 생성물 전용이고, 생성 파일명(`sonner.tsx`)은 [naming.md](../../convention/naming.md)의 `Name.tsx` 규칙과 충돌한다. [modal 문서](../modal/README.md)의 "`shadcn add dialog` 검증 결과"와 같은 이유로 `ui/`에 두지 않는다 |
| 마운트          | `app/layout.tsx`에 `<Toaster />` 1회                                  | 앱 어디서든 `toast()`로 호출하려면 전역에 하나만 있어야 한다. 2번 마운트하면 같은 toast가 2번 뜬다                                                                                                                                          |
| variant         | sonner 내장 5종 그대로 (`success`·`error`·`info`·`warning`·`loading`) | 직접 추리지 않는다. 필요가 생기면 확인 후 확장                                                                                                                                                                                              |
| 테마            | `light` 고정                                                          | 생성물이 쓰는 `next-themes`가 이 저장소에 없고 도입 근거도 없다                                                                                                                                                                             |

### overlay-kit을 쓰지 않는 이유

| 안          | 장점                                                   | 단점                                                                                                   |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Sonner**  | 큐·스택 레이아웃·스와이프·a11y 제공, modal과 상태 분리 | 의존성 1개 증가, 스타일을 Sonner 구조에 맞춰야 함                                                      |
| overlay-kit | 의존성 증가 없음                                       | modal과 오버레이 목록을 공유해 `stackIndex`가 오염됨 → 스코프 분리 선행 필요, 큐·타이머·a11y 직접 구현 |

toast가 overlay-kit 목록에 들어올 때만 모달의 `stackIndex`가 오염된다. Sonner는 그 목록을 쓰지 않으므로 스코프 분리 설계는 폐기했다 ([modal 문서](../modal/README.md)).

## 레이어 구조

```
src/components/_common/Toast/
└── Toaster.tsx     # shadcn sonner 생성물을 저장소 컨벤션에 맞게 재구성 + toast re-export

app/layout.tsx      # <Toaster /> 1회 마운트
```

호출부는 `@components/_common/Toast/Toaster`에서 `toast`만 import한다. 별도 `index.ts` 배럴은 두지 않는다 ([code-style.md](../../convention/code-style.md)).

재구성 시 생성물에서 바꾸는 것:

- `next-themes`의 `useTheme` 제거, `theme="light"` 고정
- `cn`을 `@lib/utilities/cn`에서 import
- 아이콘은 `lucide-react` 직접 import
- 이 저장소에서 생성되지 않는 `sm:` `md:` 반응형 클래스 제거 ([style.md](../../convention/style.md)의 `--breakpoint-*: initial`)

## API

```tsx
// app/layout.tsx — <body> 안에서 한 번만
<Toaster />
```

```tsx
// 호출부
import { toast } from '@components/_common/Toast/Toaster';

toast.success('저장되었습니다');
toast.error('저장에 실패했습니다');
```

### 호출 규약 — 반복 호출은 `id`로 교체한다

버튼을 연타하면 같은 toast가 쌓인다. **같은 의미의 toast는 같은 `id`를 넘겨 교체한다.**

```tsx
toast.success('저장되었습니다', { id: 'schedule-saved' });
```

## variant

`cva` 축을 만들지 않는다. sonner 내장 타입을 그대로 쓴다.

| 호출            | 용도                              |
| --------------- | --------------------------------- |
| `toast.success` | 작업 성공                         |
| `toast.error`   | 작업 실패                         |
| `toast.info`    | 안내                              |
| `toast.warning` | 주의                              |
| `toast.loading` | 진행 중 (직접 닫거나 `id`로 갱신) |

## 디자인 토큰 매핑

shadcn 기본 스타일이 참조하는 CSS 변수가 저장소에 있는지 확인했다 (`src/assets/styles/theme.css`).

### 일치 (그대로 사용)

| 변수                   | 라이트 값           |
| ---------------------- | ------------------- |
| `--popover`            | `--color-white-50`  |
| `--popover-foreground` | `--color-slate-900` |
| `--border`             | `--color-white-700` |
| `--radius`             | `0.625rem`          |

### 신설 / 불일치

없음 (구현 후 실측으로 확인 — 달라지면 이 표를 먼저 고친다).

### 참고 — z-index

저장소에는 `--z-popover: 2000`, modal `--z-modal-base: 1000`이 있다. Sonner는 자체 z-index를 가지므로 모달 위에 보이는지는 구현 후 실측한다 (아래 "확인 필요").

## 접근성

- Sonner가 `aria-live` 영역으로 메시지를 읽어준다. 별도 `aria` 속성을 덧붙이지 않는다.
- 키보드로 toast 영역에 포커스를 옮겨 닫을 수 있어야 한다 (Sonner 내장 동작 — 구현 후 확인).
- `prefers-reduced-motion`에서 애니메이션이 과하지 않은지 구현 후 확인한다.
- **모달이 열린 상태**에서 toast가 보이고 닫기·액션이 눌려야 한다. Base UI `Dialog`(modal)는 바깥 요소를 inert 처리할 수 있어 미검증이다 → "확인 필요".

## 렌더링 경계

[rendering.md](../../architecture/rendering.md)의 `"use client"` 트리거 4(클라이언트 런타임 의존 — sonner 상태·DOM 이벤트)에 해당해 `Toaster.tsx` 최상단에 `'use client'`를 둔다.

- `app/layout.tsx`는 Server Component로 남는다. 클라이언트 경계는 `Toaster.tsx`에서 시작되고 layout으로 전염되지 않는다.
- `<Toaster />`는 **전역 1회**만 마운트한다. 중복 마운트 시 toast가 2번 뜬다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다.

```
test/components/_common/Toast/Toaster.test.tsx
```

| 대상           | 검증                                                             | 보호하는 위험                         |
| -------------- | ---------------------------------------------------------------- | ------------------------------------- |
| 표시           | `toast.success('…')` 호출 후 메시지가 화면에 나타난다            | 마운트·re-export가 깨져 toast가 안 뜸 |
| 같은 `id` 교체 | 같은 `id`로 두 번 호출하면 이전 문구가 사라지고 새 문구만 남는다 | 연타 시 toast가 쌓이는 회귀           |

Sonner 내부 동작(큐·스와이프·타이머)은 라이브러리 책임이라 테스트하지 않는다. 모달 위 표시와 모바일 폭은 jsdom이 못 잡으므로 수동 확인한다.

## 단계별 PR 계획

GitHub [stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)로 진행한다. 각 브랜치는 바로 아래 브랜치를 base로 하고, 맨 아래만 `dev`를 향한다. 아래부터 Merge commit으로 병합하면 남은 PR의 base가 자동으로 리타깃된다. 중간 브랜치를 수정하면 `gh stack rebase --upstack`으로 위쪽에 전파한다.

| 순서 | 브랜치                          | base                       | 내용                                                                               |
| ---- | ------------------------------- | -------------------------- | ---------------------------------------------------------------------------------- |
| 1/4  | `feat/common-toast`             | `dev`                      | **이 설계 문서** + `component/README.md`·`docs/README.md` 인덱스 + modal 문서 정합 |
| 2/4  | `feat/common-toast-ui`          | `feat/common-toast`        | `sonner` 도입 + `Toaster.tsx` + layout 마운트 + 테스트                             |
| 3/4  | `feat/common-toast-design`      | `feat/common-toast-ui`     | 기본 디자인 토큰·반응형 점검 (변경이 있을 때만)                                    |
| 4/4  | `feat/common-toast-docs-result` | `feat/common-toast-design` | 이 문서에 실측 결과 반영, 상태를 `구현 완료`로 갱신                                |

### PR 제목

[pr-flow.md](../../collaboration/pr-flow.md)의 `[커밋 타입 대문자-#이슈번호] 한글 요약` 형식에 **단계 `[n/4]`** 를 요약 앞에 붙인다. 이슈는 `#226`.

| 순서 | 제목                                                         |
| ---- | ------------------------------------------------------------ |
| 1/4  | `[FEAT-#226] [1/4] 공통 컴포넌트 토스트 문서 작성`           |
| 2/4  | `[FEAT-#226] [2/4] 공통 컴포넌트 토스트 구현`                |
| 3/4  | `[FEAT-#226] [3/4] 공통 컴포넌트 토스트 디자인 점검`         |
| 4/4  | `[FEAT-#226] [4/4] 공통 컴포넌트 토스트 구현 결과 문서 반영` |

3/4는 디자인 점검에서 변경이 없으면 PR을 만들지 않는다. 그 경우 4/4를 3/3으로 바꾸고 총 개수 표기를 함께 갱신한다.

> **참고**: stacked pull requests는 GitHub public preview 기능이다.

## 확인 필요

아래 항목은 **임의로 확정하지 않는다.** 확인 후 이 문서에 반영한다.

### 1. 모달 위 toast (미검증)

모달이 열린 상태에서 `toast.error()`를 호출했을 때 toast가 모달 위에 보이고, 닫기·액션이 눌리는지 확인되지 않았다. 구현 후 실측해 "접근성" 절과 이 항목을 갱신한다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- Modal 설계(overlay-kit): [component/modal/README.md](../modal/README.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
