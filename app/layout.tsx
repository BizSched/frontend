import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { OverlayProvider } from '@providers/overlay/OverlayProvider';
import { QueryProvider } from '@providers/query/QueryProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'BizSched',
    template: '%s | BizSched',
  },
  description: '아르바이트생 관리부터 운영까지, 비즈스케드로 계획해요',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <OverlayProvider>{children}</OverlayProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
