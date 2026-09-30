import Link from 'next/link';

interface AuthSwitchLinkProps {
  question: string;
  linkLabel: string;
  href: string;
}

function AuthSwitchLink({ question, linkLabel, href }: AuthSwitchLinkProps) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-2 text-center text-base tracking-[-0.03em]">
      <span className="font-medium text-slate-700">{question}</span>
      <Link
        href={href}
        className="rounded-lg font-semibold text-accent-500 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {linkLabel}
      </Link>
    </p>
  );
}

export { AuthSwitchLink };
