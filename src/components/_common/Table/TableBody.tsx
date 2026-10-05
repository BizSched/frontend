import { cn } from '@lib/utilities/cn';

interface TableBodyProps extends Omit<
  React.ComponentPropsWithRef<'tbody'>,
  'className'
> {
  className?: string;
}

function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

export { TableBody };
export type { TableBodyProps };
