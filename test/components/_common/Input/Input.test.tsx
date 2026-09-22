import { render, screen } from '@testing-library/react';
import { SearchIcon } from 'lucide-react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from '@components/_common/Input/Input';
import { InputField } from '@components/_common/Input/InputField';
import { InputIcon } from '@components/_common/Input/InputIcon';

// ─── Input primitive ────────────────────────────────────────────────────────

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
    render(<Input id="test" size="large" data-testid="input-root" />);
    expect(screen.getByTestId('input-root')).toHaveClass(
      'h-14',
      'rounded-[16px]',
    );
  });

  it('size="small" 클래스가 적용된다', () => {
    render(<Input id="test" size="small" data-testid="input-root" />);
    expect(screen.getByTestId('input-root')).toHaveClass(
      'h-11',
      'rounded-[12px]',
    );
  });

  it('variant="search" 클래스가 적용된다', () => {
    render(<Input id="test" variant="search" data-testid="input-root" />);
    expect(screen.getByTestId('input-root')).toHaveClass(
      'h-12',
      'rounded-full',
    );
  });

  it('tone="muted" 클래스가 적용된다', () => {
    render(<Input id="test" tone="muted" data-testid="input-root" />);
    expect(screen.getByTestId('input-root')).toHaveClass('bg-slate-50');
  });

  it('status="typing" 클래스가 적용된다', () => {
    render(<Input id="test" status="typing" data-testid="input-root" />);
    expect(screen.getByTestId('input-root')).toHaveClass('border-primary-500');
  });

  it('status="error" 클래스가 적용된다', () => {
    render(<Input id="test" status="error" data-testid="input-root" />);
    expect(screen.getByTestId('input-root')).toHaveClass('border-warning-500');
  });

  it('disabled일 때 disabled 상태 클래스가 적용된다', () => {
    render(<Input id="test" disabled data-testid="input-root" />);
    expect(screen.getByTestId('input-root')).toHaveClass(
      'disabled:cursor-not-allowed',
    );
  });

  it('leftSlot이 렌더된다', () => {
    render(
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
      screen
        .getByTestId('input-root')
        .querySelector('[data-slot="input-left-slot"]'),
    ).toBeTruthy();
  });

  it('rightSlot이 렌더된다', () => {
    render(
      <Input
        id="test"
        rightSlot={
          <InputIcon size="large">
            <SearchIcon />
          </InputIcon>
        }
        data-testid="input-root"
      />,
    );
    expect(
      screen
        .getByTestId('input-root')
        .querySelector('[data-slot="input-right-slot"]'),
    ).toBeTruthy();
  });

  it('호출부 className이 cn으로 병합된다', () => {
    render(
      <Input id="test" className="custom-class" data-testid="input-root" />,
    );
    expect(screen.getByTestId('input-root')).toHaveClass('custom-class');
  });
});

// ─── InputField ─────────────────────────────────────────────────────────────

describe('InputField', () => {
  it('label이 렌더되고 input과 htmlFor로 연결된다', () => {
    render(
      <InputField id="email" label="이메일">
        <Input id="email" />
      </InputField>,
    );
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
  });

  it('description이 있을 때 렌더된다', () => {
    render(
      <InputField
        id="email"
        label="이메일"
        description="이메일 형식으로 입력하세요"
      >
        <Input id="email" />
      </InputField>,
    );
    expect(screen.getByText('이메일 형식으로 입력하세요')).toBeInTheDocument();
  });

  it('errorMessage가 있을 때 렌더되고 aria-invalid가 설정된다', () => {
    render(
      <InputField id="email" label="이메일" errorMessage="잘못된 이메일입니다.">
        <Input id="email" status="error" />
      </InputField>,
    );
    expect(screen.getByText('잘못된 이메일입니다.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { hidden: true }) ??
        screen.getByTestId?.('input-field-control') ??
        document.querySelector('[data-slot="input-field-control"]'),
    ).toHaveAttribute('aria-invalid', 'true');
  });

  it('errorMessage가 있으면 description은 렌더되지 않는다', () => {
    render(
      <InputField
        id="email"
        label="이메일"
        description="이메일 형식으로 입력하세요"
        errorMessage="잘못된 이메일입니다."
      >
        <Input id="email" status="error" />
      </InputField>,
    );
    expect(
      screen.queryByText('이메일 형식으로 입력하세요'),
    ).not.toBeInTheDocument();
  });
});
