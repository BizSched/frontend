import '@testing-library/jest-dom/vitest';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { CalendarIcon, SearchIcon, XIcon } from 'lucide-react';
import { createRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Input } from '@components/_common/Input/Input';
import { InputAction } from '@components/_common/Input/InputAction';
import { InputField } from '@components/_common/Input/InputField';
import { InputIcon } from '@components/_common/Input/InputIcon';

afterEach(cleanup);

function ControlledInput() {
  const [value, setValue] = useState('처음 값');

  return (
    <Input
      aria-label="제목"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      rightSlot={
        <InputAction aria-label="내용 지우기" onClick={() => setValue('')}>
          <XIcon aria-hidden />
        </InputAction>
      }
    />
  );
}

interface FormValues {
  email: string;
}

interface RegisteredInputProps {
  onSubmit: SubmitHandler<FormValues>;
}

function RegisteredInput({ onSubmit }: RegisteredInputProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: 'before@example.com' },
    mode: 'onBlur',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputField
        id="registered-email"
        label="이메일"
        errorMessage={errors.email?.message}
      >
        <Input {...register('email', { required: '이메일을 입력해주세요' })} />
      </InputField>
      <button type="button" onClick={() => setFocus('email')}>
        입력으로 이동
      </button>
      <button type="submit">저장</button>
    </form>
  );
}

