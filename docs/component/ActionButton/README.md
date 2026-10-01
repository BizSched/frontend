# ActionButton 컴포넌트 설계

`+` 버튼을 누르면 위쪽으로 보조 액션 버튼들이 펼쳐지는 플로팅 액션 버튼(speed dial)이다. `Button`·`IconButton`과 겹치는 내용(`cva`/`cn` 공통 규칙, `aria-label` 타입 필수화 등)은 반복하지 않고 [button/README.md](../button/README.md)·[IconButton/README.md](../IconButton/README.md)를 참조한다. 이 문서는 ActionButton에서 **새로 결정한 것·결정해야 하는 것**만 다룬다.

## 개요

| Figma 프레임                                    | 노드 ID      | variant                  | 크기(W×H) |
| ----------------------------------------------- | ------------ | ------------------------ | --------- |
| `btn_action-매출 카테고리, 오늘 매출 추가 액션` | `114:211449` | 컴포넌트 셋              | -         |
| └ `state=기본`                                  | `114:211448` | 메인 `+` 버튼만          | 56×56     |
| └ `state=active`                                | `114:211450` | 보조 버튼 4개 + 메인 `+` | 56×232    |

Figma: [BizSched / btn_action](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=114-211449&m=dev)

`state=active`의 구성(위 → 아래):

| 순서 | 요소      | 지름 | Figma 아이콘      | 배경          | 그림자 |
| ---- | --------- | ---- | ----------------- | ------------- | ------ |
| 1    | 보조 버튼 | 40px | `ic_category-add` | `slate/50`    | 있음   |
| 2    | 보조 버튼 | 40px | `ic_library`      | `slate/50`    | 있음   |
| 3    | 보조 버튼 | 40px | `ic_link`         | `slate/50`    | 있음   |
| 4    | 보조 버튼 | 40px | `ic_pencil`       | `slate/50`    | 있음   |
| 5    | 메인 버튼 | 56px | `ic_plus`         | `primary/500` | 있음   |

요소 간 간격은 4px, 보조 버튼은 메인 버튼 기준 가운데 정렬된다(4×40 + 4×4 + 56 = 232px). `state=기본`의 메인 버튼에는 그림자가 **없다**.

**모바일 전용 컴포넌트**라 크기는 Figma의 한 가지만 두고 반응형 variant를 만들지 않는다.

Figma 예시의 보조 액션 4개(매출 카테고리 추가 등)는 사용처 하나의 예시일 뿐이다. 공통 컴포넌트는 액션의 개수·아이콘·의미를 정의하지 않고, 사용하는 쪽이 상황에 맞게 `actions`로 설정한다.

### 기존 문서와 다른 점

