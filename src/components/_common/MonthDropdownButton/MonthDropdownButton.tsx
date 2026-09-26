import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@lib/utilities/cn';

const monthDropdownButtonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center rounded-full border border-slate-200 px-2 font-bold whitespace-nowrap text-slate-900 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 [&_svg]:text-[#a4a4a4] [&_svg]:transition-transform data-[popup-open]:[&_svg]:rotate-180',
  {
    variants: {
      size: {
        large: 'min-w-[5.25rem] gap-2.5 text-xl',
        small: 'gap-1 text-base',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

interface MonthDropdownButtonProps
  extends
    ButtonPrimitive.Props,
    VariantProps<typeof monthDropdownButtonVariants> {}

function MonthDropdownButton({
  className,
  size,
  children,
  ...props
}: MonthDropdownButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="month-dropdown-button"
      className={cn(monthDropdownButtonVariants({ size, className }))}
      {...props}
    >
      <span className="sr-only">월 선택, </span>
      {children}
      <ChevronDownIcon aria-hidden="true" />
    </ButtonPrimitive>
  );
}

export { MonthDropdownButton, monthDropdownButtonVariants };
export type { MonthDropdownButtonProps };
