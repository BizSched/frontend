import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { XIcon } from 'lucide-react';

import { cn } from '@lib/utilities/cn';

import { ICON_BUTTON_BASE_CLASSNAME } from './iconButtonBase';

const deleteButtonVariants = cva(
  'flex items-center justify-center border border-[#ccc] bg-[#fffffe]',
  {
    variants: {
      size: {
        small: 'size-[1.125rem]',
        large: 'size-6',
      },
    },
    defaultVariants: {
      size: 'small',
    },
  },
);

type DeleteButtonProps = Omit<ButtonPrimitive.Props, 'children'> &
  Required<Pick<ButtonPrimitive.Props, 'aria-label'>> &
  VariantProps<typeof deleteButtonVariants>;

function DeleteButton({
  className,
  size = 'small',
  ...props
}: DeleteButtonProps) {
  const iconSize = size === 'large' ? 16 : 11;

  return (
    <ButtonPrimitive
      data-slot="delete-button"
      className={cn(
        ICON_BUTTON_BASE_CLASSNAME,
        deleteButtonVariants({ size, className }),
      )}
      {...props}
    >
      <XIcon size={iconSize} strokeWidth={1.8} className="text-slate-300" />
    </ButtonPrimitive>
  );
}

export { DeleteButton, deleteButtonVariants };
