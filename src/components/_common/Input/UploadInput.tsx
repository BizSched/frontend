'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { UploadIcon } from 'lucide-react';
import { useId, useRef, type ComponentPropsWithoutRef } from 'react';

import { cn } from '@lib/utilities/cn';

const uploadInputVariants = cva(
  'flex w-full items-center gap-2 border border-dashed border-slate-300 text-slate-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        large:
          'h-14 rounded-[16px] px-4 py-4 text-base tracking-[-0.02em] [&>svg]:size-6',
        small:
          'h-11 rounded-[12px] px-3 py-3 text-sm tracking-[-0.03em] [&>svg]:size-5',
      },
      tone: {
        default: 'bg-white-50',
        muted: 'bg-slate-50',
      },
    },
    defaultVariants: { size: 'large', tone: 'muted' },
  },
);

interface UploadInputProps extends VariantProps<typeof uploadInputVariants> {
  label: string;
  className?: string;
  inputProps?: Omit<ComponentPropsWithoutRef<'input'>, 'type'>;
}

function UploadInput({
  label,
  size,
  tone,
  className,
  inputProps,
}: UploadInputProps) {
  const generatedId = useId();
  const inputId = inputProps?.id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => inputRef.current?.click();

  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input {...inputProps} ref={inputRef} id={inputId} type="file" hidden />
      <button
        type="button"
        aria-controls={inputId}
        disabled={inputProps?.disabled}
        onClick={handleClick}
        className={cn(uploadInputVariants({ size, tone }), className)}
      >
        <UploadIcon aria-hidden="true" className="shrink-0 text-slate-400" />
        <span>{label}</span>
      </button>
    </>
  );
}

export { UploadInput };
export type { UploadInputProps };
