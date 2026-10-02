import { SocialButton } from '@components/_common/IconButton/SocialButton';

interface AuthSocialLoginProps {
  title: string;
  actionLabel: string;
}

function AuthSocialLogin({ title, actionLabel }: AuthSocialLoginProps) {
  return (
    <section
      aria-label={title}
      className="flex w-full flex-col items-center gap-4"
    >
      <div className="flex w-full items-center gap-2">
        <span aria-hidden className="h-px flex-1 bg-slate-100" />
        <p className="text-sm font-medium tracking-[-0.03em] whitespace-nowrap text-slate-300">
          {title}
        </p>
        <span aria-hidden className="h-px flex-1 bg-slate-100" />
      </div>
      <div className="flex items-center justify-center gap-4">
        <SocialButton social="Google" aria-label={`구글로 ${actionLabel}`} />
        <SocialButton social="Kakao" aria-label={`카카오로 ${actionLabel}`} />
      </div>
    </section>
  );
}

export { AuthSocialLogin };
