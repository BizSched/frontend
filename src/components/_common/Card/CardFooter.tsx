import { cn } from '@lib/utilities/cn';

interface CardFooterProps extends Omit<
  React.ComponentPropsWithRef<'footer'>,
  'className'
> {
  className?: string;
}

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <footer
      data-slot="card-footer"
      className={cn('flex items-center justify-between gap-4', className)}
      {...props}
    />
  );
}

export { CardFooter };
export type { CardFooterProps };
