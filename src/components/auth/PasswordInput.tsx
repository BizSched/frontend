'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { forwardRef, useState } from 'react';

import { Input, type InputProps } from '@components/_common/Input/Input';
import { InputAction } from '@components/_common/Input/InputAction';

type PasswordInputProps = Omit<InputProps, 'type' | 'rightSlot'>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const [isVisible, setIsVisible] = useState(false);

    const handleVisibilityToggle = () => setIsVisible((prev) => !prev);

    return (
      <Input
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        autoComplete="current-password"
        rightSlot={
          <InputAction
            aria-label="비밀번호 보기"
            aria-pressed={isVisible}
            onClick={handleVisibilityToggle}
            className="[&_svg]:size-6"
          >
            {isVisible ? <EyeIcon aria-hidden /> : <EyeOffIcon aria-hidden />}
          </InputAction>
        }
        {...props}
      />
    );
  },
);

export { PasswordInput };
export type { PasswordInputProps };