describe('Input', () => {
  it('네이티브 속성과 ref를 실제 input에 전달한다', () => {
    const ref = createRef<HTMLInputElement>();
    const handleBlur = vi.fn();

    render(
      <Input
        ref={ref}
        aria-label="이메일"
        type="email"
        name="email"
        placeholder="이메일을 입력해주세요"
        defaultValue="hello@example.com"
        required
        autoComplete="email"
        onBlur={handleBlur}
      />,
    );

    const input = screen.getByRole('textbox', { name: '이메일' });
    expect(ref.current).toBe(input);
    expect(input).toHaveValue('hello@example.com');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toHaveAttribute('placeholder', '이메일을 입력해주세요');
    expect(input).toBeRequired();

    ref.current?.focus();
    expect(input).toHaveFocus();
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledOnce();
  });

  it('controlled 입력 변경과 clear 액션을 호출부 상태에 반영한다', () => {
    render(<ControlledInput />);
    const input = screen.getByRole('textbox', { name: '제목' });

    expect(input).toHaveValue('처음 값');
    fireEvent.change(input, { target: { value: '새 제목' } });
    expect(input).toHaveValue('새 제목');
    fireEvent.click(screen.getByRole('button', { name: '내용 지우기' }));
    expect(input).toHaveValue('');
  });

  it('uncontrolled 입력은 네이티브 폼 제출 값과 reset을 지원한다', () => {
    render(
      <form aria-label="검색 폼">
        <Input aria-label="검색어" name="keyword" defaultValue="기본 검색어" />
        <button type="reset">초기화</button>
      </form>,
    );
    const input = screen.getByRole('textbox', { name: '검색어' });
    const form = screen.getByRole('form', {
      name: '검색 폼',
    }) as HTMLFormElement;

    fireEvent.change(input, { target: { value: '변경한 검색어' } });
    expect(new FormData(form).get('keyword')).toBe('변경한 검색어');
    fireEvent.click(screen.getByRole('button', { name: '초기화' }));
    expect(input).toHaveValue('기본 검색어');
  });

  it('disabled는 네이티브 입력을 비활성화하고 상태와 배경보다 우선한다', () => {
    render(<Input aria-label="제목" disabled status="typing" tone="default" />);
    const input = screen.getByRole('textbox', { name: '제목' });

    expect(input).toBeDisabled();
    expect(input.parentElement).toHaveClass('bg-slate-50', 'border-slate-300');
    expect(input.parentElement).not.toHaveClass(
      'bg-white-50',
      'border-primary-500',
    );
  });

  it('disabled 상태는 실제 비활성화를 제공하고 명시적 disabled prop을 우선한다', () => {
    const { rerender } = render(<Input aria-label="제목" status="disabled" />);
    expect(screen.getByRole('textbox', { name: '제목' })).toBeDisabled();

    rerender(<Input aria-label="제목" status="disabled" disabled={false} />);
    const input = screen.getByRole('textbox', { name: '제목' });
    expect(input).toBeEnabled();
    expect(input.parentElement).not.toHaveClass('cursor-not-allowed');
  });

  it('readOnly와 muted는 비활성화하지 않고 폼 값과 포커스를 유지한다', () => {
    render(
      <Input
        aria-label="제목"
        readOnly
        tone="muted"
        defaultValue="읽기 전용"
      />,
    );
    const input = screen.getByRole('textbox', { name: '제목' });

    expect(input).toHaveAttribute('readonly');
    expect(input).toBeEnabled();
    expect(input).toHaveValue('읽기 전용');
    expect(input.parentElement).toHaveClass('bg-slate-50');
    input.focus();
    expect(input).toHaveFocus();
  });

  it.each([
    ['default', 'border-slate-300', 'text-slate-500'],
    ['done', 'border-slate-300', 'text-slate-700'],
    ['typing', 'border-primary-500', 'text-slate-700'],
    ['error', 'border-warning-500', 'text-slate-700'],
  ] as const)(
    '%s 상태의 디자인 토큰과 오류 의미를 적용한다',
    (status, border, color) => {
      render(<Input aria-label="제목" status={status} />);
      const input = screen.getByRole('textbox', { name: '제목' });

      expect(input.parentElement).toHaveClass(border, color);
      if (status === 'error') {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      } else {
        expect(input).not.toHaveAttribute('aria-invalid');
      }
    },
  );

  it('large/small 크기를 적용하고 시각적 size를 네이티브 size로 넘기지 않는다', () => {
    const { rerender } = render(<Input aria-label="제목" />);
    const input = screen.getByRole('textbox', { name: '제목' });

    expect(input.parentElement).toHaveClass(
      'h-14',
      'rounded-[16px]',
      'text-base',
    );
    expect(input).not.toHaveAttribute('size');
    rerender(<Input aria-label="제목" size="small" />);
    expect(input.parentElement).toHaveClass(
      'h-11',
      'rounded-[12px]',
      'text-sm',
    );
    expect(input).not.toHaveAttribute('size');
  });

  it.each(['large', 'small'] as const)(
    '검색은 %s에서도 높이 48px와 pill 형태 및 기본 장식 아이콘을 쓴다',
    (size) => {
      render(
        <Input
          aria-label="할 일 검색"
          variant="search"
          type="search"
          size={size}
          placeholder="할 일을 검색해주세요"
        />,
      );
      const input = screen.getByRole('searchbox', { name: '할 일 검색' });
      const surface = input.parentElement;

      expect(surface).toHaveClass('h-12', 'rounded-full', 'px-5', 'py-3');
      expect(surface).not.toHaveClass(
        'h-14',
        'h-11',
        'rounded-[16px]',
        'rounded-[12px]',
      );
      expect(input).toHaveAttribute('placeholder', '할 일을 검색해주세요');
      expect(
        surface?.querySelector('[data-slot="input-icon"]'),
      ).toHaveAttribute('aria-hidden', 'true');
      expect(surface?.querySelector('svg')).toBeInTheDocument();
    },
  );

  it('검색 우측 슬롯을 교체하거나 null로 숨길 수 있다', () => {
    const { rerender } = render(
      <Input
        aria-label="검색"
        variant="search"
        rightSlot={
          <InputAction aria-label="검색 실행">
            <SearchIcon aria-hidden />
          </InputAction>
        }
      />,
    );
    expect(
      screen.getByRole('button', { name: '검색 실행' }),
    ).toBeInTheDocument();
    const surface = screen.getByRole('textbox', { name: '검색' }).parentElement;
    expect(
      surface?.querySelector('[data-slot="input-icon"]'),
    ).not.toBeInTheDocument();

    rerender(<Input aria-label="검색" variant="search" rightSlot={null} />);
    expect(surface?.querySelector('svg')).not.toBeInTheDocument();
  });

  it('좌우 슬롯과 작은 장식 아이콘을 렌더하고 액션 이름을 접근성 트리에 유지한다', () => {
    render(
      <Input
        aria-label="시작일"
        size="small"
        leftSlot={
          <InputIcon size="small">
            <CalendarIcon />
          </InputIcon>
        }
        rightSlot={
          <InputAction aria-label="날짜 지우기">
            <XIcon aria-hidden />
          </InputAction>
        }
      />,
    );
    const surface = screen.getByRole('textbox', {
      name: '시작일',
    }).parentElement;
    expect(surface?.querySelector('[data-slot="input-icon"]')).toHaveClass(
      'size-5',
      'shrink-0',
    );
    expect(
      screen.getByRole('button', { name: '날짜 지우기' }),
    ).toBeInTheDocument();
  });

  it('className이 surface의 기본 variant 클래스를 덮어쓸 수 있다', () => {
    render(
      <Input
        aria-label="제목"
        className="h-10 w-64 rounded-none bg-slate-100"
      />,
    );
    const surface = screen.getByRole('textbox', { name: '제목' }).parentElement;

    expect(surface).toHaveClass('h-10', 'w-64', 'rounded-none', 'bg-slate-100');
    expect(surface).not.toHaveClass(
      'h-14',
      'w-full',
      'rounded-[16px]',
      'bg-white-50',
    );
  });

  it('InputField 안에서도 RHF register의 초기값, ref, blur 검증과 제출을 보존한다', async () => {
    const handleSubmit = vi.fn();
    render(<RegisteredInput onSubmit={handleSubmit} />);
    const input = screen.getByRole('textbox', { name: '이메일' });
    expect(input).toHaveValue('before@example.com');

    fireEvent.click(screen.getByRole('button', { name: '입력으로 이동' }));
    await waitFor(() => expect(input).toHaveFocus());
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(
      await screen.findByText('이메일을 입력해주세요'),
    ).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');

    fireEvent.change(input, { target: { value: 'after@example.com' } });
    fireEvent.blur(input);
    await waitFor(() => expect(input).not.toHaveAttribute('aria-invalid'));
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith(
        { email: 'after@example.com' },
        expect.anything(),
      ),
    );
  });
});

