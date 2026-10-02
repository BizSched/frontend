import type { ReactNode } from 'react';

interface PartTimeScheduleFormFieldProps {
  label: string;
  labelId: string;
  isRequired?: boolean;
  children: ReactNode;
}

function PartTimeScheduleFormField({
  label,
  labelId,
  isRequired = false,
  children,
}: PartTimeScheduleFormFieldProps) {
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <p
        id={labelId}
        className="flex gap-px px-1 text-base font-semibold tracking-[-0.03em] text-[#333333] max-tablet:text-sm"
      >
        {label}
        {isRequired && (
          <>
            <span aria-hidden="true" className="text-primary-500">
              *
            </span>
            <span className="sr-only">(필수)</span>
          </>
        )}
      </p>
      {children}
    </div>
  );
}

export { PartTimeScheduleFormField };
