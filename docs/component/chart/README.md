# Chart 컴포넌트 설계

매출 대시보드와 메인 대시보드에서 반복되는 **누적 막대 차트**와 **도넛 차트**를 하나의 compound 컴포넌트로 통일하기 위한 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 단계별 PR로 진행한다.

## 개요

Figma `chart` 섹션에는 4종이 있다.

| Figma 컴포넌트            | 형태                                             | 이 문서 범위                       |
| ------------------------- | ------------------------------------------------ | ---------------------------------- |
| `Sales Chart`             | 카테고리별 누적 막대, 가로 기준선, 하단 범례     | **포함** — `Chart.Bar`             |
| `카테고리 Chart`          | 도넛 + 중앙 라벨, `size=large/small` × `isEmpty` | **포함** — `Chart.Donut`           |
| `progress_bar`            | 0~100% 단일 바                                   | 제외 — 별도 Progress 공통 컴포넌트 |
| `sales_category_progress` | 라벨·금액·비율 + 단일 바, `size=large/small`     | 제외 — 별도 Progress 공통 컴포넌트 |

progress 2종은 단일 값 표시라 계열(series) 데이터를 다루는 차트와 성격이 달라 분리한다.

### 화면별 사용처

| 화면                                  | 인스턴스              | 차트                    |
| ------------------------------------- | --------------------- | ----------------------- |
| 매출 대시보드 (desktop/tablet/mobile) | `sales_chart _card`   | 누적 막대 (주/월/연 탭) |
| 매출 대시보드 (desktop/tablet/mobile) | `sales_category_card` | 도넛 (카테고리 구성)    |
| 대시보드 (desktop/tablet/mobile)      | `sales_chart _card`   | 누적 막대 (이번 달)     |

카드 외곽(제목·월 선택 dropdown·`그래프 선택 탭`)은 **도메인에서 조합한다.** Chart는 카드 안의 플롯·범례·빈 상태만 책임진다.

### Figma 원본 노드

| 노드                                                                                                         | 내용                      |
| ------------------------------------------------------------------------------------------------------------ | ------------------------- |
| [`185:195241`](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=185-195241) `chart` 섹션 | 컴포넌트 원본             |
| `103:176038` `Sales Chart`                                                                                   | 누적 막대                 |
| `185:190641` `카테고리 Chart`                                                                                | 도넛 4 variant            |
| [`1:65264`](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=1-65264) `design` 페이지    | 화면 인스턴스             |
| `337:105748` / `337:105786` 매출 대시보드 (desktop / 없을 경우)                                              | 막대 + 도넛 실사용 형태   |
| `337:105893` 매출 대시보드 (mobile)                                                                          | 얇은 막대, 도넛 우측 범례 |
| `337:106741` 대시보드 (desktop)                                                                              | 막대 단독 사용            |

### 화면 인스턴스와 컴포넌트가 다를 때

화면에 배치된 인스턴스가 원본 컴포넌트와 다르면 **원본 컴포넌트를 기준으로 구현한다.**

- 데스크톱 매출 대시보드(`337:105748`)에서는 막대가 0 기준선 아래로 그려져 있다. 원본 `Sales Chart`에는 없는 배치 오류라 무시한다.
- 모바일 매출 대시보드(`337:105893`)의 도넛은 외경이 `size=small`보다 작게 그려져 있다. 모바일 전용 값을 두지 않고 **`small`로 통일한다.**

## 설계 결정 요약

