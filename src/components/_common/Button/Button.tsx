import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-full px-[18px] font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0',
  {
    variants: {
      hierarchy: {
        primary:
          'border border-transparent bg-primary-500 text-accent-500 hover:bg-secondary-600 hover:text-accent-500 data-disabled:bg-slate-100 data-disabled:text-slate-300',
        secondary:
          'border border-primary-700 bg-transparent text-accent-500 hover:border-primary-700 hover:bg-primary-100 hover:text-accent-500 data-disabled:border-slate-100 data-disabled:bg-transparent data-disabled:text-slate-300',
        tertiary:
          'border border-slate-200 bg-transparent text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-500 data-disabled:border-slate-100 data-disabled:bg-transparent data-disabled:text-slate-300',
      },
      size: {
        large: cn(typographyVariants({ role: 'label' }), 'h-14 py-3.5'),
        medium: cn(typographyVariants({ role: 'label' }), 'h-12 py-3'),
        small: cn(typographyVariants({ role: 'label' }), 'h-11 py-2.5'),
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
