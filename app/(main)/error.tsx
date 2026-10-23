'use client';

import { useQueryErrorResetBoundary } from '@tanstack/react-query';

import { COMMON_ERROR_MESSAGE } from '@lib/api/formatCommonError';
import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

interface MainErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ reset }: MainErrorProps) {
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#f2f2f2] px-6 py-10">
      <p
        role="alert"
        className={cn(
          typographyVariants({ role: 'supporting' }),
          'text-center text-slate-500',
        )}
      >
        {COMMON_ERROR_MESSAGE}
      </p>
      <button
        type="button"
        className={cn(
          typographyVariants({ role: 'label' }),
          'cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2',
        )}
        onClick={() => {
          resetQueryErrors();
          reset();
        }}
      >
        다시 시도
      </button>
    </main>
  );
}
