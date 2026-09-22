import { cn } from '@lib/utilities/cn';

interface CardTitleProps extends Omit<
  React.ComponentPropsWithRef<'h2'>,
  'className'
> {
  className?: string;
}

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h2
      data-slot="card-title"
      className={cn(
        'text-xl leading-[30px] font-semibold tracking-[-0.03em] text-slate-500',
        className,
      )}
      {...props}
    />
  );
}

export { CardTitle };
export type { CardTitleProps };
