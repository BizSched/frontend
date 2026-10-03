import { cn } from '@lib/utilities/cn';

interface TableCaptionProps extends Omit<
  React.ComponentPropsWithRef<'caption'>,
  'className'
> {
  className?: string;
}

function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { TableCaption };
export type { TableCaptionProps };
