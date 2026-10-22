import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Button } from './Button';

const meta = {
  title: 'Common/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    children: '버튼',
    hierarchy: 'primary',
    size: 'large',
    onClick: fn(),
  },
  argTypes: {
    hierarchy: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    size: {
      control: 'select',
      options: ['large', 'medium', 'small'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const hierarchies = ['primary', 'secondary', 'tertiary'] as const;
const sizes = ['large', 'medium', 'small'] as const;

export const Playground: Story = {};

export const Overview: Story = {
  name: '크기와 위계',
  render: (args) => (
    <div className="grid grid-cols-[auto_repeat(3,max-content)] items-center gap-4">
      <span />
      {sizes.map((size) => (
        <span key={size} className="text-center text-sm text-slate-500">
          {size}
        </span>
      ))}
      {hierarchies.map((hierarchy) => (
        <div key={hierarchy} className="contents">
          <span className="text-sm font-medium text-slate-700">
            {hierarchy}
          </span>
          {sizes.map((size) => (
            <Button {...args} key={size} hierarchy={hierarchy} size={size}>
              {args.children}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  name: '비활성 상태',
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      {hierarchies.map((hierarchy) => (
        <Button {...args} key={hierarchy} hierarchy={hierarchy} disabled>
          {hierarchy}
        </Button>
      ))}
    </div>
  ),
};
