import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { ChartConfig } from '@providers/types/chart';

import { Chart } from './Chart';

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

const BAR_CONFIG = {
  sales: { label: '상품판매', color: 'var(--chart-1)' },
  service: { label: '서비스판매', color: 'var(--chart-2)' },
  online: { label: '배달·온라인', color: 'var(--chart-3)' },
  etc: { label: '기타', color: 'var(--chart-4)' },
} satisfies ChartConfig;

const BAR_DATA = [
  {
    week: '1주',
    sales: 2_000_000,
    service: 1_500_000,
    online: 1_000_000,
    etc: 500_000,
  },
  {
    week: '2주',
    sales: 2_000_000,
    service: 1_500_000,
    online: 5_000_000,
    etc: 500_000,
  },
  {
    week: '3주',
    sales: 2_100_000,
    service: 1_250_000,
    online: 3_000_000,
    etc: 500_000,
  },
  {
    week: '4주',
    sales: 4_000_000,
    service: 3_500_000,
    online: 1_000_000,
    etc: 500_000,
  },
  {
    week: '5주',
    sales: 2_100_000,
    service: 4_500_000,
    online: 1_000_000,
    etc: 500_000,
  },
];

const DONUT_CONFIG = {
  product: { label: '상품 판매', color: 'var(--chart-1)' },
  service: { label: '서비스', color: 'var(--chart-2)' },
  event: { label: '이벤트', color: 'var(--chart-3)' },
  online: { label: '배달/온라인', color: 'var(--chart-4)' },
  etc: { label: '기타', color: 'var(--chart-5)' },
} satisfies ChartConfig;

const DONUT_DATA = [
  { category: 'product', amount: 4_200_000 },
  { category: 'service', amount: 1_800_000 },
  { category: 'event', amount: 2_700_000 },
  { category: 'online', amount: 1_500_000 },
  { category: 'etc', amount: 1_300_000 },
];

const EMPTY_MESSAGE = (
  <p className="text-center text-sm font-bold text-slate-400">
    카테고리를 추가해주세요.
  </p>
);

/* ------------------------------------------------------------------ */
/*  Meta                                                               */
/* ------------------------------------------------------------------ */

const meta = {
  title: 'Common/Chart',
  component: Chart,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { children: null },
  argTypes: {
    size: {
      control: 'radio',
      options: ['large', 'small'],
      description: '범례 글자·칩·도넛 반지름 (차트 종류와 무관하게 통일)',
    },
    legend: {
      control: 'radio',
      options: ['bottom', 'right'],
      description: '범례 위치. size에서 파생하지 않으므로 호출부가 명시',
    },
    children: { control: false },
    config: { control: false },
    data: { control: false },
  },
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Bar                                                                */
/* ------------------------------------------------------------------ */

/** 누적 막대. `config` 선언 순서가 아래 → 위 누적 순서다. */
export const BarLarge: Story = {
  name: 'Bar / Large',
  args: {
    config: BAR_CONFIG,
    data: BAR_DATA,
    size: 'large',
    'aria-label': '이번 달 주차별 매출',
  },
  render: (args) => (
    <div style={{ width: 720 }}>
      <Chart {...args}>
        <Chart.Plot>
          <Chart.Bar xKey="week" />
        </Chart.Plot>
        <Chart.Legend />
      </Chart>
    </div>
  ),
};

export const BarSmall: Story = {
  name: 'Bar / Small',
  args: { ...BarLarge.args, size: 'small' },
  render: BarLarge.render,
};

/* ------------------------------------------------------------------ */
/*  Donut                                                              */
/* ------------------------------------------------------------------ */

/** long 포맷(행 하나 = 계열 하나). `nameKey`로 행과 계열을 매핑한다. */
export const DonutLarge: Story = {
  name: 'Donut / Large',
  args: {
    config: DONUT_CONFIG,
    data: DONUT_DATA,
    valueKey: 'amount',
    size: 'large',
    'aria-label': '이번 달 카테고리별 매출',
  },
  render: (args) => (
    <div style={{ width: 401 }}>
      <Chart {...args}>
        <Chart.Plot>
          <Chart.Donut nameKey="category" />
          <Chart.Center label="10월 매출" value="11,500,000 원" />
        </Chart.Plot>
        <Chart.Legend />
      </Chart>
    </div>
  ),
};

/** small 도넛은 범례를 우측에 세로로 둔다. `legend`는 `size`에서 파생하지 않으므로 호출부가 명시한다. */
export const DonutSmall: Story = {
  name: 'Donut / Small (legend right)',
  args: { ...DonutLarge.args, size: 'small', legend: 'right' },
  render: (args) => (
    <Chart {...args}>
      <Chart.Plot>
        <Chart.Donut nameKey="category" />
        <Chart.Center label="총 매출" value="11,500,000 원" />
      </Chart.Plot>
      <Chart.Legend />
    </Chart>
  ),
};

/* ------------------------------------------------------------------ */
/*  Empty                                                              */
/* ------------------------------------------------------------------ */

export const BarEmpty: Story = {
  name: 'Empty / Bar',
  args: { ...BarLarge.args, data: [] },
  render: (args) => (
    <div style={{ width: 720 }}>
      <Chart {...args}>
        <Chart.Plot>
          <Chart.Bar xKey="week" />
        </Chart.Plot>
        <Chart.Legend />
        <Chart.Empty>{EMPTY_MESSAGE}</Chart.Empty>
      </Chart>
    </div>
  ),
};

/** 빈 상태에서 도넛은 `slate-200` 단색 링, 범례 대신 `Chart.Empty` 내용을 보여 준다. */
export const DonutEmpty: Story = {
  name: 'Empty / Donut',
  args: { ...DonutLarge.args, data: [] },
  render: (args) => (
    <div style={{ width: 401 }}>
      <Chart {...args}>
        <Chart.Plot>
          <Chart.Donut nameKey="category" />
          <Chart.Center label="총 매출" value="0 원" />
        </Chart.Plot>
        <Chart.Legend />
        <Chart.Empty>{EMPTY_MESSAGE}</Chart.Empty>
      </Chart>
    </div>
  ),
};
