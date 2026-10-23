'use client';

import { Popover } from '@base-ui/react/popover';

import { cn } from '@lib/utilities/cn';

type DatePickerPopoverProps = Popover.Root.Props;

function DatePickerPopover(props: DatePickerPopoverProps) {
  return <Popover.Root {...props} />;
}

type DatePickerPopoverTriggerProps = Popover.Trigger.Props;

function DatePickerPopoverTrigger(props: DatePickerPopoverTriggerProps) {
  return <Popover.Trigger data-slot="date-picker-popover-trigger" {...props} />;
}

interface DatePickerPopoverContentProps extends Omit<
  Popover.Popup.Props,
  'className'
> {
  className?: string;
  align?: Popover.Positioner.Props['align'];
  sideOffset?: Popover.Positioner.Props['sideOffset'];
}

function DatePickerPopoverContent({
  align = 'start',
  sideOffset = 8,
  className,
  ...props
}: DatePickerPopoverContentProps) {
  return (
    <Popover.Portal>
      <Popover.Positioner
        data-slot="date-picker-popover-positioner"
        className="z-(--z-popover)"
        align={align}
        sideOffset={sideOffset}
      >
        <Popover.Popup
          data-slot="date-picker-popover-content"
          className={cn(
            'w-82 origin-(--transform-origin) overflow-clip rounded-[1rem] border border-[rgb(0_0_0/0.08)] bg-white-50 shadow-[0_20px_24px_-4px_rgb(10_13_18/0.08),0_8px_8px_-4px_rgb(10_13_18/0.03),0_3px_3px_-1.5px_rgb(10_13_18/0.04)] outline-none data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 motion-reduce:animate-none',
            className,
          )}
          {...props}
        />
      </Popover.Positioner>
    </Popover.Portal>
  );
}

export {
  DatePickerPopover,
  DatePickerPopoverTrigger,
  DatePickerPopoverContent,
};
export type {
  DatePickerPopoverProps,
  DatePickerPopoverTriggerProps,
  DatePickerPopoverContentProps,
};
