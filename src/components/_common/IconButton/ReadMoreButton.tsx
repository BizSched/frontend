import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@lib/utilities/cn';

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
  const Icon = state === 'open' ? ChevronUpIcon : ChevronDownIcon;

  return (
    <ButtonPrimitive
      data-slot="read-more-button"
      className={cn(
        ICON_BUTTON_BASE_CLASSNAME,
        readMoreButtonVariants({ className }),
      )}
      {...props}
    >
      <Icon size={24} className="text-[#A4A4A4]" />
    </ButtonPrimitive>
  );
}

export { ReadMoreButton, readMoreButtonVariants };
