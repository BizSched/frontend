import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Toaster, toast } from './Toaster';

const meta = {
  title: 'Common/Toast',
  component: Toaster,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    position: 'bottom-right',
    duration: 4000,
  },
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
    duration: {
      control: 'number',
      description: '알림이 자동으로 닫히기까지의 시간(ms)',
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

const BUTTON_CLASS_NAME =
  'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

export const Overview: Story = {
  args: {
    duration: 3000,
  },

  name: '알림 종류 및 동작',

  render: (args) => (
    <>
      <Toaster {...args} />
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 p-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-slate-900">Toast 알림</h1>
          <p className="mt-1 text-sm text-slate-500">
            버튼을 눌러 알림 유형과 로딩 상태 갱신을 확인하세요.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            onClick={() => toast.success('저장되었습니다.')}
          >
            성공
          </button>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            onClick={() => toast.error('저장에 실패했습니다.')}
          >
            오류
          </button>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            onClick={() => toast.info('새로운 업데이트가 있습니다.')}
          >
            안내
          </button>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            onClick={() => toast.warning('입력 내용을 확인해 주세요.')}
          >
            경고
          </button>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            onClick={() =>
              toast.loading('저장 중입니다.', { id: 'storybook-save' })
            }
          >
            저장 중
          </button>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            onClick={() =>
              toast.success('저장되었습니다.', { id: 'storybook-save' })
            }
          >
            저장 완료
          </button>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            onClick={() => toast.dismiss()}
          >
            모두 닫기
          </button>
        </div>
      </main>
    </>
  ),
};
