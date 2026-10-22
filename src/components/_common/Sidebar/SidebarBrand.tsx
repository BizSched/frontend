import Image from 'next/image';
import Link from 'next/link';
import type { MouseEventHandler } from 'react';

import { cn } from '@lib/utilities/cn';

import LogoBizSched from '@assets/logos/logo_bizsched.svg';

interface SidebarBrandProps {
  href: string;
  isSmall?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

function SidebarBrand({
  href,
  isSmall = false,
  className,
  onClick,
}: SidebarBrandProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="BizSched 홈"
      className={cn(
        'flex items-center gap-4 rounded-lg px-2 outline-none group-data-[state=collapsed]/sidebar:px-0 focus-visible:ring-2 focus-visible:ring-primary-500',
        className,
      )}
    >
      <Image
        src={LogoBizSched}
        alt=""
        width={isSmall ? 32 : 48}
        height={isSmall ? 32 : 48}
        className="shrink-0"
        unoptimized
      />
      {!isSmall && (
        <span className="text-2xl font-bold tracking-[-0.03em] text-slate-700 group-data-[state=collapsed]/sidebar:hidden">
          BizSched
        </span>
      )}
    </Link>
  );
}

export { SidebarBrand };
