# Dropdown 컴포넌트 설계

목록 선택·월 이동·폼 선택에서 반복되는 드롭다운 UI를 하나의 공통 컴포넌트로 통일하기 위한 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 단계별 PR로 진행한다.

## 개요

Figma에서 지정된 4개 화면은 **"팝업 리스트"라는 같은 부품을 서로 다른 트리거에 붙인 조합**이다.

| #   | 화면               | 설명                                                                    | node-id      |
| --- | ------------------ | ----------------------------------------------------------------------- | ------------ |
| ①   | dropdown           | 팝업 컨테이너. `size=large`(400px) / `small`(102px)                     | `71-70637`   |
| ②   | dropdown list      | 팝업 안 개별 항목 atom. `size` × `state(default/hover)`                 | `71-70651`   |
| ③   | dropdown 날짜 변경 | 월 선택 트리거(`btn_change_month`) + ①②를 재사용한 팝업                 | `105-194286` |
| ④   | form dropdown      | 폼 선택 트리거(`nav_from`) + ①②를 재사용한 팝업. `size`에 `medium` 추가 | `271-55318`  |

파일: [Figma — BizSched](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched) (① [node-id=71-70637](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-70637&m=dev) · ② [node-id=71-70651](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-70651&m=dev) · ③ [node-id=105-194286](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=105-194286&m=dev) · ④ [node-id=271-55318](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=271-55318&m=dev))

③④의 팝업 리스트 셀은 ②와 **픽셀 단위로 동일한 값**(배경·radius·padding·hover 색)을 쓴다. 트리거만 화면마다 다르다.

| 계열            | 트리거 모양                                                  | 팝업 크기 축                                      | 팝업 리스트 셀                                                      |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------- |
| ③ 월 변경       | `radius 20px` 아웃라인 pill, `slate/200` 보더, 숫자 + 화살표 | `large`(84px) / `small`(71px)                     | ②의 large/small와 동일                                              |
| ④ Form 드롭다운 | `radius 14~20px` 채움형 박스, 라벨 + 화살표                  | `large`(276px) / `medium`(150px) / `small`(102px) | `large`만 항목 사이 `border-b` 구분선 추가, medium/small은 ②와 동일 |

## 설계 결정 요약

| 결정           | 선택                                                                                     | 근거                                                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 이 PR의 범위   | ①②(팝업 컨테이너 + 리스트 항목) primitive만 구현. ③④는 설계만 먼저 확정                  | ①②가 ③④의 팝업 리스트로 그대로 재사용되므로 먼저 완성해야 ③④가 재구현 없이 조립된다. AGENTS.md 원칙대로 미구현 컴포넌트는 설계 문서부터 작성한다                                 |
| API 형태       | **compound 아님. 평면 props** — `items` 배열 + `children`(트리거)                        | [pagination](../pagination/README.md)과 동일한 이유. Figma 인스턴스 구조가 균일해 슬롯을 열 필요가 없다. 트리거만 임의 요소로 교체 가능하면 충분                                 |
| 기반 primitive | Base UI `Menu`(`@base-ui/react/menu`)                                                    | 포커스 로빙·키보드 내비게이션(↑↓/Home/End/Esc)·anchor positioning을 제공. 직접 구현 시 [accessibility.md](../../convention/accessibility.md)의 WCAG 2.1 AA 목표 달성 비용이 크다 |
| 시작점         | **생성물을 두지 않는다.** `@base-ui/react/menu`에 직접 의존해 `_common/Dropdown/`만 작성 | 아래 "`shadcn add dropdown-menu` 생성물 미사용 판단" 참고. Modal과 같은 기준 — 동작은 primitive가 전부 제공하고 디자인은 전부 다시 쓴다                                          |
| ③④ 확장 방식   | **확인 필요** — 아래 "확인 필요" 참고                                                    | 팝업(`DropdownContent`)·리스트 셀(`DropdownItem`)은 그대로 재사용하지만, 트리거·선택 상태 관리를 하나의 compound로 묶을지 화면별 컴포넌트로 둘지는 결정하지 않는다               |

