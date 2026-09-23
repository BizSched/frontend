import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-full px-[18px] font-semibold whitespace-nowrap outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0',
  {
    variants: {
      hierarchy: {
        primary:
          'bg-primary-500 text-white-50 hover:bg-secondary-600 disabled:bg-[#bbbbbb]',
        secondary:
          'border border-primary-500 text-secondary-600 hover:border-secondary-600 hover:text-primary-500 disabled:border-slate-400 disabled:text-slate-400',
        tertiary:
          'border border-[#cccccc] text-secondary-300 hover:border-[#bbbbbb] hover:text-accent-300 disabled:border-slate-400 disabled:text-slate-400',
      },
      size: {
        large:
          'h-14 w-[13.9375rem] py-3.5 text-lg leading-7 tracking-[-0.03em]',
        medium:
          'h-12 w-[11.375rem] py-3 text-base leading-6 tracking-[-0.03em]',
        small: 'h-11 w-[8.375rem] py-2.5 text-sm leading-5 tracking-[-0.03em]',
      },
    },
    defaultVariants: {
      hierarchy: 'primary',
      size: 'large',
    },
  },
);

interface ButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
}

function Button({
  className,
  hierarchy,
  size,
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ hierarchy, size, className }))}
      {...props}
    >
      {icon}
      <span className="truncate">{children}</span>
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