| 결정          | 선택                                                                           | 근거                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 범위          | 누적 막대 + 도넛                                                               | progress 2종은 단일 값 표시라 별도 컴포넌트로 분리                                                                                                                               |
| 렌더링 엔진   | `recharts` (shadcn `chart` 경유)                                               | 스케일·누적·반응형 리사이즈·축 눈금을 직접 구현·테스트하는 비용이 크다                                                                                                           |
| shadcn 생성물 | `_common/ui/chart.tsx`·`skeleton.tsx` **유지**, `_common/ui/card.tsx` **삭제** | 아래 "`shadcn add chart` 생성물 처리" 참고                                                                                                                                       |
| 구조          | compound (`Chart.Plot`·`Bar`·`Donut`·`Center`·`Legend`·`Empty`)                | 화면마다 범례 위치·중앙 라벨·빈 상태 내용이 다르다. 슬롯 조합으로 흡수한다                                                                                                       |
| 색상          | 호출부가 `config`로 주입                                                       | 막대(4계열)와 도넛(5계열)의 팔레트가 서로 다르다. 컴포넌트에 색을 고정하지 않는다                                                                                                |
| 반응형        | `size` JS 값 단일화 (`large`/`small`), `matchMedia`로 판정                     | 막대 두께·도넛 반지름은 recharts prop이라 CSS만으로 바꿀 수 없다. [pagination](../pagination/README.md)과 같은 방식                                                              |
| y축 눈금      | recharts 자동 (`tickCount` 미고정)                                             | 매장별 매출 편차가 커서 고정 범위는 막대가 눌리거나 잘린다. 값 포맷만 `formatCompactKrw`로 통일. 아래 "y축 눈금" 참고                                                            |
| 툴팁          | **이번 범위 제외**                                                             | Figma 시안 없음. 실제 툴팁 확인 후 후속 PR에서 `Chart.Tooltip`으로 추가                                                                                                          |
| 로딩          | 독립 슬롯 `Chart.Skeleton` (차트 모양 스켈레톤)                                | 호출부가 `isPending ? <Chart.Skeleton /> : <Chart />`로 분기한다. Provider·데이터 없이 렌더되므로 Suspense `fallback`에도 그대로 쓸 수 있다. 아래 "로딩 — `Chart.Skeleton`" 참고 |

## `shadcn add chart` 생성물 처리

`pnpm dlx shadcn@latest add chart`(style `base-nova`)는 아래를 생성·설치한다.

| 산출물                        | 처리     | 근거                                                                                                                       |
| ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `recharts@3.x` (+ `react-is`) | 설치     | 렌더링 엔진. `react-is`는 recharts의 peer dependency                                                                       |
| `_common/ui/chart.tsx`        | **유지** | `ChartContainer`(ResponsiveContainer + `ChartStyle` 색상 변수 주입)와 `ChartConfig` 타입을 쓴다                            |
| `_common/ui/card.tsx`         | **삭제** | `chart.tsx`는 card를 import하지 않는다. 카드는 `_common/Card/`로 별도 설계 중이라 생성물을 두면 같은 역할이 두 곳에 생긴다 |

### `chart.tsx`를 유지하는 이유

Modal은 생성물을 재구성하고 나면 남는 것이 없어 폐기했다. Chart는 다르다.

- 후속 툴팁 PR에서 쓸 `ChartTooltipContent`는 `useChart()`로 데이터를 읽고, 이 훅은 **`ChartContainer` 밖에서 throw한다.** 지금 `ChartContainer` 위에 플롯을 올려두면 툴팁 PR은 `Chart.Tooltip` 추가만으로 끝난다. 지금 폐기하면 그 PR에서 재생성과 플롯 재구성이 함께 필요하다.
- 비용은 작다. 쓰지 않는 `dark` 테마 셀렉터가 남고, 컨테이너 기본 `aspect-video`를 `className`으로 덮는 정도다.

생성물은 **수정하지 않는다** (재생성 시 덮어쓰기). 생성물 안의 `ChartContext`·`useChart`는 생성물 내부 구현이며, 이 문서가 정의하는 Chart 전용 Context·훅은 규칙대로 `providers/`·`hooks/`에 둔다.

### `shadcn add skeleton`

`Chart.Skeleton`의 기본 요소로 `_common/ui/skeleton.tsx`(`animate-pulse rounded-md bg-muted` 한 줄짜리 `div`)를 받아 **수정 없이** 쓴다. registry 의존성이 없고, 다른 공통 컴포넌트의 로딩 UI에서도 재사용할 수 있다.

## 레이어 구조

```
① 생성물   src/components/_common/ui/chart.tsx      shadcn 원본 (수정 금지)
           src/components/_common/ui/skeleton.tsx
② 구현     src/components/_common/Chart/             Figma 스타일 · compound 슬롯
③ 상태     src/providers/chart/                      ChartContext · ChartProvider
④ 기능     src/hooks/chart/                          컨텍스트 소비 · 계열 계산 · 빈 상태 판정 · size 판정
⑤ 유틸     src/lib/utilities/formatCompactKrw.ts     축 눈금 금액 포맷
```

### 파일 구성