describe('InputField', () => {
  it('오류 메시지가 있어도 자식의 disabled 상태와 명시적 prop을 보존한다', () => {
    const { rerender } = render(
      <InputField id="email" label="이메일" errorMessage="잘못된 이메일입니다">
        <Input status="disabled" />
      </InputField>,
    );
    const input = screen.getByLabelText('이메일');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.parentElement).toHaveClass('bg-slate-50', 'border-slate-300');

    rerender(
      <InputField id="email" label="이메일" errorMessage="잘못된 이메일입니다">
        <Input status="disabled" disabled={false} />
      </InputField>,
    );
    expect(input).toBeEnabled();
    expect(input.parentElement).toHaveClass('border-warning-500');
  });

  it('label, 설명, 오류를 연결하고 기존 설명과 ref를 보존한다', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <>
        <p id="external-help">회사 계정을 사용하세요</p>
        <InputField
          id="email"
          label="이메일"
          description="이메일 주소를 입력하세요"
          errorMessage="잘못된 이메일입니다"
        >
          <Input ref={ref} aria-describedby="external-help" />
        </InputField>
      </>,
    );
    const input = screen.getByRole('textbox', { name: '이메일' });

    expect(screen.getByLabelText('이메일')).toBe(input);
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'external-help email-description email-error',
    );
    expect(input).toHaveAccessibleDescription(
      '회사 계정을 사용하세요 이메일 주소를 입력하세요 잘못된 이메일입니다',
    );
    expect(input.parentElement).toHaveClass('border-warning-500');
  });

  it('자식의 명시적인 id와 aria 상태를 유지하고 빈 메시지를 연결하지 않는다', () => {
    render(
      <InputField
        id="field-email"
        label="이메일"
        description=""
        errorMessage=""
      >
        <Input id="native-email" aria-invalid="grammar" />
      </InputField>,
    );
    const input = screen.getByLabelText('이메일');
    expect(input).toHaveAttribute('id', 'native-email');
    expect(input).toHaveAttribute('aria-invalid', 'grammar');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('오류가 해제되면 오류 연결만 제거하고 호출부 상태와 설명을 유지한다', () => {
    const { rerender } = render(
      <InputField
        id="title"
        label="제목"
        description="최대 30자"
        errorMessage="제목이 필요합니다"
      >
        <Input status="done" />
      </InputField>,
    );
    const input = screen.getByLabelText('제목');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    rerender(
      <InputField id="title" label="제목" description="최대 30자">
        <Input status="done" />
      </InputField>,
    );
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute('aria-describedby', 'title-description');
    expect(input).toHaveAccessibleDescription('최대 30자');
    expect(input.parentElement).toHaveClass(
      'border-slate-300',
      'text-slate-700',
    );
    expect(screen.queryByText('제목이 필요합니다')).not.toBeInTheDocument();
  });
});

describe('InputAction', () => {
  it('기본 액션은 폼을 제출하지 않으며 disabled를 전달한다', () => {
    const handleClick = vi.fn();
    const handleSubmit = vi.fn((event) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={handleSubmit}>
        <InputAction aria-label="비밀번호 보기" onClick={handleClick}>
          <XIcon aria-hidden />
        </InputAction>
      </form>,
    );
    const button = screen.getByRole('button', { name: '비밀번호 보기' });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
    expect(handleSubmit).not.toHaveBeenCalled();

    rerender(
      <InputAction aria-label="비밀번호 보기" onClick={handleClick} disabled />,
    );
    fireEvent.click(screen.getByRole('button', { name: '비밀번호 보기' }));
    expect(handleClick).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('button', { name: '비밀번호 보기' }),
    ).toBeDisabled();
  });
});
