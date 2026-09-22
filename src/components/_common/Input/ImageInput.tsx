'use client';

import { ImageIcon } from 'lucide-react';
import { useId, useRef, type ComponentPropsWithoutRef } from 'react';

import { cn } from '@lib/utilities/cn';

interface ImageInputProps {
  'aria-label': string;
  className?: string;
  inputProps?: Omit<ComponentPropsWithoutRef<'input'>, 'type'>;
}

function ImageInput({
  'aria-label': ariaLabel,
  className,
  inputProps,
}: ImageInputProps) {
  const generatedId = useId();
  const inputId = inputProps?.id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => inputRef.current?.click();

  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel}
      </label>
      <input
        {...inputProps}
        ref={inputRef}
        id={inputId}
        type="file"
        accept={inputProps?.accept ?? 'image/*'}
        hidden
      />
      <button
        type="button"
        aria-label={ariaLabel}
        aria-controls={inputId}
        disabled={inputProps?.disabled}
        onClick={handleClick}
        className={cn(
          'focus-visible:ring-primary-500 flex h-[101px] w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-slate-300 bg-slate-50 text-sm tracking-[-0.03em] text-slate-500 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed',
          className,
        )}
      >
        <ImageIcon
          aria-hidden="true"
          className="size-6 shrink-0 text-slate-400"
        />
        <span>{ariaLabel}</span>
      </button>
    </>
  );
}

export { ImageInput };
export type { ImageInputProps };