| 파일                                | 책임                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `_common/Chart/Chart.tsx`           | `Object.assign(ChartRoot, { Plot, Bar, Donut, Center, Legend, Empty, Skeleton })`                     |
| `_common/Chart/ChartRoot.tsx`       | `ChartProvider` 주입, `legend` 배치 cva(`bottom`/`right`), `role="figure"`·`aria-label`               |
| `_common/Chart/ChartPlot.tsx`       | `relative` 플롯 영역. `Chart.Center`를 도넛 위에 겹친다                                               |
| `_common/Chart/ChartBar.tsx`        | `ChartContainer` > `BarChart`. `config` 키 순서대로 누적, 최상단 계열만 상단 radius. 빈 상태면 `null` |
| `_common/Chart/ChartDonut.tsx`      | `ChartContainer` > `PieChart`. `size`별 반지름. 빈 상태면 `slate-200` 링 하나                         |
| `_common/Chart/ChartCenter.tsx`     | 도넛 중앙 `label`·`value`, `size` cva                                                                 |
| `_common/Chart/ChartLegend.tsx`     | `<ul>` 범례. 색·라벨은 `useChartSeries`에서. 빈 상태면 `null`                                         |
| `_common/Chart/ChartEmpty.tsx`      | 빈 상태일 때만 `children` 렌더                                                                        |
| `_common/Chart/ChartSkeleton.tsx`   | 로딩 스켈레톤. Provider 없이 단독 렌더, `type`(`bar`/`donut`)별 플롯 모양 + 범례 칩 자리              |
| `providers/chart/ChartProvider.tsx` | `{ config, data, valueKey, size, isEmpty, total }` 제공                                               |
| `providers/types/chart.ts`          | `ChartContextValue`, `ChartSize` 등 Provider 타입                                                     |
| `hooks/chart/useChartContext.ts`    | 컨텍스트 소비, Provider 밖 사용 시 throw                                                              |
| `hooks/chart/useChartSeries.ts`     | `config` → `[{ key, label, color }]` (선언 순서 보존)                                                 |
| `hooks/chart/useChartSummary.ts`    | `data`·`config`·`valueKey` → `{ total, isEmpty }` (wide/long 모두)                                    |
| `hooks/chart/useChartSize.ts`       | `useSyncExternalStore` + `matchMedia`로 `large`/`small` 판정                                          |
| `lib/utilities/formatCompactKrw.ts` | `4000000` → `"400만"`                                                                                 |

