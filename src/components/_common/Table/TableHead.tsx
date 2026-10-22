import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

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
        typographyVariants({ role: 'label' }),
        'h-10 px-2 text-left align-middle whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

export { TableHead };
export type { TableHeadProps };
