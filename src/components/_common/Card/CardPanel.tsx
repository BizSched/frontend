import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const cardVariants = cva('flex w-full flex-col overflow-clip', {
  variants: {
    radius: {
      lg: 'rounded-[24px]',
      xl: 'rounded-[28px]',
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
      true: 'transition-colors hover:bg-white-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none',
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
    VariantProps<typeof cardVariants> {}

function CardPanel({
  radius,
  padding,
  tone,
  interactive,
  className,
  ...props
}: CardPanelProps) {
  return (
    <div
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
