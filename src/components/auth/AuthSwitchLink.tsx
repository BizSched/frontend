import Link from 'next/link';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

interface AuthSwitchLinkProps {
  question: string;
  linkLabel: string;
  href: string;
}

function AuthSwitchLink({ question, linkLabel, href }: AuthSwitchLinkProps) {
  return (
    <p
      className={cn(
        typographyVariants({ role: 'supporting' }),
        'flex flex-wrap items-center justify-center gap-2 text-center',
      )}
    >
      <span className="text-slate-700">{question}</span>
      <Link
        href={href}
        className={cn(
          typographyVariants({ role: 'label' }),
          'rounded-lg text-accent-500 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50',
        )}
      >
        {linkLabel}
      </Link>
    </p>
  );
}

export { AuthSwitchLink };
