import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@lib/utilities/cn';

const formDropdownButtonVariants = cva(
  'bg-white-50 inline-flex shrink-0 cursor-pointer items-center justify-between gap-2 px-4 text-[#333333] outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed data-[popup-open]:shadow-[0px_2px_4px_rgba(0,0,0,0.08)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-[#a4a4a4] [&_svg]:transition-transform data-[popup-open]:[&_svg]:rotate-180',
  {
    variants: {
      size: {
        large:
          'w-[276px] rounded-[20px] py-3.5 text-lg font-semibold tracking-[-0.03em] [&_svg]:size-6',
        medium: 'h-11 w-37.5 rounded-[14px] text-sm font-medium [&_svg]:size-5',
        small: 'h-9 w-25.5 rounded-[14px] text-sm font-medium [&_svg]:size-5',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

interface FormDropdownButtonProps
  extends
    ButtonPrimitive.Props,
    VariantProps<typeof formDropdownButtonVariants> {
  placeholder?: ReactNode;
}

function FormDropdownButton({
  className,
  size,
  placeholder,
  children,
  ...props
}: FormDropdownButtonProps) {
  const hasValue = children !== undefined && children !== null;

  return (
    <ButtonPrimitive
      data-slot="form-dropdown-button"
      className={cn(formDropdownButtonVariants({ size, className }))}
      {...props}
    >
      <span
        data-placeholder={hasValue ? undefined : true}
        className="truncate data-placeholder:text-[#a4a4a4]"
      >
        {hasValue ? children : placeholder}
      </span>
      <ChevronDownIcon aria-hidden="true" />
    </ButtonPrimitive>
  );
}

export { FormDropdownButton, formDropdownButtonVariants };
export type { FormDropdownButtonProps };
