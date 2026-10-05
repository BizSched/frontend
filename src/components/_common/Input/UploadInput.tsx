'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { FileUpIcon, UploadIcon } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
} from 'react';

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
  const [hasFile, setHasFile] = useState(false);
  const handleClick = () => inputRef.current?.click();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasFile(Boolean(event.currentTarget.files?.length));
    inputProps?.onChange?.(event);
  };

  useEffect(() => {
    const form = inputRef.current?.form;
    const handleReset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) setHasFile(false);
      });
    };
    form?.addEventListener('reset', handleReset);
    return () => form?.removeEventListener('reset', handleReset);
  }, [inputProps?.form]);

  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        {...inputProps}
        ref={inputRef}
        id={inputId}
        type="file"
        onChange={handleChange}
        hidden
      />
      <button
        type="button"
        aria-controls={inputId}
        aria-label={label}
        disabled={inputProps?.disabled}
        onClick={handleClick}
        className={cn(
          hasFile
            ? 'flex w-full items-center gap-1 overflow-hidden rounded-[14px] bg-slate-50 px-4 py-3.5 text-sm leading-5 font-medium tracking-[-0.03em] text-slate-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none disabled:cursor-not-allowed'
            : uploadInputVariants({ size, tone }),
          className,
        )}
      >
        {hasFile ? (
          <FileUpIcon
            aria-hidden="true"
            className="size-6 shrink-0 text-slate-400"
          />
        ) : (
          <UploadIcon aria-hidden="true" className="shrink-0 text-slate-400" />
        )}
        <span>{hasFile ? '첨부파일' : label}</span>
      </button>
    </>
  );
}

export { UploadInput };
export type { UploadInputProps };
