import { cn } from '@lib/utilities/cn';

interface TableCellProps extends Omit<
  React.ComponentPropsWithRef<'td'>,
  'className'
> {
  className?: string;
}

function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

export { TableCell };
export type { TableCellProps };
