'use client';

import { Button } from '@components/_common/Button/Button';
import { DatePickerCalendar } from '@components/_common/DatePicker/DatePickerCalendar';

import { cn } from '@lib/utilities/cn';

const FOOTER_BUTTON_CLASS_NAME = 'h-10 w-auto min-w-0 flex-1';

interface DatePickerPanelProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

function DatePickerPanel({
  selected,
  onSelect,
  onCancel,
  onConfirm,
}: DatePickerPanelProps) {
  return (
    <>
      <DatePickerCalendar
        selected={selected}
        onSelect={onSelect}
        className="self-center"
      />
      <div className="flex gap-3 px-4 pb-4">
        <Button
          hierarchy="tertiary"
          size="small"
          className={cn(FOOTER_BUTTON_CLASS_NAME, 'text-muted-foreground')}
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          hierarchy="primary"
          size="small"
          className={FOOTER_BUTTON_CLASS_NAME}
          disabled={!selected}
          onClick={onConfirm}
        >
          확인
        </Button>
      </div>
    </>
  );
}

export { DatePickerPanel };
export type { DatePickerPanelProps };
