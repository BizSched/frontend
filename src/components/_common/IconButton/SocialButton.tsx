import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';

import { cn } from '@lib/utilities/cn';

import IcGoogle from '@assets/icons/ic_google.svg';
import IcKakao from '@assets/icons/ic_kakao.png';

import { ICON_BUTTON_BASE_CLASSNAME } from './iconButtonBase';

const socialButtonVariants = cva('relative size-14 overflow-hidden', {
  variants: {
    social: {
      Google: 'border border-[#ddd] bg-white-50',
      Kakao: 'bg-[#ffee01]',
    },
  },
  defaultVariants: {
    social: 'Google',
  },
});

type SocialButtonProps = Omit<ButtonPrimitive.Props, 'children'> &
  Required<Pick<ButtonPrimitive.Props, 'aria-label'>> &
  VariantProps<typeof socialButtonVariants>;

function SocialButton({
  className,
  social = 'Google',
  ...props
}: SocialButtonProps) {
  const isKakao = social === 'Kakao';

  return (
    <ButtonPrimitive
      data-slot="social-button"
      className={cn(
        ICON_BUTTON_BASE_CLASSNAME,
        socialButtonVariants({ social, className }),
      )}
      {...props}
    >
      {isKakao ? (
        <span className="relative block size-6 overflow-hidden">
          <span className="absolute top-[3.99%] left-0 h-[92.02%] w-full">
            <Image src={IcKakao} alt="" fill />
          </span>
        </span>
      ) : (
        <Image src={IcGoogle} alt="" width={24} height={24} unoptimized />
      )}
    </ButtonPrimitive>
  );
}

export { SocialButton, socialButtonVariants };
