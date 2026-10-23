import { cn } from '@lib/utilities/cn';

interface TableRowProps extends Omit<
  React.ComponentPropsWithRef<'tr'>,
  'className'
> {
  className?: string;
}

function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
        className,
      )}
      {...props}
    />
  );
}

export { TableRow };
export type { TableRowProps };