## `shadcn add dropdown-menu` 생성물 미사용 판단

`npx shadcn add dropdown-menu`를 실행해 생성물(`base-nova` 스타일)과 대조했고, **생성물을 저장소에 두지 않기로 했다.** `_common/ui/`도 만들지 않는다.

| shadcn 기본값                                                                  | Figma                                                                                                      | 조치                                                |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Popup `min-w-32 rounded-lg bg-popover p-1 ring-1 ring-foreground/10 shadow-md` | `rounded-[16px]`(large)/`[12px]`(small), `bg-white/50`, `shadow-[0px_4px_8px_rgba(0,0,0,0.1)]`, 링 없음    | 교체                                                |
| Item `rounded-md px-1.5 py-1 gap-1.5 focus:bg-accent`                          | 바깥 padding(6px/5px) + 안쪽 셀(radius 12px/8px, padding 8px/6·3px), 포커스 배경이 large/small마다 다른 색 | 교체                                                |
| `DropdownMenuSub`·`DropdownMenuCheckboxItem`·`DropdownMenuRadioItem`           | 4개 화면 어디에도 서브메뉴·체크박스·라디오 항목이 없음                                                     | 미사용 — 코드베이스에 안 쓰는 서브컴포넌트로 남는다 |
| `DropdownMenuItem`의 `data-[variant=destructive]`                              | destructive 변형 없음                                                                                      | 미사용                                              |

교체하고 나면 `Root/Trigger/Portal/Positioner/Popup/Item` 합성 구조만 남는데, 이는 `@base-ui/react/menu`의 타입 정의만 보고도 나오는 형태다. 실제로 쓰는 6개 부품 중 스타일이 그대로 남는 것은 하나도 없다 — **생성물을 거쳐도 얻는 게 없다는 뜻이다.** 이게 생성물을 두지 않는 유일하고 충분한 근거다.

Modal·Pagination이 겪은 `registryDependencies`(Button이 함께 딸려옴)·breakpoint 클래스 미생성 같은 실질적 충돌은 `dropdown-menu` 레지스트리에는 없다. 남는 건 `import { cn } from "cn"` 치환, 파일명 casing(`dropdown-menu.tsx`, [naming.md](../../convention/naming.md) 위반) 정도인데 둘 다 생성 직후 한 번 고치면 끝나는 사소한 수정이라 **결정적 근거로 세우지 않는다.**

### 결론

