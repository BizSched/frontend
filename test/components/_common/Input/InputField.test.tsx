import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Input } from '@components/_common/Input/Input';
import { InputField } from '@components/_common/Input/InputField';

afterEach(cleanup);

describe('InputField', () => {
  it('label이 렌더되고 input과 htmlFor로 연결된다', () => {
    render(
      <InputField id="email" label="이메일">
        <Input />
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
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      'email-error',
    );
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
