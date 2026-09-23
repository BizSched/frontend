# Pagination 컴포넌트 설계

목록 테이블 하단의 페이지 이동 UI를 하나의 공통 컴포넌트로 통일하기 위한 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 단계별 PR로 진행한다.

## 개요

Figma 컴포넌트 캔버스의 `Pagination`(`71:70435`)은 **`size` 속성 하나만 가진다.** 상태(hover·disabled·focus) 변형은 정의되어 있지 않다.

| 변형         | 노드       | 폭    |
| ------------ | ---------- | ----- |
| `size=large` | `71:70436` | 476px |
| `size=small` | `71:70456` | 260px |

design 캔버스 전수 조사 결과 인스턴스는 **26개(desktop 11 · tablet/mobile 15)** 이고, 매출 내역 · 매출 카테고리 · 아르바이트생 목록의 테이블 하단에만 쓰인다. **구조가 다른 인스턴스는 하나도 없다.**

원본: [Figma — BizSched / components 캔버스](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-70435) (배치 예시: design 캔버스 `337:106365` · `337:106247`)

|               | `lg`                              | `sm`                        |
| ------------- | --------------------------------- | --------------------------- |
| 셀            | `48px` 정사각, radius `16px`      | `32px` 정사각, radius `8px` |
| 텍스트        | 14/20, tracking `-0.03em`         | 12/16, tracking `0`         |
| 노출 슬롯     | **7칸** — `‹ 1 2 3 4 5 … 9 ›`     | **5칸** — `‹ 1 2 3 … 9 ›`   |
| 간격          | 화살표↔숫자 `10px`, 숫자 간 `4px` | 동일                        |
| 비활성 셀     | `bg #FAFAFA`, 글자 `#737373`      | 동일                        |
| 활성 셀       | `bg #FFD98A` + 오렌지 그림자      | 동일                        |
| 활성 글자     | `#F4F3F3`                         | `#FFFFFE`                   |
| 화살표 아이콘 | `20px`                            | `20px`                      |
| 생략 아이콘   | `24px`                            | `24px`                      |

화살표·생략 표시도 숫자와 **완전히 같은 셀 골격**(배경·radius·크기)을 쓴다. 셀 하나를 만들고 내용만 갈아끼우면 전체가 나온다.

## 설계 결정 요약

| 결정     | 선택                                                          | 근거                                                                                                                                                                                      |
| -------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API 형태 | **compound 아님. 평면 props**                                 | Figma 26개 인스턴스의 구조가 전부 동일해 슬롯을 열 이유가 없다. `page` · `totalPages` · `onPageChange` 세 개로 전부 표현된다. Modal과 달리 조합의 자유도가 요구되지 않는다                |
| 범위     | primitive + 계산 훅까지                                       | page 상태와 데이터 조회는 호출부(도메인) 소유. [ui-component.md](../../convention/ui-component.md)의 _"공통 컴포넌트에 특정 페이지의 API·비즈니스 로직을 넣지 않는다"_                    |
| 시작점   | **`shadcn add pagination` 실행 후 `_common/`에서 재구성**     | 생성물(`_common/ui/pagination.tsx`)의 `nav` / `ul` / `li` 시맨틱과 `aria-current` 배선을 그대로 쓴다. Modal이 `_common/ui/dialog.tsx`를 두고 `_common/Modal/`에서 재구성한 것과 같은 구조 |
| 요소     | `<button type="button">`                                      | page 상태가 콜백으로 호출부에 올라간다. 생성물의 `PaginationLink`는 `<a>` 기반이라 쓰지 않는다                                                                                            |
| 아이콘   | lucide `ChevronLeft` · `ChevronRight` · `Ellipsis`            | `components.json`의 `iconLibrary: "lucide"`, `lucide-react` 설치 완료. 글리프가 Figma와 1:1 대응해 에셋 커밋이 불필요하다                                                                 |
| 반응형   | **`size`를 JS로 판정** (SSR `lg` → 마운트 후 교정)            | 아래 "반응형 전략" 참고                                                                                                                                                                   |
| 토큰     | **전역 토큰 신설 없음. 기존 토큰·Tailwind 유틸리티 + 임의값** | 아래 "디자인 토큰 매핑" 참고                                                                                                                                                              |

## `shadcn add pagination` 적용 시 주의

레지스트리(`base-nova/pagination.json`) 확인 결과는 다음과 같다.

