import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SearchIcon } from 'lucide-react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Input } from '@components/_common/Input/Input';
import { InputIcon } from '@components/_common/Input/InputIcon';

afterEach(cleanup);

describe('Input', () => {
  it('placeholder를 렌더한다', () => {
    render(<Input id="test" placeholder="이메일을 입력해주세요" />);
    expect(
      screen.getByPlaceholderText('이메일을 입력해주세요'),
    ).toBeInTheDocument();
  });

  it('disabled prop이 전달되면 input이 비활성화된다', () => {
    render(<Input id="test" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('readOnly prop이 전달되면 input이 읽기 전용이 된다', () => {
    render(<Input id="test" readOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('value + onChange(controlled)를 지원한다', () => {
    render(<Input id="test" value="hello" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('forwardRef로 input DOM까지 ref가 전달된다', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input id="test" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('size="large" 클래스가 적용된다', () => {
    const { container } = render(<Input id="test" size="large" />);
    expect(container.querySelector('[data-slot="input-root"]')).toHaveClass(
      'h-14',
      'rounded-[16px]',
    );
  });

  it('size="small" 클래스가 적용된다', () => {
    const { container } = render(<Input id="test" size="small" />);
    expect(container.querySelector('[data-slot="input-root"]')).toHaveClass(
      'h-11',
      'rounded-[12px]',
    );
  });

  it('variant="search" 클래스가 적용된다', () => {
    const { container } = render(<Input id="test" variant="search" />);
    expect(container.querySelector('[data-slot="input-root"]')).toHaveClass(
      'h-12',
      'rounded-full',
    );
  });

  it('tone="muted" 클래스가 적용된다', () => {
    const { container } = render(<Input id="test" tone="muted" />);
    expect(container.querySelector('[data-slot="input-root"]')).toHaveClass(
      'bg-slate-50',
    );
  });

  it('status="typing" 클래스가 적용된다', () => {
    const { container } = render(<Input id="test" status="typing" />);
    expect(container.querySelector('[data-slot="input-root"]')).toHaveClass(
      'border-primary-500',
    );
  });

  it('status="error" 클래스가 적용된다', () => {
    const { container } = render(<Input id="test" status="error" />);
    expect(container.querySelector('[data-slot="input-root"]')).toHaveClass(
      'border-warning-500',
    );
  });

  it('disabled일 때 disabled 상태 클래스가 적용된다', () => {
    const { container } = render(<Input id="test" disabled />);
    expect(container.querySelector('[data-slot="input-root"]')).toHaveClass(
      'disabled:cursor-not-allowed',
    );
  });

  it('leftSlot이 렌더된다', () => {
    const { container } = render(
      <Input
        id="test"
        leftSlot={
          <InputIcon size="large">
            <SearchIcon />
          </InputIcon>
        }
      />,
    );
    expect(
      container.querySelector('[data-slot="input-left-slot"]'),
    ).toBeTruthy();
  });

  it('rightSlot이 렌더된다', () => {
    const { container } = render(
      <Input
        id="test"
        rightSlot={
          <InputIcon size="large">
            <SearchIcon />
          </InputIcon>
        }
      />,
    );
    expect(
      container.querySelector('[data-slot="input-right-slot"]'),
    ).toBeTruthy();
  });

  it('호출부 className이 cn으로 병합된다', () => {
    const { container } = render(<Input id="test" className="custom-class" />);
    expect(container.querySelector('[data-slot="input-root"]')).toHaveClass(
      'custom-class',
    );
  });
});
