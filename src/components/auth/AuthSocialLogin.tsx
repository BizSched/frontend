import { SocialButton } from '@components/_common/IconButton/SocialButton';

import { cn } from '@lib/utilities/cn';
import { ROUTE_PATHS } from '@lib/utilities/routePaths';
import { typographyVariants } from '@lib/utilities/typography';

interface AuthSocialLoginProps {
  title: string;
  actionLabel: string;
  errorMessage?: string;
}

function AuthSocialLogin({
  title,
  actionLabel,
  errorMessage,
}: AuthSocialLoginProps) {
  return (
    <section
      aria-label={title}
      className="flex w-full flex-col items-center gap-4"
    >
      <div className="flex w-full items-center gap-2">
        <span aria-hidden className="h-px flex-1 bg-slate-100" />
        <p
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'whitespace-nowrap text-slate-300',
          )}
        >
          {title}
        </p>
        <span aria-hidden className="h-px flex-1 bg-slate-100" />
      </div>
      {errorMessage && (
        <p
          role="alert"
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'text-center text-warning-500',
          )}
        >
          {errorMessage}
        </p>
      )}
      {/* NOTE: 인가 시작은 Route Handler라 prefetch되면 인가 요청 없이 임시 쿠키만 바뀌므로 next/link 대신 <a>로 이동한다. 페이지 이동이라 Base UI가 붙이는 role="button"을 link로 덮어쓴다 (docs/feature/auth/login.md "소셜 로그인") */}
      <div className="flex items-center justify-center gap-4">
        <SocialButton
          social="Google"
          aria-label={`구글로 ${actionLabel}`}
          nativeButton={false}
          role="link"
          render={<a href={ROUTE_PATHS.oauthAuthorize('google')} />}
        />
        <SocialButton
          social="Kakao"
          aria-label={`카카오로 ${actionLabel}`}
          nativeButton={false}
          role="link"
          render={<a href={ROUTE_PATHS.oauthAuthorize('kakao')} />}
        />
      </div>
    </section>
  );
}

export { AuthSocialLogin };
