import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ImageInput } from './ImageInput';
import { UploadInput } from './UploadInput';

const meta = {
  title: 'Common/FileInput',
  component: UploadInput,
  parameters: { layout: 'centered' },
  args: {
    label: '파일을 선택해주세요',
    inputProps: { onChange: fn() },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(424px, 85vw)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UploadInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: '파일 입력 모아보기',
  render: (args) => (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">파일 · 이미지 입력</h1>
      <p className="text-sm text-slate-400">
        버튼을 눌러 파일을 선택하세요. 선택 이벤트는 Actions에서 확인할 수
        있습니다. 파일 선택 후 첨부파일 표시, 이미지 선택 후 미리보기와 삭제를
        확인하세요.
      </p>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">파일 선택 · Large</h2>
        <UploadInput {...args} />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">파일 선택 · Small / 흰 배경</h2>
        <UploadInput {...args} size="small" tone="default" />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">여러 파일 선택 · PDF / 이미지</h2>
        <UploadInput
          {...args}
          inputProps={{
            ...args.inputProps,
            multiple: true,
            accept: '.pdf,image/*',
          }}
        />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">비활성화</h2>
        <UploadInput {...args} inputProps={{ disabled: true }} />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">이미지 선택</h2>
        <ImageInput
          aria-label="이미지를 선택해주세요"
          inputProps={args.inputProps}
        />
        <ImageInput
          aria-label="이미지 선택 비활성화"
          inputProps={{ disabled: true }}
        />
      </section>
    </div>
  ),
};

export const FileSelection: Story = {};

export const ImageSelection: Story = {
  render: (args) => (
    <ImageInput
      aria-label="이미지를 선택해주세요"
      inputProps={args.inputProps}
    />
  ),
};

export const Attached: Story = {
  name: '첨부 완료 · 파일과 이미지',
  render: (args) => (
    <form className="flex flex-col gap-6" aria-label="첨부 테스트 폼">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">파일 첨부 완료</h2>
        <UploadInput
          {...args}
          inputProps={{ ...args.inputProps, name: 'attachment' }}
        />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">이미지 첨부 완료 · 삭제 가능</h2>
        <ImageInput
          aria-label="이미지 첨부 테스트"
          inputProps={{ name: 'images', multiple: true }}
        />
      </section>
      <button type="reset" className="text-sm underline">
        폼 초기화
      </button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileInput = canvas.getByLabelText<HTMLInputElement>(
      '파일을 선택해주세요',
      {
        selector: 'input',
      },
    );
    const imageInput = canvas.getByLabelText<HTMLInputElement>(
      '이미지 첨부 테스트',
      {
        selector: 'input',
      },
    );
    const image = await fetch('/globe.svg').then((response) => response.blob());
    const files = new DataTransfer();
    files.items.add(
      new File(['첨부 테스트'], 'sample.txt', { type: 'text/plain' }),
    );
    fileInput.files = files.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    const images = new DataTransfer();
    images.items.add(
      new File([image], 'sample-image.svg', { type: 'image/svg+xml' }),
    );
    images.items.add(
      new File([image], 'second-image.svg', { type: 'image/svg+xml' }),
    );
    imageInput.files = images.files;
    imageInput.dispatchEvent(new Event('change', { bubbles: true }));
    await expect(canvas.getByText('첨부파일')).toBeVisible();
    await expect(
      canvas.getByRole('img', { name: 'sample-image.svg' }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'second-image.svg 삭제' }),
    );
    const form = canvas.getByRole('form', {
      name: '첨부 테스트 폼',
    }) as HTMLFormElement;
    const data = new FormData(form);
    await expect((data.get('attachment') as File).name).toBe('sample.txt');
    await expect(data.getAll('images')).toHaveLength(1);
    await expect((data.get('images') as File).name).toBe('sample-image.svg');
  },
};
