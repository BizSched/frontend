import { cn } from '@lib/utilities/cn';

interface TableHeadProps extends Omit<
  React.ComponentPropsWithRef<'th'>,
  'className'
> {
  className?: string;
}

function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

export { TableHead };
export type { TableHeadProps };
