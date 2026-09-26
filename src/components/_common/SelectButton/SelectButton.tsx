import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';

import { cn } from '@lib/utilities/cn';

type SelectButtonProps = TogglePrimitive.Props;

function SelectButton({ className, children, ...props }: SelectButtonProps) {
  return (
    <TogglePrimitive
      data-slot="select-button"
      className={cn(
        'data-pressed:bg-primary-100 data-pressed:shadow-select-button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm bg-slate-50 p-[0.625rem] text-center text-xs font-medium text-slate-500 transition-colors data-pressed:text-slate-800',
        className,
      )}
      {...props}
    >
      <span className="h-4.5 w-6 truncate">{children}</span>
    </TogglePrimitive>
  );
}

export { SelectButton };