[button/README.md](../button/README.md#버튼-계열-컴포넌트-분리)는 ActionButton이 "`IconButton` 여러 개를 내부에서 재사용"한다고 가정했지만, `get_design_context`로 조회한 보조 버튼은 **40px · `slate/50` 배경 · 보더 없음 · 그림자**로 `IconButton/` 4개 컴포넌트 어느 것과도 스타일이 맞지 않는다(가장 가까운 `ReadMoreButton`도 40px지만 `#fffffe` 배경 + `#c6c5c5` 보더다). 따라서 **컴포넌트는 재사용하지 않고, 공유 shape 상수 `ICON_BUTTON_BASE_CLASSNAME`만 재사용**한다.

## 설계 결정 요약

| 결정              | 선택                                                                                                | 근거                                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 기반 primitive    | Base UI `Menu` (`Menu.Trigger` = 메인 버튼, `Menu.Item` = 보조 버튼)                                | 확정된 닫힘 동작(Esc·바깥 클릭으로 닫힘, 액션 선택 후 자동 닫힘)을 `Menu`가 기본 제공한다(`closeOnClick` 기본 `true`). 포커스 이동·방향키 탐색·`aria-expanded`도 함께 따라와 직접 구현할 필요가 없다               |
| dim               | 없음 — `Menu.Backdrop`을 렌더하지 않음                                                              | 확정 사항. `modal`은 기본값(`true`)을 유지한다. 터치 기기에서는 바깥 탭이 뒤쪽 요소를 누르지 않고 메뉴만 닫는다(Base UI 문서 기준)                                                                                 |
| 보조 액션 구성    | 컴포넌트가 액션을 정의하지 않고 `actions` 배열 prop으로 받음                                        | 확정 사항. `_common/`은 도메인을 몰라야 하고, 사용처마다 액션의 개수·아이콘·동작이 다를 수 있다                                                                                                                    |
| 아이콘            | `lucide-react`. 메인 `+`는 `PlusIcon`, 보조 아이콘은 사용하는 쪽이 `ReactNode`로 전달               | IconButton 아이콘의 lucide 전환은 별도 이슈로 분리하기로 확정됐다. ActionButton은 아직 구현 전이라 처음부터 lucide를 쓰면 전환 대상이 늘지 않는다. `lucide-react`는 이미 의존성이고 Modal·Pagination이 사용 중이다 |
| 공유 shape        | `@components/_common/IconButton/iconButtonBase`의 `ICON_BUTTON_BASE_CLASSNAME` 재사용               | 원형·focus-visible·disabled 규칙이 IconButton 계열과 같다. 단일 출처 유지                                                                                                                                          |
| 열림 상태 스타일  | prop·`cva` 축 없이 Base UI의 `data-popup-open` 속성으로 처리                                        | 열림에 따라 바뀌는 스타일은 메인 버튼의 그림자·아이콘 회전뿐이다. 열림 상태는 `Menu.Root`가 갖고 있으므로 이를 다시 prop으로 받아 `cva`에 넘기지 않는다                                                            |
| 열림 상태 관리    | uncontrolled 기본 + `open`/`defaultOpen`/`onOpenChange`를 `Menu.Root`로 그대로 전달                 | 대부분은 단순 토글로 충분하고, 다른 UI와 연동할 때만 사용하는 쪽이 제어한다                                                                                                                                        |
| 전환 애니메이션   | 열릴 때 메인 `+` 아이콘 45° 회전(`×` 모양), 보조 버튼 목록 fade + 위로 이동                         | 확정 사항(애니메이션 있음). 아이콘을 바꾸지 않고 회전으로 `×`를 만들어 전환이 자연스럽고, 열린 상태에서 메인 버튼이 닫기 역할을 겸한다는 의미가 분명해진다. 회전 방식 유지로 확정                                  |
| 위치 지정         | 컴포넌트는 `fixed`/`absolute`를 갖지 않음. 보조 버튼 목록은 `Menu.Positioner`가 메인 버튼 위에 배치 | 화면 우하단 고정 등 배치는 페이지 레이아웃 책임. 사용하는 쪽이 `className` 또는 래퍼로 지정한다                                                                                                                    |
| `aria-label` 강제 | 메인 버튼 `aria-label`, 각 액션 `label`을 타입 레벨 필수                                            | 모두 아이콘 전용이라 [IconButton](../IconButton/README.md#접근성)과 같은 방식으로 컴파일 타임에 강제                                                                                                               |

## 레이어 구조

```
src/components/_common/ActionButton/
└── ActionButton.tsx        # Menu.Root·Trigger·Positioner·Popup·Item 조합 ("use client")
```

- `_common/<Component>/<Component>.tsx` 단일 파일 규칙([ui-component.md](../../convention/ui-component.md))을 따른다. 보조 버튼은 이 컴포넌트 밖에서 단독으로 쓰이지 않아 별도 파일·export로 분리하지 않는다.
- 아이콘은 `lucide-react`에서 import하므로 `src/assets/icons/`에 SVG를 추가하지 않는다.

## API

```tsx
import { LinkIcon, PencilIcon, TagPlusIcon } from 'lucide-react';

import { ActionButton } from '@components/_common/ActionButton/ActionButton';

<ActionButton
  aria-label="매출 액션 열기"
  actions={[
    { icon: <TagPlusIcon />, label: '매출 카테고리 추가', onClick: handleAddCategory },
    { icon: <LinkIcon />, label: '링크 복사', onClick: handleCopyLink },
    { icon: <PencilIcon />, label: '오늘 매출 추가', onClick: handleAddSales },
  ]}
/>

// controlled
<ActionButton aria-label="매출 액션 열기" open={isOpen} onOpenChange={setIsOpen} actions={actions} />
```

```ts
interface ActionButtonItem {
  icon: React.ReactNode;
  label: string; // 보조 버튼의 aria-label
  onClick: () => void;
}

type ActionButtonProps = Omit<Menu.Trigger.Props, 'children'> &
  Required<Pick<Menu.Trigger.Props, 'aria-label'>> &
  Pick<Menu.Root.Props, 'open' | 'defaultOpen' | 'onOpenChange'> & {
    actions: ActionButtonItem[]; // 화면 위 → 아래 순서
  };
```

- `actions` 배열 순서가 곧 화면상 위 → 아래 순서이고, 방향키 탐색 순서다.
- 보조 버튼을 누르면 해당 `onClick`이 호출되고 목록이 자동으로 닫힌다.
- `className`·나머지 Trigger props는 **메인 버튼**에 전달한다.

## 스타일

| 대상             | 조건           | 스타일 (Figma 실측값)                                                                     |
| ---------------- | -------------- | ----------------------------------------------------------------------------------------- |
| 메인 버튼        | 공통           | `size-14 bg-primary-500`, `PlusIcon` 24px                                                 |
|                  | 열림           | `data-popup-open:shadow-[0_1px_4px_0_var(--color-slate-600)]`, 아이콘 `rotate-45`         |
| 보조 목록(Popup) | 공통           | `flex flex-col items-center gap-1`, Positioner `side="top"` `sideOffset={4}`              |
|                  | 열림/닫힘 전환 | `data-[starting-style]`·`data-[ending-style]`에서 `opacity-0 translate-y-2`, `transition` |
| 보조 버튼        | 공통           | `size-10 bg-slate-50 shadow-[0_1px_4px_0_var(--color-slate-600)]`, 아이콘 24px            |

- 변형 축이 없어 `cva`를 쓰지 않고 IconButton의 base처럼 고정 클래스를 `cn`으로 합친다.
- Figma에 hover·disabled 프레임은 없다 — `ICON_BUTTON_BASE_CLASSNAME`의 focus-visible·disabled 규칙만 적용하고 hover는 추가하지 않는다.

> **NOTE — disabled 디자인 미정**
> Figma에 disabled 디자인이 없어, 현재 비활성 상태는 `ICON_BUTTON_BASE_CLASSNAME`의 `disabled:pointer-events-none disabled:cursor-not-allowed`로 **클릭만 막고 겉모습은 일반 상태와 같다.** 임의로 비활성 스타일(투명도·색 변경 등)을 정하지 않고 그대로 두며, 추후 디자인과 disabled 스타일을 맞춘 뒤 반영한다("확인 필요" 1번).

- Figma 원본의 `px-[18px] py-[10px]` 패딩은 고정 크기 원 안에 아이콘 하나를 가운데 두는 구조라 결과에 영향이 없어 옮기지 않는다.
- 아이콘 색은 lucide 아이콘이 `currentColor`를 따르므로 버튼의 `text-*`로 지정한다. Figma 원본 SVG와 대조한 결과 메인 `+`는 `text-white-50`(선 두께 1.8 → `strokeWidth={1.8}`), 보조 아이콘은 `text-primary-500`이다.

## 디자인 토큰 매핑

`get_variable_defs`(`114:211450`) 조회값과 `colors.css`를 대조했다.

### 일치

| Figma 변수      | 값        | 코드 토큰               | 용도                                                         |
| --------------- | --------- | ----------------------- | ------------------------------------------------------------ |
| `primary/500`   | `#ffd98a` | `--color-primary-500`   | 메인 버튼 배경, 보조 아이콘 색                               |
| `slate/50`      | `#f4f3f3` | `--color-slate-50`      | 보조 버튼 배경                                               |
| `slate/600`     | `#1a1715` | `--color-slate-600`     | 그림자 색                                                    |
| `secondary/600` | `#ebddb9` | `--color-secondary-600` | 변수 목록에만 조회됨 — 아이콘 SVG 대조 결과 실제 사용처 없음 |
| `white/50`      | `#fffffe` | `--color-white-50`      | 메인 `+` 아이콘 색                                           |

Button·IconButton과 달리 **불일치(하드코딩) 항목이 없다.**

### 그림자 — 인라인

`0 1px 4px 0 slate/600`(불투명)은 Figma 원본 그대로의 값으로 확정됐다. 대응하는 `--shadow-*` 토큰이 없어(`theme.css`에는 `--shadow-modal`만 있음) letter-spacing과 같은 방침([modal/README.md](../modal/README.md#방침--letter-spacing은-인라인-확정))으로 신규 토큰 없이 arbitrary value로 쓴다.

## 접근성

- `Menu.Trigger`가 `aria-haspopup`·`aria-expanded`를, `Menu.Item`이 `role="menuitem"`을 자동으로 붙인다.
- 키보드로 열면 첫 항목으로 포커스가 이동하고, 방향키로 항목 사이를 이동하며, Esc로 닫으면 포커스가 메인 버튼으로 돌아온다([accessibility.md](../../convention/accessibility.md) "키보드만으로 조작 가능").
- 보조 버튼은 텍스트가 없으므로 `label`을 `aria-label`로 붙인다.
- 아이콘은 장식용이라 `aria-hidden`으로 둔다(lucide 기본값).

## 렌더링 경계

`ActionButton.tsx`에 `"use client"`를 둔다. Base UI `Menu` 부품은 내부 상태·이벤트를 쓰는 클라이언트 컴포넌트이고, 같은 방식으로 `Dialog` 부품을 조합하는 Modal(`ModalRoot.tsx` 등)도 `"use client"`를 둔 선례를 따른다. [rendering.md 4항](../../architecture/rendering.md#4-ui-primitive의-클라이언트-경계는-전염되지-않는다)에 따라 Server Component에서 `<ActionButton>`을 렌더해도 부모가 클라이언트가 되지는 않는다. 단, `actions[].onClick`은 함수라 Server Component에서 직접 넘길 수 없으므로, 실제 사용처는 핸들러를 가진 feature 쪽 Client Component가 된다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다.

```
test/components/_common/ActionButton/ActionButton.test.tsx
```

| 대상       | 검증                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| 토글       | 메인 클릭 시 보조 버튼 렌더/제거, `aria-expanded` 값 전환                         |
| 닫힘       | Esc 키, 바깥 클릭 시 닫힘                                                         |
| 액션       | 보조 버튼 클릭 시 해당 `onClick` 호출 후 자동 닫힘, `label`이 `aria-label`로 렌더 |
| controlled | `open` prop 우선, 토글 시 `onOpenChange` 호출                                     |
| 순서       | `actions` 배열 순서와 렌더 순서 일치                                              |
| disabled   | 메인 disabled 시 열리지 않음                                                      |

## 단계별 PR 계획

| 단계 | 브랜치                           | 내용                               | 상태      |
| ---- | -------------------------------- | ---------------------------------- | --------- |
| 1/2  | `feat/common-action-button`      | 이 설계 문서 + `ActionButton` 구현 | 구현 완료 |
| 2/2  | `feat/common-action-button-test` | Vitest 테스트                      | 예정      |

[button/README.md의 "버튼 계열 브랜치 전략"](../button/README.md#버튼-계열-브랜치-전략)은 IconButton이 `dev`에 머지된 뒤 분기하도록 정했지만, 현재 `feat/common-action-button`은 `feat/common-icon-button`에서 분기했다. 실제 의존은 `iconButtonBase.ts` 하나뿐이므로, IconButton PR이 먼저 머지되어야 한다는 점을 PR 본문에 명시한다.

## 확정 사항

| 항목             | 결정                                                             |
| ---------------- | ---------------------------------------------------------------- |
| 닫힘 동작        | Esc·바깥 클릭으로 닫힘, 보조 액션 선택 후 자동 닫힘              |
| dim              | 없음                                                             |
| 전환 애니메이션  | 있음                                                             |
| 그림자           | 불투명 `slate/600` 그대로 (Figma 누락 아님)                      |
| 보조 액션 정의   | 공통 컴포넌트에서 정의하지 않고 사용하는 쪽에서 `actions`로 설정 |
| 크기             | 한 가지만 (모바일 전용)                                          |
| 열림 상태 아이콘 | `+`를 45° 회전시켜 `×` 모양으로 표시 (현재 구현 유지)            |

## 확인 필요

아래 항목은 **임의로 확정하지 않는다.** 확인 후 이 문서에 반영한다.

### 1. disabled 디자인 (추후 디자인과 맞춤)

Figma에 메인·보조 버튼의 disabled 프레임이 없다. 현재는 클릭만 막고 겉모습은 일반 상태와 같게 둔다([스타일](#스타일) NOTE 참고). 디자인과 disabled 스타일을 맞춘 뒤 메인 버튼(`Menu.Trigger`)과 보조 버튼(`Menu.Item`)에 각각 `disabled:`/`data-disabled:` 클래스로 반영한다.

## 참고

- 형제 컴포넌트·분리 근거: [button/README.md](../button/README.md), [IconButton/README.md](../IconButton/README.md)
- 공통 컴포넌트 문서 작성 규칙: [component/README.md](../README.md)
- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 목표: [convention/accessibility.md](../../convention/accessibility.md)
- 테스트 규칙: [convention/test.md](../../convention/test.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
