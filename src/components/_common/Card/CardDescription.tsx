import { cn } from '@lib/utilities/cn';

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
        'text-sm leading-5 font-medium tracking-[-0.03em] text-slate-400',
        className,
      )}
      {...props}
    />
  );
}

export { CardDescription };
export type { CardDescriptionProps };
