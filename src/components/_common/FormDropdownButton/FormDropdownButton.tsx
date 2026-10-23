import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

const formDropdownButtonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-between gap-2 bg-white-50 px-4 text-slate-500 transition-shadow outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed data-[popup-open]:shadow-[0px_2px_4px_rgba(0,0,0,0.08)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-slate-300 [&_svg]:transition-transform data-[popup-open]:[&_svg]:rotate-180',
  {
    variants: {
      size: {
        large: cn(
          typographyVariants({ role: 'body' }),
          'w-[276px] rounded-[20px] py-3.5 [&_svg]:size-6',
        ),
        medium: cn(
          typographyVariants({ role: 'body' }),
          'h-11 w-37.5 rounded-[14px] [&_svg]:size-5',
        ),
        small: cn(
          typographyVariants({ role: 'body' }),
          'h-9 w-25.5 rounded-[14px] [&_svg]:size-5',
        ),
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
        className="truncate data-placeholder:text-slate-300"
      >
        {hasValue ? children : placeholder}
      </span>
      <ChevronDownIcon aria-hidden="true" />
    </ButtonPrimitive>
  );
}

export { FormDropdownButton, formDropdownButtonVariants };
export type { FormDropdownButtonProps };
