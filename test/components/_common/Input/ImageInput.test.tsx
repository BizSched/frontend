import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ImageInput } from '@components/_common/Input/ImageInput';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ImageInput', () => {
  it('선택 이미지를 표시하고 삭제하면 native input과 호출부에도 반영한다', () => {
    const createObjectURL = vi.fn(() => 'blob:test-image');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal(
      'URL',
      Object.assign(class extends URL {}, { createObjectURL, revokeObjectURL }),
    );
    const onChange = vi.fn();
    render(
      <ImageInput
        aria-label="이미지 선택"
        inputProps={{ name: 'image', onChange }}
      />,
    );
    const input = screen.getByLabelText<HTMLInputElement>('이미지 선택', {
      selector: 'input',
    });
    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('img', { name: 'photo.png' })).toHaveAttribute(
      'src',
      'blob:test-image',
    );
    expect(input.files?.[0]).toBe(file);
    Reflect.deleteProperty(input, 'files');
    fireEvent.click(screen.getByRole('button', { name: 'photo.png 삭제' }));
    expect(
      screen.queryByRole('img', { name: 'photo.png' }),
    ).not.toBeInTheDocument();
    expect(input.value).toBe('');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-image');
    expect(
      screen.getByRole('button', { name: '이미지 선택' }),
    ).toBeInTheDocument();
  });

  it('폼 초기화 시 미리보기를 지우고 URL을 해제한다', async () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal(
      'URL',
      Object.assign(class extends URL {}, {
        createObjectURL: () => 'blob:reset-image',
        revokeObjectURL,
      }),
    );
    render(
      <form aria-label="이미지 폼">
        <ImageInput aria-label="이미지 선택" />
      </form>,
    );
    fireEvent.change(
      screen.getByLabelText('이미지 선택', { selector: 'input' }),
      {
        target: {
          files: [new File(['image'], 'photo.png', { type: 'image/png' })],
        },
      },
    );
    fireEvent.reset(screen.getByRole('form', { name: '이미지 폼' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('img', { name: 'photo.png' }),
      ).not.toBeInTheDocument(),
    );
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:reset-image');
  });

  it('default surface와 접근성 이름, 안내 텍스트를 렌더한다', () => {
    render(<ImageInput aria-label="이미지를 선택해주세요" />);
    const trigger = screen.getByRole('button', {
      name: '이미지를 선택해주세요',
    });
    expect(trigger).toHaveClass(
      'h-[101px]',
      'w-full',
      'rounded-[16px]',
      'border-dashed',
      'justify-center',
      'bg-slate-50',
    );
    expect(trigger).toHaveTextContent('이미지 첨부');
    expect(trigger).toHaveAttribute('type', 'button');
  });

  it('label로 연결된 hidden file input의 기본 accept는 image/*이다', () => {
    render(<ImageInput aria-label="이미지 선택" />);
    const input = screen.getByLabelText('이미지 선택', { selector: 'input' });
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('hidden');
    expect(input).not.toBeVisible();
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('accept와 multiple, id를 전달한다', () => {
    render(
      <ImageInput
        aria-label="이미지 선택"
        inputProps={{ id: 'image', accept: 'image/png', multiple: true }}
      />,
    );
    const input = screen.getByLabelText('이미지 선택', { selector: 'input' });
    expect(input).toHaveAttribute('id', 'image');
    expect(input).toHaveAttribute('accept', 'image/png');
    expect(input).toHaveAttribute('multiple');
  });

  it('trigger를 클릭하면 연결된 input을 한 번 클릭한다', () => {
    render(<ImageInput aria-label="이미지 선택" />);
    const input = screen.getByLabelText('이미지 선택', { selector: 'input' });
    const click = vi.spyOn(input, 'click');
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-controls',
      input.id,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('disabled일 때 파일 선택을 실행하지 않는다', () => {
    render(
      <ImageInput aria-label="이미지 선택" inputProps={{ disabled: true }} />,
    );
    const input = screen.getByLabelText('이미지 선택', { selector: 'input' });
    const click = vi.spyOn(input, 'click');
    expect(input).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.click(screen.getByRole('button'));
    expect(click).not.toHaveBeenCalled();
  });
});
