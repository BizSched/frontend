'use client';

import { Dialog } from '@base-ui/react/dialog';

import { cn } from '@lib/utilities/cn';

type DatePickerSheetProps = Dialog.Root.Props;

function DatePickerSheet(props: DatePickerSheetProps) {
  return <Dialog.Root {...props} />;
}

type DatePickerSheetTriggerProps = Dialog.Trigger.Props;

function DatePickerSheetTrigger(props: DatePickerSheetTriggerProps) {
  return <Dialog.Trigger data-slot="date-picker-sheet-trigger" {...props} />;
}

interface DatePickerSheetContentProps extends Omit<
  Dialog.Popup.Props,
  'className'
> {
  className?: string;
}

function DatePickerSheetContent({
  className,
  ...props
}: DatePickerSheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop
        data-slot="date-picker-sheet-backdrop"
        className="fixed inset-0 z-(--z-popover) bg-overlay data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:animate-in data-[open]:fade-in-0 motion-reduce:animate-none"
      />
      <Dialog.Popup
        data-slot="date-picker-sheet-content"
        aria-label="날짜 선택"
        className={cn(
          'fixed inset-x-0 bottom-0 z-(--z-popover) flex max-h-[85dvh] w-full flex-col overflow-y-auto rounded-t-[1rem] border border-b-0 border-[rgb(0_0_0/0.08)] bg-white-50 shadow-[0_20px_24px_-4px_rgb(10_13_18/0.08),0_8px_8px_-4px_rgb(10_13_18/0.03),0_3px_3px_-1.5px_rgb(10_13_18/0.04)] outline-none data-[closed]:animate-out data-[closed]:slide-out-to-bottom data-[open]:animate-in data-[open]:slide-in-from-bottom motion-reduce:animate-none',
          className,
        )}
        {...props}
      />
    </Dialog.Portal>
  );
}

export { DatePickerSheet, DatePickerSheetTrigger, DatePickerSheetContent };
export type {
  DatePickerSheetProps,
  DatePickerSheetTriggerProps,
  DatePickerSheetContentProps,
};
