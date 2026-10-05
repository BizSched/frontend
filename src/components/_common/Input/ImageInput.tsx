'use client';

import { FileUpIcon } from 'lucide-react';
import Image from 'next/image';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
} from 'react';

import { DeleteButton } from '@components/_common/IconButton/DeleteButton';

import { cn } from '@lib/utilities/cn';

interface ImageInputProps {
  'aria-label': string;
  className?: string;
  inputProps?: Omit<ComponentPropsWithoutRef<'input'>, 'type'>;
}

interface ImagePreview {
  file: File;
  url: string;
}

function ImageInput({
  'aria-label': ariaLabel,
  className,
  inputProps,
}: ImageInputProps) {
  const generatedId = useId();
  const inputId = inputProps?.id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrls = useRef<string[]>([]);
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const handleClick = () => inputRef.current?.click();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    const nextPreviews = Array.from(event.currentTarget.files ?? []).map(
      (file) => ({
        file,
        url: URL.createObjectURL(file),
      }),
    );
    previewUrls.current = nextPreviews.map(({ url }) => url);
    setPreviews(nextPreviews);
    inputProps?.onChange?.(event);
  };
  const handleRemove = (index: number) => {
    const input = inputRef.current;
    if (!input || input.disabled) return;
    const remainingFiles = previews.filter(
      (_, fileIndex) => fileIndex !== index,
    );
    if (remainingFiles.length) {
      const transfer = new DataTransfer();
      remainingFiles.forEach(({ file }) => transfer.items.add(file));
      input.files = transfer.files;
    } else {
      input.value = '';
    }
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  useEffect(() => {
    const form = inputRef.current?.form;
    const clearUrls = () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current = [];
    };
    const handleReset = (event: Event) => {
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        clearUrls();
        setPreviews([]);
      });
    };
    form?.addEventListener('reset', handleReset);
    return () => {
      form?.removeEventListener('reset', handleReset);
      clearUrls();
    };
  }, [inputProps?.form]);

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
        onChange={handleChange}
        hidden
      />
      {previews.length ? (
        <div className={cn('flex flex-wrap gap-3', className)}>
          {previews.map(({ file, url }, index) => (
            <div
              key={url}
              className="relative h-[101px] w-40 overflow-hidden rounded-[16px]"
            >
              <Image
                src={url}
                alt={file.name}
                fill
                unoptimized
                sizes="160px"
                className="object-cover"
              />
              <DeleteButton
                type="button"
                aria-label={`${file.name} 삭제`}
                disabled={inputProps?.disabled}
                className="absolute top-2.5 right-2.5"
                onClick={() => handleRemove(index)}
              />
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          aria-label={ariaLabel}
          aria-controls={inputId}
          disabled={inputProps?.disabled}
          onClick={handleClick}
          className={cn(
            'flex h-[101px] w-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[16px] border border-dashed border-slate-300 bg-slate-50 p-3 text-base leading-6 font-medium tracking-[-0.03em] text-slate-400 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none disabled:cursor-not-allowed',
            className,
          )}
        >
          <FileUpIcon
            aria-hidden="true"
            className="size-6 shrink-0 text-slate-400"
          />
          <span>이미지 첨부</span>
        </button>
      )}
    </>
  );
}

export { ImageInput };
export type { ImageInputProps };
