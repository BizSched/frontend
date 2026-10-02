import Image from 'next/image';
import Link from 'next/link';

import LogoBizSched from '@assets/logos/logo_bizsched.svg';

function AuthLogo() {
  return (
    <Link
      href="/"
      data-slot="auth-logo"
      className="flex w-fit items-center gap-4 px-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Image
        src={LogoBizSched}
        alt=""
        width={48}
        height={48}
        unoptimized
        priority
      />
      <span className="text-2xl font-bold tracking-[-0.03em] text-slate-700">
        BizSched
      </span>
    </Link>
  );
}

export { AuthLogo };
