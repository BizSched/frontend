import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const cardVariants = cva('flex w-full flex-col overflow-clip', {
  variants: {
    radius: {
      lg: 'rounded-[24px]',
      xl: 'rounded-[28px]',
      '2xl': 'rounded-[32px]',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      employee: 'px-[38px] pt-7 pb-8',
    },
    tone: {
      default: 'bg-white-50',
      muted: 'bg-slate-50',
      highlight: 'bg-primary-100',
    },
    interactive: {
      false: '',
      true: 'transition-shadow hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none',
    },
  },
  defaultVariants: {
    radius: 'lg',
    padding: 'md',
    tone: 'default',
    interactive: false,
  },
});

interface CardPanelProps
  extends
    React.ComponentPropsWithRef<'div'>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

function CardPanel({
  asChild = false,
  radius,
  padding,
  tone,
  interactive,
  className,
  ...props
}: CardPanelProps) {
  const Component = asChild ? Slot : 'div';

  return (
    <Component
      data-slot="card"
      className={cn(
        cardVariants({ radius, padding, tone, interactive }),
        className,
      )}
      {...props}
    />
  );
}

export { CardPanel };
export type { CardPanelProps };
