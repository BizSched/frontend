import { cn } from '@lib/utilities/cn';

interface TableHeaderProps extends Omit<
  React.ComponentPropsWithRef<'thead'>,
  'className'
> {
  className?: string;
}

function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  );
}

export { TableHeader };
export type { TableHeaderProps };
