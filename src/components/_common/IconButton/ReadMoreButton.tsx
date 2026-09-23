import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import Image from 'next/image';

import { cn } from '@lib/utilities/cn';

import IcChevronDown from '@assets/icons/ic_chevron-down.svg';
import IcChevronUp from '@assets/icons/ic_chevron-up.svg';

import { ICON_BUTTON_BASE_CLASSNAME } from './iconButtonBase';

const readMoreButtonVariants = cva(
  'size-10 border border-[#c6c5c5] bg-[#fffffe]',
);

type ReadMoreButtonProps = Omit<ButtonPrimitive.Props, 'children'> &
  Required<Pick<ButtonPrimitive.Props, 'aria-label'>> & {
    state?: 'default' | 'open';
  };

function ReadMoreButton({
  className,
  state = 'default',
  ...props
}: ReadMoreButtonProps) {
  const isOpen = state === 'open';

  return (
    <ButtonPrimitive
      data-slot="read-more-button"
      className={cn(
        ICON_BUTTON_BASE_CLASSNAME,
        readMoreButtonVariants({ className }),
      )}
      {...props}
    >
      <Image
        src={isOpen ? IcChevronUp : IcChevronDown}
        alt=""
        width={24}
        height={24}
        unoptimized
      />
    </ButtonPrimitive>
  );
}

export { ReadMoreButton, readMoreButtonVariants };
