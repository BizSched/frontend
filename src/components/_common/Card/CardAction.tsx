import { cn } from '@lib/utilities/cn';

interface CardActionProps extends Omit<
  React.ComponentPropsWithRef<'div'>,
  'className'
> {
  className?: string;
}

function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn('flex shrink-0 items-center gap-2', className)}
      {...props}
    />
  );
}

export { CardAction };
export type { CardActionProps };
