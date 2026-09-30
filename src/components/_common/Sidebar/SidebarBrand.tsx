import Image from 'next/image';
import Link from 'next/link';
import type { MouseEventHandler } from 'react';

import { cn } from '@lib/utilities/cn';

import SymbolSmall from '@assets/icons/sidebar/ic_symbol-small.svg';
import Symbol from '@assets/icons/sidebar/ic_symbol.svg';
import Wordmark from '@assets/icons/sidebar/ic_wordmark.svg';

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
      aria-label="Slid to-do 홈"
      className={cn(
        'flex items-center gap-4 rounded-lg px-2 outline-none group-data-[state=collapsed]/sidebar:px-0 focus-visible:ring-2 focus-visible:ring-primary-500',
        className,
      )}
    >
      <span
        className={cn('relative block size-12 shrink-0', isSmall && 'size-8')}
      >
        <Image
          src={isSmall ? SymbolSmall : Symbol}
          alt=""
          width={isSmall ? 53.3333 : 80}
          height={isSmall ? 53.3333 : 80}
          className={cn(
            'absolute top-[-12px] left-[-16px] max-w-none',
            isSmall && 'top-[-8px] left-[-10.6667px]',
          )}
          unoptimized
        />
      </span>
      {!isSmall && (
        <Image
          src={Wordmark}
          alt=""
          width={136.471}
          height={23.4901}
          className="group-data-[state=collapsed]/sidebar:hidden"
          unoptimized
        />
      )}
    </Link>
  );
}

export { SidebarBrand };