1. `registryDependencies: ["button"]` — **Button이 함께 생성된다.** Button은 아직 설계 전(이슈 #8)이므로 생성물을 남기면 이후 설계와 충돌한다. `PaginationLink`를 쓰지 않으면 Button 의존이 사라지므로, **생성된 `button.tsx`는 삭제한다.**
2. `import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"` — 레지스트리 내부용 플레이스홀더다. CLI가 `components.json`의 `iconLibrary: "lucide"`로 치환하지만, 실패하면 깨진 import가 남는다.
3. `import { cn } from "cn"` — 이 저장소는 `@lib/utilities/cn` 재export를 단일 출처로 쓴다.
4. `PaginationPrevious` / `PaginationNext`가 쓰는 `sm:block`은 **이 프로젝트에 없는 breakpoint다.** `breakpoints.css`가 `--breakpoint-*: initial`로 Tailwind 기본 breakpoint를 전부 제거하고 `mobile` · `tablet` · `desktop`만 정의한다.

생성물에서 **실제로 쓰는 것은 세 개**다. 나머지는 Button 의존을 끊기 위해 `_common/ui/pagination.tsx`에서 제거하고, 필요한 것은 `_common/Pagination/`에서 직접 만든다.

| 생성물                        | 사용 | 비고                                                                         |
| ----------------------------- | ---- | ---------------------------------------------------------------------------- |
| `Pagination` (`<nav>`)        | ○    | `role="navigation"` + `aria-label`                                           |
| `PaginationContent` (`<ul>`)  | ○    | gap만 교체                                                                   |
| `PaginationItem` (`<li>`)     | ○    | 그대로                                                                       |
| `PaginationLink`              | ✕    | `<a>` + Button variant 기반. Figma는 `<button>`에 전용 스타일                |
| `PaginationPrevious` / `Next` | ✕    | "Previous" / "Next" 텍스트 라벨을 붙인다. Figma는 아이콘 전용                |
| `PaginationEllipsis`          | ✕    | 배경 없는 맨 `span`에 아이콘 16px. Figma는 다른 셀과 같은 배경에 아이콘 24px |

`_common/ui/pagination.tsx`의 `Pagination`과 이 문서의 공개 컴포넌트 이름이 겹치므로, 조립부에서 `Pagination as PaginationNav`로 별칭 import 한다.

## 반응형 전략

[style.md](../../convention/style.md)는 desktop-first + `max-*` CSS 전환을 요구한다. 셀 크기(48↔32px)는 CSS로 되지만, **노출 슬롯 수(7↔5)는 CSS로 불가능하다.** DOM 노드 개수 자체가 달라지기 때문이다.

"7칸을 렌더하고 모바일에서 2개를 `max-tablet:hidden`으로 숨긴다"가 가능한지 검증했으나, 숨길 대상이 현재 페이지 위치에 따라 달라져 고정 규칙이 나오지 않는다.

| current / total=9 | `lg` (7칸)      | `sm` (5칸)  | 숨길 항목                |
| ----------------- | --------------- | ----------- | ------------------------ |
| 1                 | `1 2 3 4 5 … 9` | `1 2 3 … 9` | 4, 5 (현재에서 거리 3·4) |
| 5                 | `1 … 4 5 6 … 9` | `1 … 5 … 9` | 4, 6 (현재에서 거리 1)   |

따라서 **`size`를 JS 값으로 단일화**한다. `size` 하나가 셀 크기와 슬롯 수를 함께 결정하므로 두 값이 어긋날 수 없다.

- `usePaginationSize`는 `useSyncExternalStore` + `matchMedia`로 판정한다.
- `getServerSnapshot`은 `lg`를 반환한다. **SSR은 항상 데스크톱 기준으로 그리고, 모바일에서는 마운트 직후 `sm`으로 교정된다.**
- 미디어 쿼리 값은 `--breakpoint-tablet`(46.5rem)과 **같아야 하는 계약**이므로 `PAGINATION_BREAKPOINT` 상수 한 곳에만 둔다.

호출부가 `size`를 명시하면 판정을 건너뛴다.

## 레이어 구조

```
① 생성물   src/components/_common/ui/pagination.tsx   shadcn 원본 (import 경로·아이콘만 정리)
② 구현     src/components/_common/Pagination/          Figma 스타일 · 평면 API
③ 계산     src/hooks/pagination/                       슬롯 배열 · size 판정
```

[ui-component.md](../../convention/ui-component.md)의 배치 기준과 기존 Modal 구조(`_common/ui/dialog.tsx` + `_common/Modal/`)를 그대로 따른다.

### 파일 구성

```
src/components/_common/ui/
└── pagination.tsx              # shadcn 생성물

src/components/_common/Pagination/
├── Pagination.tsx              # 공개 컴포넌트. 평면 props 조립
├── PaginationButton.tsx        # 셀 버튼 (숫자·화살표 공용) + cva
└── PaginationEllipsis.tsx      # 생략 셀

src/hooks/pagination/
├── usePaginationRange.ts       # 슬롯 배열 계산 (순수)
└── usePaginationSize.ts        # lg / sm 판정

src/hooks/types/
└── pagination.ts               # PaginationSize, PaginationSlot
```

타입 위치는 [folder-structure.md](../../architecture/folder-structure.md#타입-정의-파일-위치)의 _"`interface`는 각 레이어 폴더 하위의 `types/`에 분리"_ 를 따른다. 각 파일은 named export를 유지하고 배럴 `index.ts`를 만들지 않는다([code-style.md](../../convention/code-style.md)).

## API

```tsx
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: PaginationSize;
  label?: string;
  className?: string;
}
```

```tsx
const [page, setPage] = useState(1);

<Pagination
  page={page}
  totalPages={9}
  onPageChange={setPage}
  label="매출 내역 페이지"
/>;
```

`size`를 생략하면 뷰포트로 판정하고, 명시하면 고정한다.

```tsx
<Pagination page={page} totalPages={9} onPageChange={setPage} size="sm" />
```

| prop           | 기본값      | 설명                                                |
| -------------- | ----------- | --------------------------------------------------- |
| `page`         | —           | 현재 페이지 (1-based)                               |
| `totalPages`   | —           | 전체 페이지 수. `1` 이하면 아무것도 렌더하지 않는다 |
| `onPageChange` | —           | 숫자·화살표 클릭 시 이동할 페이지 번호를 전달       |
| `size`         | 뷰포트 판정 | `lg` \| `sm`                                        |
| `label`        | `"페이지"`  | `<nav>`의 `aria-label`                              |

호출부가 `page` 상태를 소유한다. `useState`로 둘지 URL Search Params로 둘지는 [state-management.md](../../architecture/state-management.md) 기준에 따라 **화면마다 판단**하며, 이 컴포넌트는 관여하지 않는다.

## 슬롯 계산 — `usePaginationRange`

```ts
type PaginationSlot =
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; position: 'start' | 'end' };

usePaginationRange({ page, totalPages, visibleCount }): PaginationSlot[]
```

규칙은 세 줄이다.

1. 슬롯 총 개수는 항상 `visibleCount`로 고정한다.
2. 첫 페이지와 마지막 페이지는 항상 노출한다.
3. 건너뛴 구간은 `ellipsis`가 대체한다.

`totalPages <= visibleCount`면 전부 노출한다.

| page / total | `visibleCount: 7` (`lg`) | `visibleCount: 5` (`sm`) |
| ------------ | ------------------------ | ------------------------ |
| 1 / 9        | `1 2 3 4 5 … 9`          | `1 2 3 … 9`              |
| 5 / 9        | `1 … 4 5 6 … 9`          | `1 … 5 … 9`              |
| 9 / 9        | `1 … 5 6 7 8 9`          | `1 … 7 8 9`              |
| 3 / 3        | `1 2 3`                  | `1 2 3`                  |

`1 / 9` 행이 Figma 원본과 일치한다. 브라우저 API를 쓰지 않는 순수 계산이라 단독 단위 테스트가 가능하다.

## variant (cva)

셀 골격이 숫자·화살표·생략에서 동일하므로 `paginationButtonVariants` 하나를 공유한다. [ui-component.md](../../convention/ui-component.md)에 따라 반복되는 디자인 차이만 축으로 만든다.

| 축         | 값      | 매핑                                                                      |
| ---------- | ------- | ------------------------------------------------------------------------- |
| `size`     | `lg`    | `size-12 rounded-[1rem] text-sm tracking-[-0.03em]`                       |
|            | `sm`    | `size-8 rounded-md text-xs`                                               |
| `isActive` | `true`  | `bg-primary font-semibold shadow-[0_0.625rem_2.5rem_rgb(255_158_89/0.3)]` |
|            | `false` | `bg-slate-50 text-muted-foreground font-medium hover:bg-slate-100`        |

활성 글자색은 `size`에 따라 다르므로 `compoundVariants`로 처리한다.

| `size` | `isActive` | 글자색          |
| ------ | ---------- | --------------- |
| `lg`   | `true`     | `text-slate-50` |
| `sm`   | `true`     | `text-white-50` |

`sm`에는 tracking 유틸리티를 붙이지 않는다. Figma의 `text-xs` 스타일이 letter-spacing `0`이기 때문이다.

## 디자인 토큰 매핑

### 일치

| Figma                    | 코드                                 |
| ------------------------ | ------------------------------------ |
| 활성 배경 `#FFD98A`      | `bg-primary` (`--color-primary-500`) |
| `lg` 활성 글자 `#F4F3F3` | `text-slate-50`                      |
| `sm` 활성 글자 `#FFFFFE` | `text-white-50`                      |
| `sm` radius `8px`        | `rounded-md` (`--radius` × 0.8)      |
| 14/20 · 12/16            | `text-sm` · `text-xs`                |
| 셀 `48px` · `32px`       | `size-12` · `size-8`                 |
| 간격 `10px` · `4px`      | `gap-2.5` · `gap-1`                  |
| 아이콘 `20px` · `24px`   | `size-5` · `size-6`                  |

### 그림자 (임의값)

| Figma           | 적용                                             |
| --------------- | ------------------------------------------------ |
| `shadow-orange` | `shadow-[0_0.625rem_2.5rem_rgb(255_158_89/0.3)]` |

Figma 이펙트는 `DROP_SHADOW / #FF9E594D / offset (0, 10) / radius 40`이다. **`box-shadow`의 blur는 40px을 그대로 쓴다.** (CSS `filter: drop-shadow()`는 blur를 표준편차로 해석해 절반 값을 쓰지만, 여기서는 `box-shadow`다.)

**전역 스타일 파일(`theme.css`·`colors.css`)을 건드리지 않기로 했으므로** 전용 토큰을 만들지 않고 `PaginationButton`의 cva에 임의값으로 직접 입력한다. 다른 컴포넌트에서 같은 그림자를 쓰게 되면 그때 토큰화를 검토한다.

### 불일치 (코드 토큰으로 고정)

| Figma                     | Figma 값  | 적용                    | 코드 값   |
| ------------------------- | --------- | ----------------------- | --------- |
| 비활성 배경               | `#FAFAFA` | `bg-slate-50`           | `#F4F3F3` |
| 비활성 글자 (`slate/500`) | `#737373` | `text-muted-foreground` | `#6B6A68` |

두 번째 행은 이름이 아니라 **값 기준**으로 매핑하기로 확정했다. 같은 이름의 `--color-slate-500`은 `#1C1917`로 거의 검정이라 Figma의 중간 회색과 시각적으로 다른 색이 된다. `--muted-foreground`가 `--color-slate-400`(`#6B6A68`)을 가리키므로 의미상으로도 맞는다.

### radius `16px`

radius 스케일이 `--radius`(0.625rem) × 배수라 16px가 나오지 않는다. `rounded-xl`은 14px, `rounded-2xl`은 18px다. **전역 스케일을 건드리지 않기로 했으므로 `rounded-[1rem]` 임의값을 쓴다.**

> 같은 문제가 [modal](../modal/README.md)의 40px에서도 발생했다. 컴포넌트마다 임의값·전용 토큰이 늘어나면 스케일 재정의를 검토한다.

## 상호작용 상태

Figma 컴포넌트에 **상태 변형이 정의되어 있지 않다**(`size` 속성만 존재). [accessibility.md](../../convention/accessibility.md)의 _"focus 상태 제거 금지"_ 를 지키기 위해 아래를 구현 기본값으로 정한다.

| 상태              | 처리                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| hover (비활성 셀) | `hover:bg-slate-100`                                                       |
| hover (활성 셀)   | 변화 없음 — 현재 페이지라 이동 대상이 아니다                               |
| focus-visible     | `focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2` |
| disabled (화살표) | `disabled:pointer-events-none disabled:opacity-40`                         |
| 전환              | `transition-colors`                                                        |

생략 셀은 클릭 대상이 아니므로 `<span>`으로 렌더하고 hover·focus를 붙이지 않는다.

## 접근성

- `<nav role="navigation" aria-label={label}>` + `<ul>` / `<li>` 시맨틱 구조를 생성물에서 그대로 가져온다.
- 현재 페이지 버튼에만 `aria-current="page"`.
- 숫자 버튼은 `aria-label="{n}페이지로 이동"`, 화살표는 `aria-label="이전 페이지"` / `"다음 페이지"`.
- 아이콘에는 `aria-hidden="true"`.
- 생략 표시는 **아이콘에만** `aria-hidden="true"`를 걸고 `sr-only` "더 많은 페이지"를 읽힌다. 생성물처럼 바깥 `span` 전체에 `aria-hidden`을 걸면 `sr-only` 텍스트까지 함께 숨겨진다.
- 1페이지에서 이전, 마지막 페이지에서 다음 버튼은 `disabled`.
- `transition-colors`에는 `motion-reduce:` 대응을 넣는다.

> **알려진 예외**: 활성 셀은 `#FFD98A` 배경 위 흰 글자로 명도 대비가 약 **1.3:1** 이다. [accessibility.md](../../convention/accessibility.md)의 WCAG 2.1 AA 목표(4.5:1)에 미달하며, 14px SemiBold는 large text 예외에도 해당하지 않는다. **디자인 원본을 그대로 따르기로 결정했다.** 접근성 개선이 필요해지면 활성 글자색부터 조정한다.

## 렌더링 경계

`"use client"`는 트리거가 실제로 필요한 말단 파일에만 둔다([rendering.md](../../architecture/rendering.md)).

| 파일                        | `"use client"` | 트리거                     |
| --------------------------- | -------------- | -------------------------- |
| `Pagination.tsx`            | ○              | 1 (`useSyncExternalStore`) |
| `PaginationButton.tsx`      | ○              | 3 (`onClick`)              |
| `PaginationEllipsis.tsx`    | ✕              | 없음                       |
| `_common/ui/pagination.tsx` | ✕              | 없음 — 순수 마크업         |

같은 문서의 규칙 4에 따라, Server Component인 `page.tsx`가 `<Pagination>`을 렌더해도 부모는 클라이언트가 되지 않는다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다.

```
test/hooks/pagination/usePaginationRange.test.ts
test/components/_common/Pagination/pagination.test.tsx
```

현재 `test/` 디렉터리가 비어 있고 `vitest.config.ts`에 `setupFiles`가 없다. **`@testing-library/jest-dom` setup을 테스트 PR에서 함께 추가한다.**

| 대상                 | 검증                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `usePaginationRange` | 위 슬롯 표 4케이스 + `totalPages <= visibleCount` + `totalPages === 1`                     |
| 렌더                 | `totalPages <= 1`이면 아무것도 렌더하지 않는다                                             |
| 경계                 | 1페이지에서 이전 `disabled`, 마지막에서 다음 `disabled`                                    |
| 상호작용             | 숫자 클릭 시 `onPageChange(n)`, 화살표 클릭 시 `±1`, 생략 클릭 무반응                      |
| 접근성               | `role="navigation"`, `aria-current="page"`가 활성 셀에만, 생략 표시가 접근성 트리에서 제외 |
| variant              | `size` `lg` / `sm` 클래스 적용                                                             |

`usePaginationSize`는 `matchMedia` 모킹이 필요하므로, 반응형 판정은 `size`를 명시한 렌더 테스트로 대체한다.

## 단계별 PR 계획

GitHub [stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)로 진행한다. 각 브랜치는 바로 아래 브랜치를 base로 하고, 맨 아래만 `dev`를 향한다. 작업은 `git worktree`로 브랜치별 독립 디렉터리에서 진행한다.

| 순서 | 브랜치                        | base                          | 내용                                                                         |
| ---- | ----------------------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| 1    | `feat/common-pagination`      | `dev`                         | **이 설계 문서** + `docs/README.md` · `docs/component/README.md` 인덱스 갱신 |
| 2    | `feat/common-pagination-ui`   | `feat/common-pagination`      | `shadcn add pagination` + `PaginationButton` · `PaginationEllipsis`          |
| 3    | `feat/common-pagination-hook` | `feat/common-pagination-ui`   | `usePaginationRange` · `usePaginationSize` + `Pagination` 조립               |
| 4    | `feat/common-pagination-test` | `feat/common-pagination-hook` | vitest setup + 테스트                                                        |

아래부터 Squash Merge하면 남은 PR의 base가 자동 리타깃된다.

## 확인 필요

아래 항목은 임의로 확정하지 않는다. 확인 후 이 문서에 반영한다.

### 1. 상호작용 상태 시각값

Figma에 hover·focus·disabled 정의가 없다. 위 "상호작용 상태"의 값은 **구현 제안**이므로 디자이너 확인이 필요하다.

### 2. `size` 판정 방식

SSR에서 `lg`로 그린 뒤 모바일에서 마운트 직후 `sm`으로 교정하기로 결정했다. 실제 화면에서 교정이 눈에 띄면 호출부가 `size`를 명시하는 방식으로 전환한다.

### 3. 비동기 목록 연동

페이지 전환마다 Suspense가 다시 떨어져 목록이 사라졌다 나타나는 문제는 **query 쪽에서** 해결한다(`placeholderData: keepPreviousData`, `startTransition`). 이 컴포넌트의 책임이 아니며, 실제 목록을 붙이는 도메인 문서에서 다룬다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 상태 도구 선택: [architecture/state-management.md](../../architecture/state-management.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
