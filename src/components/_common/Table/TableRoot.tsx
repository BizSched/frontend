import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

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
        className={cn(
          cn(typographyVariants({ role: 'body' }), 'w-full caption-bottom'),
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { TableRoot };
export type { TableRootProps };
