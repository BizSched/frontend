import { cn } from '@lib/utilities/cn';

interface TableRootProps extends Omit<
  React.ComponentPropsWithRef<'table'>,
  'className'
> {
  className?: string;
}

function TableRoot({ className, ...props }: TableRootProps) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

export { TableRoot };
export type { TableRootProps };
