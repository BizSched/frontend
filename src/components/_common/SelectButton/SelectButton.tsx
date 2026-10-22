import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

type SelectButtonProps = TogglePrimitive.Props;

function SelectButton({ className, children, ...props }: SelectButtonProps) {
  return (
    <TogglePrimitive
      data-slot="select-button"
      className={cn(
        cn(
          typographyVariants({ role: 'label' }),
          'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm bg-slate-50 p-[0.625rem] text-center text-slate-500 transition-colors data-pressed:bg-primary-100 data-pressed:text-slate-800 data-pressed:shadow-select-button',
        ),
        className,
      )}
      {...props}
    >
      <span className="min-h-5 min-w-6">{children}</span>
    </TogglePrimitive>
  );
}

export { SelectButton };
