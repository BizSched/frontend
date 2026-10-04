import Link from 'next/link';

import { buttonVariants } from '@components/_common/Button/Button';

import { cn } from '@lib/utilities/cn';

function LandingStartLink() {
  return (
    <Link
      href="/login"
      className={cn(
        buttonVariants({ size: 'large' }),
        'shadow-[0_10px_40px_rgba(255,158,89,0.4)] max-tablet:h-10 max-tablet:w-[8.375rem] max-tablet:py-2.5 max-tablet:text-sm max-tablet:leading-5 max-tablet:shadow-[0_10px_40px_rgba(255,158,89,0.3)]',
      )}
    >
      시작하기
    </Link>
  );
}

export { LandingStartLink };
