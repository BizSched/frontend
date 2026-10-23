import { Slot } from '@radix-ui/react-slot';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

interface CardTitleProps extends Omit<
  React.ComponentPropsWithRef<'h2'>,
  'className'
> {
  className?: string;
  asChild?: boolean;
}

function CardTitle({ asChild = false, className, ...props }: CardTitleProps) {
  const Component = asChild ? Slot : 'h2';

  return (
    <Component
      data-slot="card-title"
      className={cn(
        cn(typographyVariants({ role: 'subtitle' }), 'text-slate-500'),
        className,
      )}
      {...props}
    />
  );
}

export { CardTitle };
export type { CardTitleProps };