동작(포커스 로빙·키보드 내비게이션·anchor positioning)은 semver 의존성인 `@base-ui/react/menu`에서 직접 오며, `Dropdown`은 이미 거기 붙어 있다. 생성물을 한 겹 끼우는 것으로 얻는 추종 효과가 없으므로 [modal](../modal/README.md#shadcn-add-dialog-검증-결과)과 같은 기준으로 생성물을 두지 않는다.

## 레이어 구조

```
src/components/_common/Dropdown/    Base UI Menu 래핑 · Figma 스타일 · 평면 API
```

Modal이 `_common/ui/dialog.tsx`를 두지 않고 `_common/Modal/`에서 Base UI `Dialog`에 직접 의존한 것과 같은 구조다. `_common/ui/`는 shadcn CLI가 생성한 파일 전용이므로, 생성물을 쓰지 않는 이 컴포넌트는 그 폴더에 아무것도 두지 않는다.

### 파일 구성

```
src/components/_common/Dropdown/
├── Dropdown.tsx                # 공개 컴포넌트. Menu.Root + Menu.Trigger 조립, items → DropdownItem 매핑
├── DropdownContent.tsx         # Menu.Portal + Menu.Positioner + Menu.Popup 래핑 (cva: size)
└── DropdownItem.tsx            # Menu.Item 래핑 (cva: size, 포커스 배경)
```

`DropdownContent`를 별도 파일로 둔 이유는 ③④가 트리거만 바꾸고 **팝업(`DropdownContent`)·리스트 셀(`DropdownItem`)은 그대로 재사용**하기 때문이다. 트리거는 컴포넌트 조립 시점에 `children`으로 주입되므로 별도 파일이 필요 없다.

각 파일은 named export를 유지하고, [code-style.md](../../convention/code-style.md)에 따라 배럴 `index.ts`는 두지 않는다. 타입은 `interface`로 선언한다.

## API

```tsx
import { Dropdown } from '@components/_common/Dropdown/Dropdown';

interface DropdownOption {
  label: string;
  onSelect?: () => void;
}

const items: DropdownOption[] = [
  { label: '자바스크립트로 웹서비스 만들기', onSelect: () => {} },
];

// 트리거는 임의 요소를 그대로 받는다. Button 컴포넌트는 아직 설계 전이므로 예시는 <button>으로 표기한다
<Dropdown items={items} size="large">
  <button type="button">large dropdown 열기</button>
</Dropdown>;
```

| prop        | 기본값    | 설명                                          |
| ----------- | --------- | --------------------------------------------- |
| `children`  | —         | 트리거 요소. `Menu.Trigger`에 `render`로 위임 |
| `items`     | —         | `DropdownOption[]`                            |
| `size`      | `"large"` | `"large"` \| `"small"`                        |
| `className` | —         | 팝업(`DropdownContent`)에 병합                |

트리거는 `children`으로 받은 요소를 그대로 렌더한다(Base UI `render` prop 위임). Modal의 `Modal.CloseButton`과 같은 위임 패턴이다. Button 컴포넌트 의존 여부는 [modal의 "확인 필요 — Button 컴포넌트 의존"](../modal/README.md#1-button-컴포넌트-의존)과 같은 상태이므로 이 문서에서 별도로 확정하지 않는다.

### ③④ 제안 API (설계만, 구현 순서는 ①② 다음)

트리거가 "현재 값 + 화살표"를 표시하고 팝업 리스트가 ②를 그대로 재사용한다는 점에서 아래 형태를 제안한다. **선택 상태 관리 방식(controlled value/onChange)과 컴포넌트를 하나로 묶을지 여부는 "확인 필요"에서 다룬다.**

```tsx
// 제안 — 확정 아님
<MonthSelectDropdown
  value={month}
  months={monthOptions}
  onChange={setMonth}
  size="large" // large | small
/>

<FormDropdown
  value={selected}
  options={formOptions}
  onChange={setSelected}
  size="large" // large | medium | small
/>
```

## variant (cva)

[ui-component.md](../../convention/ui-component.md)에 따라 반복되는 디자인 차이만 `cva`로 정의한다.

### Dropdown (팝업 컨테이너)

| 축     | 값      | 매핑                             |
| ------ | ------- | -------------------------------- |
| `size` | `large` | `w-100`(400px) `rounded-[16px]`  |
|        | `small` | `w-25.5`(102px) `rounded-[12px]` |

공통: `drop-shadow-[0px_4px_8px_rgba(0,0,0,0.1)]`, `overflow-clip`.

### DropdownItem (리스트 셀)

| 축                | 값      | 매핑                                                         |
| ----------------- | ------- | ------------------------------------------------------------ |
| 바깥 padding      | `large` | `p-[6px]`                                                    |
|                   | `small` | `p-[5px]`                                                    |
| 셀 radius/padding | `large` | `rounded-[12px] p-[8px]`                                     |
|                   | `small` | `rounded-[8px] px-[6px] py-[3px]`                            |
| 텍스트            | `large` | `text-[16px] leading-[24px]` + `tracking-[-0.03em]`(-0.48px) |
|                   | `small` | `text-[14px] leading-[20px]` + `tracking-[-0.03em]`(-0.42px) |

포커스(hover) 배경은 `size`에 따라 값이 달라 `compoundVariants`로 처리한다.

| `size`  | 포커스 배경        |
| ------- | ------------------ |
| `large` | `#c6c5c5`          |
| `small` | `#ffd377` 20% 알파 |

포커스 배경은 Base UI Menu의 roving-focus를 `group-focus/dropdown-item:` 셀렉터로 받아 적용한다. 마우스 hover도 Base UI가 포인터를 따라 DOM 포커스를 옮기므로 별도 `:hover` 규칙 없이 동일하게 동작한다.

### ③ 월 변경 트리거 (설계 제안)

| 축   | 값        | 매핑                                                                            |
| ---- | --------- | ------------------------------------------------------------------------------- |
| size | `large`   | `h-8`(32px), `text-xl font-bold`(20/30), 화살표 24px, `gap-2.5`(10px)           |
|      | `small`   | 텍스트 `text-base font-bold`(16/24), 화살표 24px, `gap-1`(4px)                  |
| 공통 | —         | `rounded-[20px]` 보더 1px `slate/200`(`#c6c5c5`), 텍스트 `slate/900`(`#0f0e0d`) |
| 상태 | `default` | 화살표 `chevron-down`                                                           |
|      | `active`  | 화살표 `chevron-up` + 팝업 노출                                                 |

### ④ Form 드롭다운 트리거 (설계 제안)

| 축   | 값              | 매핑                                                                                                |
| ---- | --------------- | --------------------------------------------------------------------------------------------------- |
| size | `large`         | `w-[276px]`, `rounded-[20px]`, 텍스트 `text-lg font-semibold`(18/28, tracking -0.54px), 화살표 24px |
|      | `medium`        | `w-[150px]`, `rounded-[14px]`, 텍스트 `text-sm font-medium`(14/20), 화살표 20px                     |
|      | `small`         | `w-[102px]`, `rounded-[14px]`, 텍스트 동일, 화살표 20px                                             |
| 상태 | `default`(닫힘) | 화살표 `chevron-down`, 그림자 없음                                                                  |
|      | `spread`(열림)  | 화살표 `chevron-up`, 트리거에 `shadow-[0px_2px_4px_rgba(0,0,0,0.08)]` 추가                          |

`large`는 열렸을 때 팝업 리스트 항목 사이에 `border-b` 구분선(`slate/100`, `#dddcdc`)이 붙는다. ②·③·medium/small ④에는 구분선이 없다 — **large 전용 차이이므로 임의로 일반화하지 않는다.**

## 디자인 토큰 매핑

### 일치 (그대로 사용)

| Figma                                     | 코드 토큰                               | 비고                              |
| ----------------------------------------- | --------------------------------------- | --------------------------------- |
| 리스트 배경 `#fffffe`(white/50)           | `--color-white-50`                      |                                   |
| large 포커스 배경 `#c6c5c5`(slate/200)    | `--color-slate-200`                     | ③ 트리거 보더 색과도 동일         |
| small 포커스 배경 `rgba(255,211,119,0.2)` | `--color-primary-alpha-20`(`#FFD37733`) |                                   |
| small item 셀 radius `8px`                | `--radius-md`(`--radius` × 0.8 = 8px)   |                                   |
| ③ large 트리거 텍스트 `20px/30px`         | `--text-xl`                             |                                   |
| ③④ large 트리거·항목 텍스트 `16px/24px`   | `--text-base`                           |                                   |
| ④ large 트리거 텍스트 `18px/28px`         | `--text-lg`                             | Modal의 버튼 텍스트와 같은 스케일 |
| ②③④ small 항목 텍스트 `14px/20px`         | `--text-sm`                             |                                   |
| ④ border-b 구분선 `#dddcdc`(slate/100)    | `--color-slate-100`                     |                                   |
| ③ 트리거 텍스트 `#0f0e0d`(slate/900)      | `--color-slate-900`                     |                                   |

### 불일치 (코드 토큰으로 고정)

| Figma                           | Figma 값  | 코드 토큰           | 코드 값              |
| ------------------------------- | --------- | ------------------- | -------------------- |
| 항목 텍스트 slate/700           | `#333333` | `--color-slate-700` | `#161412`(거의 검정) |
| ③④ 화살표·보조 텍스트 slate/400 | `#A4A4A4` | `--color-slate-400` | `#6B6A68`            |

[pagination](../pagination/README.md#디자인-토큰-매핑)이 채택한 "이름이 아니라 값 기준" 원칙을 그대로 따른다. `text-[#333]` 등 Figma 원본 값을 arbitrary value로 인라인 적용하고, 코드의 동명 토큰(slate-700/400)은 참조하지 않는다.

letter-spacing(`tracking-[-0.03em]`)도 [modal](../modal/README.md#디자인-토큰-매핑)의 선례를 따라 토큰을 신설하지 않고 인라인 arbitrary value로 적용한다.

### 신설 필요

| 토큰(가칭)                  | 값                             | 사용처                      |
| --------------------------- | ------------------------------ | --------------------------- |
| `--shadow-dropdown`         | `0px 4px 8px rgba(0,0,0,0.1)`  | ①② 팝업                     |
| `--shadow-dropdown-month`   | `0px 2px 2px rgba(0,0,0,0.25)` | ③ 월 선택 팝업              |
| `--shadow-dropdown-form`    | `0px 6px 8px rgba(0,0,0,0.12)` | ④ medium/small 팝업         |
| `--shadow-dropdown-trigger` | `0px 2px 4px rgba(0,0,0,0.08)` | ④ large 트리거(spread 상태) |

4개 화면의 그림자 값이 전부 달라 [modal](../modal/README.md#디자인-토큰-매핑)의 `--shadow-modal`처럼 컴포넌트당 1개로 묶을 수 없다. 화면별로 나눠 신설할지, 값 그대로 arbitrary value를 유지할지는 "확인 필요"에서 다룬다.

## 접근성

- Base UI `Menu`가 역할(`role="menu"`/`"menuitem"`), 키보드 내비게이션(↑↓/Home/End/Esc), 포커스 로빙을 기본 제공한다.
- Figma 컴포넌트에는 **hover/active 외 상태(focus-visible, disabled)가 정의돼 있지 않다.** [pagination](../pagination/README.md#접근성)과 같은 이유로, 키보드 포커스 표시는 Base UI 기본 동작(`group-focus`로 배경색 변경)에 의존하는 것을 구현 기본값으로 삼는다.
- ③④ 트리거는 버튼이므로 `aria-haspopup`, `aria-expanded`, 열림 상태에서 `aria-controls` 연결이 필요하다 — 구현 PR에서 결정한다.
- ③ 월 리스트·④ 옵션 리스트는 텍스트만으로 항목을 구분하므로 스크린리더에 값이 그대로 노출된다. 현재 선택된 항목에 `aria-selected`(또는 `aria-current`) 부여 여부는 확인 필요.
- 닫힌 뒤 포커스는 트리거로 복귀해야 한다(Base UI 기본 동작 확인 필요).

## 렌더링 경계

`"use client"`는 Base UI 상태·이벤트가 실제로 필요한 말단 파일에만 둔다([rendering.md](../../architecture/rendering.md)).

| 파일                                   | `"use client"` | 트리거                       |
| -------------------------------------- | -------------- | ---------------------------- |
| `_common/Dropdown/Dropdown.tsx`        | ○              | 3 (Base UI Menu 상태·이벤트) |
| `_common/Dropdown/DropdownContent.tsx` | ○              | 같은 이유로 전파             |
| `_common/Dropdown/DropdownItem.tsx`    | ○              | 같은 이유로 전파             |

Server Component가 `<Dropdown>`을 렌더해도 부모는 클라이언트가 되지 않는다(Modal 문서와 동일한 "UI primitive의 클라이언트 경계는 전염되지 않는다" 규칙).

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다.

```
test/components/_common/Dropdown/dropdown.test.tsx
test/components/_common/Dropdown/dropdownContent.test.tsx
test/components/_common/Dropdown/dropdownItem.test.tsx
```

| 대상     | 검증                                                                 |
| -------- | -------------------------------------------------------------------- |
| 렌더     | `items` 개수만큼 `DropdownItem` 렌더, 트리거 `children` 그대로 노출  |
| 상호작용 | 트리거 클릭 시 팝업 열림, 항목 클릭 시 `onSelect` 호출 후 팝업 닫힘  |
| 키보드   | ↑↓로 항목 간 포커스 이동, Esc로 닫힘, 닫힌 뒤 포커스가 트리거로 복귀 |
| variant  | `size` `large`/`small`에 따른 클래스 적용                            |

[pagination](../pagination/README.md#테스트-전략)과 마찬가지로 `test/` 디렉터리가 현재 비어 있고 `vitest.config.ts`에 `setupFiles`가 없다. `@testing-library/jest-dom` setup을 테스트 PR에서 함께 추가한다.

## 단계별 PR 계획

GitHub [stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)로 진행한다. 각 브랜치는 바로 아래 브랜치를 base로 하고, 맨 아래만 `dev`를 향한다.

| 순서 | 브랜치                       | base                         | 내용                                                                                                 |
| ---- | ---------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1    | `design/common-dropdown`     | `dev`                        | **이 설계 문서** + `docs/README.md` · `docs/component/README.md` 인덱스 갱신                         |
| 2    | `feat/common-dropdown-ui`    | `design/common-dropdown`     | `Dropdown`/`DropdownContent`/`DropdownItem` 구현(①②) — 생성물 없이 `@base-ui/react/menu`에 직접 의존 |
| 3    | `feat/common-dropdown-month` | `feat/common-dropdown-ui`    | ③ 월 변경 트리거 + 팝업                                                                              |
| 4    | `feat/common-dropdown-form`  | `feat/common-dropdown-month` | ④ Form 드롭다운 트리거 + 팝업(large 구분선 variant 포함)                                             |
| 5    | `feat/common-dropdown-test`  | `feat/common-dropdown-form`  | Vitest 테스트                                                                                        |

아래부터 Squash Merge하면 남은 PR의 base가 자동 리타깃된다.

## 확인 필요

아래 항목은 **임의로 확정하지 않는다.** 확인 후 이 문서에 반영한다.

### 1. ③④ 컴포넌트 결합 방식

월 변경(③)과 Form 드롭다운(④)을 하나의 "Select" 계열 compound로 묶을지, 트리거별 별도 컴포넌트로 만들지. 값 선택 상태(controlled value/onChange)를 컴포넌트가 가질지 호출부가 가질지도 함께 확인한다.

### 2. 그림자 토큰 4종

"디자인 토큰 매핑 — 신설 필요"의 4개 그림자 값을 화면별 토큰으로 각각 만들지, 하나로 통합할지, 토큰화 없이 arbitrary value를 유지할지.

### 3. 색상 불일치 매핑 방침

`slate/700`(#333 vs #161412), `slate/400`(#A4A4A4 vs #6B6A68) — Pagination처럼 "값 기준"으로 arbitrary를 유지하는 것으로 이 문서에서는 우선 정리했다. 다른 컴포넌트에도 같은 색이 반복되면 재검토가 필요하다.

### 4. 월 리스트 스크롤

③ 팝업은 12개월 전체를 담기엔 고정 높이(large 232px / small 205px)가 부족해 보인다. 내부 스크롤로 처리할지, 다른 레이아웃(그리드 등)을 쓸지 디자이너 확인이 필요하다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 코드 스타일(`interface`·배럴 금지): [convention/code-style.md](../../convention/code-style.md)
- 유사 사례(평면 API·값 기준 토큰 매핑): [component/pagination/README.md](../pagination/README.md)
- 유사 사례(생성물 미사용 판단 기준·letter-spacing 인라인 처리·Button 의존 확인 필요): [component/modal/README.md](../modal/README.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
