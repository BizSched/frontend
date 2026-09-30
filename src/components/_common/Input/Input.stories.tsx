import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MailIcon, EyeIcon, EyeOffIcon, XCircleIcon } from 'lucide-react';
import { fn } from 'storybook/test';

import { Input } from './Input';
import { InputAction } from './InputAction';
import { InputField } from './InputField';
import { InputIcon } from './InputIcon';

/* ------------------------------------------------------------------ */
/*  Meta                                                               */
/* ------------------------------------------------------------------ */

const meta = {
  title: 'Common/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    placeholder: '내용을 입력해 주세요',
    onChange: fn(),
  },
  argTypes: {
    size: {
      control: 'radio',
      options: ['large', 'small'],
      description: '인풋 높이 · 패딩 · 폰트 크기',
    },
    variant: {
      control: 'radio',
      options: ['default', 'search'],
      description:
        '형태 변형 (search 선택 시 둥근 모서리 + 검색 아이콘 자동 삽입)',
    },
    tone: {
      control: 'radio',
      options: ['default', 'muted'],
      description: '배경색 톤',
    },
    status: {
      control: 'radio',
      options: ['default', 'done', 'typing', 'error', 'disabled'],
      description: '상태별 테두리 · 텍스트 색상',
    },
    leftSlot: { control: false },
    rightSlot: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  기본 스토리                                                         */
/* ------------------------------------------------------------------ */

/** 기본 상태의 인풋입니다. */
export const Default: Story = {};

/* ------------------------------------------------------------------ */
/*  Size                                                               */
/* ------------------------------------------------------------------ */

export const SizeLarge: Story = {
  name: 'Size / Large',
  args: { size: 'large' },
};

export const SizeSmall: Story = {
  name: 'Size / Small',
  args: { size: 'small' },
};

/* ------------------------------------------------------------------ */
/*  Status                                                             */
/* ------------------------------------------------------------------ */

export const StatusDefault: Story = {
  name: 'Status / Default',
  args: { status: 'default' },
};

export const StatusDone: Story = {
  name: 'Status / Done',
  args: { status: 'done', defaultValue: '입력 완료된 텍스트' },
};

export const StatusTyping: Story = {
  name: 'Status / Typing',
  args: { status: 'typing', defaultValue: '입력 중…' },
};

export const StatusError: Story = {
  name: 'Status / Error',
  args: { status: 'error', defaultValue: '잘못된 값' },
};

export const StatusDisabled: Story = {
  name: 'Status / Disabled',
  args: { status: 'disabled', defaultValue: '비활성화된 입력' },
};

/* ------------------------------------------------------------------ */
/*  Variant                                                            */
/* ------------------------------------------------------------------ */

export const VariantSearch: Story = {
  name: 'Variant / Search',
  args: { variant: 'search', placeholder: '검색어를 입력해 주세요' },
};

/* ------------------------------------------------------------------ */
/*  Tone                                                               */
/* ------------------------------------------------------------------ */

export const ToneMuted: Story = {
  name: 'Tone / Muted',
  args: { tone: 'muted' },
};

/* ------------------------------------------------------------------ */
/*  Slot 조합                                                          */
/* ------------------------------------------------------------------ */

/** 왼쪽에 아이콘을 배치한 예시입니다. */
export const WithLeftIcon: Story = {
  name: 'Slot / Left Icon',
  args: {
    placeholder: '이메일을 입력해 주세요',
    leftSlot: (
      <InputIcon>
        <MailIcon />
      </InputIcon>
    ),
  },
};

/** 오른쪽에 액션 버튼(초기화)을 배치한 예시입니다. */
export const WithRightAction: Story = {
  name: 'Slot / Right Action (Clear)',
  args: {
    defaultValue: '지울 수 있는 텍스트',
    status: 'done',
    rightSlot: (
      <InputAction aria-label="입력 초기화">
        <XCircleIcon className="size-5 text-slate-400" />
      </InputAction>
    ),
  },
};

/** 양쪽 슬롯을 모두 사용한 예시입니다. */
export const WithBothSlots: Story = {
  name: 'Slot / Both Slots',
  args: {
    placeholder: '비밀번호를 입력해 주세요',
    type: 'password',
    leftSlot: (
      <InputIcon>
        <EyeOffIcon />
      </InputIcon>
    ),
    rightSlot: (
      <InputAction aria-label="비밀번호 보기">
        <EyeIcon className="size-5 text-slate-400" />
      </InputAction>
    ),
  },
};

/* ------------------------------------------------------------------ */
/*  InputField 조합                                                    */
/* ------------------------------------------------------------------ */

/** InputField 래퍼와 함께 사용하는 기본 예시입니다. */
export const FieldDefault: Story = {
  name: 'Field / Default',
  render: (args) => (
    <InputField
      id="email"
      label="이메일"
      description="회사 이메일을 입력해 주세요."
    >
      <Input {...args} placeholder="example@company.com" />
    </InputField>
  ),
};

/** InputField 에러 상태 예시입니다. */
export const FieldWithError: Story = {
  name: 'Field / Error',
  render: (args) => (
    <InputField
      id="email-error"
      label="이메일"
      errorMessage="올바른 이메일 형식이 아닙니다."
    >
      <Input {...args} defaultValue="invalid-email" />
    </InputField>
  ),
};