`interface`는 [folder-structure.md](../../architecture/folder-structure.md#타입-정의-파일-위치)에 따라 Provider 타입은 `providers/types/`, 컴포넌트 props는 각 컴포넌트 파일 내부에 둔다.

## Compound API

```tsx
import { Chart } from '@components/_common/Chart/Chart';
import type { ChartConfig } from '@components/_common/ui/chart';

const CATEGORY_CHART_CONFIG = {
  product: { label: '상품 판매', color: 'var(--color-primary-700)' },
  service: { label: '서비스', color: 'var(--color-secondary-500)' },
  event: { label: '이벤트', color: 'var(--color-secondary-700)' },
  delivery: { label: '배달 /온라인', color: 'var(--color-primary-500)' },
  etc: { label: '기타', color: 'var(--color-primary-300)' },
} satisfies ChartConfig;

<Chart config={CATEGORY_CHART_CONFIG} data={categories} valueKey="amount" aria-label="10월 카테고리 구성">
  <Chart.Plot>
    <Chart.Donut nameKey="category" />
    <Chart.Center label="10월 매출" value="000,000,000 원" />
  </Chart.Plot>
  <Chart.Legend />
  <Chart.Empty>카테고리를 추가해주세요.</Chart.Empty>
</Chart>

<Chart config={SALES_CHART_CONFIG} data={weekly} aria-label="이번 달 매출">
  <Chart.Plot>
    <Chart.Bar xKey="label" />
  </Chart.Plot>
  <Chart.Legend />
  <Chart.Empty>
    <SalesEmptyState />
  </Chart.Empty>
</Chart>
```

### 슬롯 책임

| 슬롯           | 역할                        | 빈 상태일 때                     |
| -------------- | --------------------------- | -------------------------------- |
| `Chart` (Root) | Provider·배치·접근성 이름   | 그대로                           |
| `Chart.Plot`   | 플롯 영역, Center 겹침 기준 | 그대로                           |
| `Chart.Bar`    | 누적 막대                   | `null` (Empty가 자리를 대신한다) |
| `Chart.Donut`  | 도넛                        | `slate-200` 단색 링              |
| `Chart.Center` | 도넛 중앙 라벨·금액         | 그대로 (`0 원`은 호출부가 전달)  |
| `Chart.Legend` | 범례                        | `null`                           |
| `Chart.Empty`  | 빈 상태 안내                | `children` 렌더                  |

빈 상태 판정(`isEmpty`)은 `useChartSummary`가 한 곳에서 계산한다. `data`가 비었거나 모든 값의 합이 0이면 빈 상태다. 막대의 빈 상태 일러스트("아직 입력된 매출이 없어요")는 입력한 매출 표에서도 쓰이는 범용 UI라 Chart가 소유하지 않고 `Chart.Empty`의 `children`으로 받는다.

## 로딩 — `Chart.Skeleton`

Chart는 로딩 상태를 알지 않는다. 호출부가 조회 상태로 분기하고, 로딩 중에는 같은 자리에 `Chart.Skeleton`을 렌더한다.

```tsx
const { data, isPending } = useQuery(salesChartQueryOptions(period));

if (isPending) return <Chart.Skeleton type="bar" aria-label="이번 달 매출" />;

return (
  <Chart config={SALES_CHART_CONFIG} data={data} aria-label="이번 달 매출">
    …
  </Chart>
);
```

- **Provider·데이터 비의존.** `ChartProvider` 없이 렌더된다. `useChartContext`를 쓰지 않으므로 Suspense `fallback`으로도 그대로 쓸 수 있다.
- **레이아웃 고정.** 실제 차트와 같은 `size`·`legend` 규칙으로 크기를 잡아, 로딩이 끝나도 카드 높이가 흔들리지 않는다.
- **우선순위.** 로딩 → 빈 상태 → 데이터 순서는 호출부 분기로 결정된다. 로딩이 끝난 뒤 데이터가 비어 있으면 `Chart`가 `Chart.Empty`를 보여준다.

| `type`  | 플롯 자리                                          | 범례 자리 |
| ------- | -------------------------------------------------- | --------- |
| `bar`   | 가로 기준선 + 높이가 다른 막대 5개 (`size`별 두께) | 칩 4개    |
| `donut` | `size`별 외경의 링 + 중앙 텍스트 2줄 자리          | 칩 5개    |

막대 높이는 고정 배열 상수(`CHART_SKELETON_BAR_HEIGHTS`)로 둔다. 난수를 쓰면 SSR과 하이드레이션 결과가 달라진다. 색은 `Skeleton` 기본값(`bg-muted`)을 쓰고 `motion-reduce:animate-none`을 더한다.

Figma에 로딩 시안이 없어 위 형태(차트 모양 · `bg-muted` · pulse · 막대 5개)를 이 컴포넌트의 로딩 디자인으로 확정한다.

| prop         | 타입                  | 기본값           | 설명                        |
| ------------ | --------------------- | ---------------- | --------------------------- |
| `type`       | `'bar' \| 'donut'`    | —                | 플롯 모양                   |
| `size`       | `'large' \| 'small'`  | `useChartSize()` | Root와 같은 판정            |
| `legend`     | `'bottom' \| 'right'` | `'bottom'`       | Root와 같은 배치            |
| `aria-label` | `string`              | —                | 필수. 로딩 중인 차트의 이름 |

### `config`와 계열 순서

`config`는 shadcn `ChartConfig`를 그대로 쓴다. **선언 순서가 곧 계열 순서다.**

- 막대: 아래 → 위 누적 순서. 마지막 계열에만 상단 radius를 준다.
- 도넛: 12시 방향부터 시계 방향 순서.
- 범례: 같은 순서로 나열.

데이터 형태는 두 가지다.

- **wide** (막대): 행마다 계열 키가 컬럼이다. `{ label: '1째 주', product: 1200000, service: 300000 }`. 누적할 키는 `config` 키에서 파생하므로 `valueKey`를 넘기지 않는다.
- **long** (도넛): 행 하나가 계열 하나다. `{ category: 'product', amount: 1200000 }`. Root에 `valueKey`를, `Chart.Donut`에 `nameKey`(→ `config` 키)를 넘긴다.

`valueKey`를 Root에 두는 이유는 빈 상태·합계 계산(`useChartSummary`)이 Root의 Provider에서 한 번만 일어나기 때문이다. `valueKey`가 있으면 `row[valueKey]`의 합, 없으면 모든 행의 `config` 키 값 합을 쓴다.

### Root props

| prop         | 타입                        | 기본값           | 설명                                           |
| ------------ | --------------------------- | ---------------- | ---------------------------------------------- |
| `config`     | `ChartConfig`               | —                | 계열 라벨·색                                   |
| `data`       | `Record<string, unknown>[]` | —                | 차트 데이터                                    |
| `valueKey`   | `string`                    | —                | long 형태(도넛)일 때 값 컬럼. wide 형태면 생략 |
| `size`       | `'large' \| 'small'`        | `useChartSize()` | 지정하면 반응형 판정을 건너뛴다                |
| `legend`     | `'bottom' \| 'right'`       | `'bottom'`       | 범례 배치                                      |
| `aria-label` | `string`                    | —                | 필수. 차트의 접근성 이름                       |

`legend`는 `size`에서 파생하지 않는다. 도넛은 `small`에서 우측 범례지만 막대는 `small`에서도 하단 범례라, 파생 규칙이 차트 종류에 따라 갈린다. Root는 차트 종류를 모르므로 호출부가 명시한다.

## 반응형 — `size`

막대 두께와 도넛 반지름은 recharts prop이라 CSS 미디어 쿼리로 바꿀 수 없다. [pagination](../pagination/README.md)과 같은 방식으로 **`size`를 JS 값으로 단일화**한다.

- `useChartSize`는 `useSyncExternalStore` + `matchMedia`로 판정한다.
- `getServerSnapshot`은 `large`를 반환한다. SSR은 데스크톱 기준으로 그리고, 모바일에서는 마운트 직후 `small`로 교정된다.
- 미디어 쿼리 값은 `--breakpoint-tablet`(46.5rem)과 같아야 하는 계약이므로 `CHART_BREAKPOINT` 상수 한 곳에만 둔다.

| `size`  | 막대                                             | 도넛                |
| ------- | ------------------------------------------------ | ------------------- |
| `large` | Figma `Sales Chart` 두께                         | `size=large` 반지름 |
| `small` | **얇은 막대** (모바일 시안의 선 형태, 누적 유지) | `size=small` 반지름 |

모바일 도넛은 시안상 더 작게 그려져 있지만 `small`로 통일한다. 막대 두께·도넛 반지름의 구체 수치는 UI PR에서 `get_design_context`로 측정해 이 표에 기록한다. 스크린샷 기준 추정치는 도넛 외경 `large` 약 252px·`small` 약 152px이다.

## y축 눈금

recharts 자동 눈금을 쓴다. 비교한 대안은 아래와 같다.

| 방식                               | 장점                                   | 단점                                                    |
| ---------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| 범위 고정 (항상 0/400만/800만)     | Figma와 정확히 일치, 기간 간 비교 용이 | 소규모 매장은 막대가 눌리고, 초과 시 잘림               |
| 눈금 3개 고정 + 데이터 기반 최댓값 | 가로선 3개 유지, 높이 활용             | 올림 함수 구현·테스트 필요                              |
| **recharts 자동 (채택)**           | 구현 비용 없음, 높이 활용              | 가로선 개수가 데이터에 따라 달라져 Figma와 다를 수 있음 |

눈금 값 표시는 `formatCompactKrw`로 통일한다 (`4000000` → `400만`, `0` → `0`). `Chart.Bar`의 `tickFormatter` prop으로 바꿀 수 있다.

## variant (cva)

| 대상            | 축                         | 값                                                        |
| --------------- | -------------------------- | --------------------------------------------------------- |
| `ChartRoot`     | `legend`                   | `bottom` (세로 쌓기) / `right` (가로 배치, 가운데 정렬)   |
| `ChartCenter`   | `size`                     | `large` (`text-xl` bold) / `small` (`text-sm` bold)       |
| `ChartLegend`   | `size`                     | `large` (`text-base`) / `small` (`text-xs`)               |
| `ChartSkeleton` | `type` × `size` × `legend` | 플롯 모양·크기와 범례 배치. 값은 위 컴포넌트들과 공유한다 |

## 디자인 토큰 매핑

### 일치 (그대로 사용)

Figma 변수가 모두 [colors.css](../../../src/assets/styles/colors.css)의 기존 토큰과 일치한다. **신설 토큰은 없다.**

| Figma 변수      | 토큰                    | 용도        |
| --------------- | ----------------------- | ----------- |
| `primary/300`   | `--color-primary-300`   | 도넛 계열   |
| `primary/500`   | `--color-primary-500`   | 도넛 계열   |
| `primary/700`   | `--color-primary-700`   | 도넛 계열   |
| `secondary/500` | `--color-secondary-500` | 도넛 계열   |
| `secondary/600` | `--color-secondary-600` | 막대 계열   |
| `secondary/700` | `--color-secondary-700` | 도넛 계열   |
| `slate/200`     | `--color-slate-200`     | 빈 상태 링  |
| `slate/100`     | `--color-slate-100`     | 가로 기준선 |
| `slate/500`     | `--color-slate-500`     | 텍스트      |

계열 색은 컴포넌트가 아니라 호출부 `config`에 둔다. 막대 계열 색의 정확한 토큰은 UI PR에서 `get_design_context`로 확정한다.

## 접근성

- Root는 `role="figure"` + 필수 `aria-label`.
- 범례는 `<ul>`/`<li>`로 렌더하고 색 칩은 `aria-hidden`. 라벨 텍스트가 계열 이름을 전달한다.
- recharts 3의 `accessibilityLayer`(기본 활성)를 끄지 않는다.
- `Chart.Center`의 금액은 텍스트 노드로 렌더해 스크린리더가 읽는다.
- `Chart.Skeleton`은 `role="status"` + `aria-busy="true"`를 두고, 시각적으로 숨긴 텍스트로 "{aria-label} 불러오는 중"을 읽힌다. 스켈레톤 도형은 `aria-hidden`.

## 렌더링 경계

- `_common/Chart/*`와 `useChartSize`는 모두 `'use client'`다. recharts가 DOM 측정·이벤트를 쓴다.
- `tickFormatter` 같은 함수 prop은 RSC 경계를 넘을 수 없다. 서버 컴포넌트에서 쓸 때는 도메인 래퍼를 클라이언트 컴포넌트로 두고 그 안에서 `Chart`를 조합한다.
- [rendering.md](../../architecture/rendering.md) 금지 목록을 따른다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다. **소스 파일 하나당 테스트 파일 하나**를 두고, 파일명은 소스 파일명을 camelCase로 바꾼 `xxx.test.tsx`를 쓴다. 파일 안에서는 **export된 함수 단위로 `describe`를 나눈다.** 로직 검증은 훅·유틸 테스트에 모으고, 컴포넌트 테스트는 슬롯 렌더·빈 상태 분기·cva·className 병합만 확인한다.

```
test/components/_common/Chart/chart.test.tsx
test/components/_common/Chart/chartRoot.test.tsx
test/components/_common/Chart/chartPlot.test.tsx
test/components/_common/Chart/chartBar.test.tsx
test/components/_common/Chart/chartDonut.test.tsx
test/components/_common/Chart/chartCenter.test.tsx
test/components/_common/Chart/chartLegend.test.tsx
test/components/_common/Chart/chartEmpty.test.tsx
test/components/_common/Chart/chartSkeleton.test.tsx

test/providers/chart/chartProvider.test.tsx

test/hooks/chart/useChartContext.test.tsx
test/hooks/chart/useChartSeries.test.tsx
test/hooks/chart/useChartSummary.test.tsx
test/hooks/chart/useChartSize.test.tsx

test/lib/utilities/formatCompactKrw.test.ts
```

생성물 `_common/ui/chart.tsx`는 테스트하지 않는다.

### 파일별 검증 책임

| 테스트 파일                | 검증                                                                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chart.test.tsx`           | (유닛) `Object.assign` 합성 — 루트가 `ChartRoot`, 서브컴포넌트 7종이 각 구현과 동일 참조. (통합) 막대·도넛 실사용 조합 렌더, 빈 상태 전환 시 슬롯 표시 변화 |
| `chartRoot.test.tsx`       | Provider 값 주입, `legend` 배치 클래스, `role="figure"`·`aria-label`, `size` 명시 시 판정 생략                                                              |
| `chartPlot.test.tsx`       | 슬롯 렌더, `relative` 기본 클래스, className 병합                                                                                                           |
| `chartBar.test.tsx`        | 계열 수만큼 `Bar` 렌더, 최상단 계열 radius, 빈 상태 `null`, `tickFormatter` 기본값·교체                                                                     |
| `chartDonut.test.tsx`      | 조각 수·색, `size`별 반지름, 빈 상태 단색 링                                                                                                                |
| `chartCenter.test.tsx`     | `label`·`value` 렌더, `size` cva, className 병합                                                                                                            |
| `chartLegend.test.tsx`     | `<ul>`·`<li>` 구조, 순서·라벨·색 칩 `aria-hidden`, 빈 상태 `null`                                                                                           |
| `chartEmpty.test.tsx`      | 빈 상태에서만 `children` 렌더                                                                                                                               |
| `chartSkeleton.test.tsx`   | Provider 없이 렌더, `type`별 플롯 모양·범례 칩 수, `size`·`legend` 클래스, `role="status"`·`aria-busy`·숨김 텍스트, 도형 `aria-hidden`                      |
| `chartProvider.test.tsx`   | `useChartSummary` 결과가 컨텍스트에 실리는지, 자식 전달                                                                                                     |
| `useChartContext.test.tsx` | Provider 안 값 반환, 밖에서 throw                                                                                                                           |
| `useChartSeries.test.tsx`  | 선언 순서 보존, `label`·`color` 매핑, 빈 `config`                                                                                                           |
| `useChartSummary.test.tsx` | wide·long 형태별 합계, 빈 배열·전부 0이면 `isEmpty`, 일부 값 누락                                                                                           |
| `useChartSize.test.tsx`    | `matchMedia` 모킹으로 `large`/`small`, 변경 구독, 서버 스냅샷 `large`                                                                                       |
| `formatCompactKrw.test.ts` | 0, 만 단위 미만, 만 단위, 억 단위 경계                                                                                                                      |

### 테스트 환경

- jsdom에는 레이아웃이 없어 `ResponsiveContainer`의 크기가 0이 된다. `ResizeObserver`를 모킹하고, 생성물 `ChartContainer`의 `initialDimension`에 기대 렌더를 확인한다.
- jest-dom 매처·DOM cleanup을 담당하는 `test/setup.ts`는 현재 Modal 테스트 스택(`feat/common-modal-test`)에 있고 `dev`에는 없다. 테스트 PR 시점에 `dev`에 병합돼 있으면 재사용하고, 아니면 같은 내용으로 추가한다.

## 단계별 PR 계획

GitHub [stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)로 진행한다. 각 브랜치는 바로 아래 브랜치를 base로 하고, 맨 아래만 `dev`를 향한다. 작업은 `git worktree`(`../frontend-chart`)에서 `origin/dev`로부터 분기한다.

| 순서 | 브랜치                      | base                        | 내용                                                                                                                                                                                                   |
| ---- | --------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `feat/common-chart`         | `dev`                       | **이 설계 문서** + `docs/README.md` · `docs/component/README.md` 인덱스 갱신                                                                                                                           |
| 2    | `feat/common-chart-ui`      | `feat/common-chart`         | `shadcn add chart`(`card.tsx` 삭제)·`shadcn add skeleton` + `ChartProvider`·`useChartContext`·`useChartSeries` + compound 슬롯·`Chart.Skeleton`. 데이터가 있을 때 Figma대로 렌더 (`size="large"` 고정) |
| 3    | `feat/common-chart-feature` | `feat/common-chart-ui`      | `useChartSummary` + 빈 상태 분기(`Chart.Empty`·단색 링·Legend 숨김) + `useChartSize`(얇은 막대·small 도넛·Skeleton 포함) + `formatCompactKrw`                                                          |
| 4    | `feat/common-chart-test`    | `feat/common-chart-feature` | Vitest 테스트                                                                                                                                                                                          |

중간 브랜치를 수정하면 **아래 브랜치를 위 브랜치로 merge해서** 전파한다. rebase 후 force push는 하지 않는다.

## 확인 필요

아래 항목은 **임의로 확정하지 않는다.** 확인 후 이 문서에 반영한다.

### 1. 툴팁

Figma에 시안이 없다. 실제 툴팁 동작을 확인한 뒤 후속 PR에서 `Chart.Tooltip`(생성물 `ChartTooltip` + `ChartTooltipContent` 래핑)으로 추가한다.

### 2. `size` 판정 훅 공통화

`useChartSize`와 Pagination의 `usePaginationSize`는 같은 `matchMedia` 판정을 한다. Pagination이 아직 병합 전이라 이번에는 Chart 전용으로 두고, 둘 다 병합되면 공통 훅으로 합칠지 결정한다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 상태 도구 선택: [architecture/state-management.md](../../architecture/state-management.md)
- `size` JS 판정 선례: [component/pagination/README.md](../pagination/README.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
