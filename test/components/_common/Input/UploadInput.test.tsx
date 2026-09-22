import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UploadInput } from '@components/_common/Input/UploadInput';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('UploadInput', () => {
  it('label로 file input을 연결하고 native props를 전달한다', () => {
    render(
      <UploadInput
        label="파일 선택"
        inputProps={{
          id: 'attachment',
          accept: '.pdf',
          multiple: true,
          name: 'attachment',
        }}
      />,
    );
    const input = screen.getByLabelText('파일 선택', { selector: 'input' });
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('id', 'attachment');
    expect(input).toHaveAttribute('accept', '.pdf');
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('name', 'attachment');
    expect(input).not.toBeVisible();
    expect(screen.getByRole('button', { name: '파일 선택' })).toHaveTextContent(
      '파일 선택',
    );
  });

  it.each([
    ['large', 'h-14', 'rounded-[16px]', 'px-4', 'py-4'],
    ['small', 'h-11', 'rounded-[12px]', 'px-3', 'py-3'],
  ] as const)('%s 크기의 클래스를 적용한다', (size, height, radius, px, py) => {
    render(<UploadInput label="파일 선택" size={size} tone="muted" />);
    expect(screen.getByRole('button')).toHaveClass(
      height,
      radius,
      px,
      py,
      'border-dashed',
      'bg-slate-50',
    );
  });

  it('trigger를 클릭하면 연결된 input을 한 번 클릭한다', () => {
    render(<UploadInput label="파일 선택" />);
    const input = screen.getByLabelText('파일 선택', { selector: 'input' });
    const click = vi.spyOn(input, 'click');
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-controls', input.id);
    fireEvent.click(trigger);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('disabled일 때 trigger와 input이 비활성화된다', () => {
    render(<UploadInput label="파일 선택" inputProps={{ disabled: true }} />);
    const input = screen.getByLabelText('파일 선택', { selector: 'input' });
    const click = vi.spyOn(input, 'click');
    expect(input).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.click(screen.getByRole('button'));
    expect(click).not.toHaveBeenCalled();
  });

  it('파일 선택 이벤트를 호출부에 전달한다', () => {
    const onChange = vi.fn();
    render(<UploadInput label="파일 선택" inputProps={{ onChange }} />);
    const input = screen.getByLabelText<HTMLInputElement>('파일 선택', {
      selector: 'input',
    });
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input.files?.[0]).toBe(file);
  });
});
