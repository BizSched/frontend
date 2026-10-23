import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

interface CardDescriptionProps extends Omit<
  React.ComponentPropsWithRef<'p'>,
  'className'
> {
  className?: string;
}

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        cn(typographyVariants({ role: 'supporting' }), 'text-slate-400'),
        className,
      )}
      {...props}
    />
  );
}

export { CardDescription };
export type { CardDescriptionProps };
