import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

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
      className={cn(
        cn(
          typographyVariants({ role: 'supporting' }),
          'mt-4 text-muted-foreground',
        ),
        className,
      )}
      {...props}
    />
  );
}

export { TableCaption };
export type { TableCaptionProps };
