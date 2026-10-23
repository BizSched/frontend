import type { Metadata } from 'next';

import './globals.css';
import { Toaster } from '@components/_common/Toast/Toaster';

import { OverlayProvider } from '@providers/overlay/OverlayProvider';
import { QueryProvider } from '@providers/query/QueryProvider';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

export const metadata: Metadata = {
  title: {
    default: 'BizSched',
    template: '%s | BizSched',
  },
  description: '아르바이트생 관리부터 운영까지, 비즈스케드로 계획해요',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body
        className={cn(
          typographyVariants({ role: 'body' }),
          'flex min-h-full flex-col',
        )}
      >
        <QueryProvider>
          <OverlayProvider>{children}</OverlayProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
