import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SOCIAL_LOGIN_ERROR_MESSAGES } from '@lib/api/entities/auth/formatSocialLoginError';

import LoginPage from '@app/login/page';

vi.mock('@components/auth/LoginForm', () => ({ LoginForm: () => null }));

const renderLoginPage = async (
  query: Record<string, string | string[]> = {},
) => {
  render(await LoginPage({ searchParams: Promise.resolve(query) } as never));
};

describe('로그인 화면', () => {
  afterEach(() => {
    cleanup();
  });

  it('socialError가 없는 일반 로그인 화면에는 소셜 실패 문구가 없다', async () => {
    await renderLoginPage();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([
    ['구글로 로그인', '/api/oauth/google/authorize'],
    ['카카오로 로그인', '/api/oauth/kakao/authorize'],
  ])('%s 버튼은 BFF 인가 시작 경로(%s)로 가는 링크다', async (name, href) => {
    await renderLoginPage();
    const link = screen.getByRole('link', { name });

    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', href);
    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
  });

  it('socialError와 joinType을 문구로 바꿔 보여준다', async () => {
    await renderLoginPage({
      socialError: 'SOCIAL_EMAIL_CONFLICT',
      joinType: 'KAKAO',
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      SOCIAL_LOGIN_ERROR_MESSAGES.EMAIL_CONFLICT_KAKAO,
    );
  });

  it('알 수 없는 socialError는 값을 출력하지 않고 공통 문구로 보여준다', async () => {
    await renderLoginPage({ socialError: '<b>임의 문구</b>' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      SOCIAL_LOGIN_ERROR_MESSAGES.COMMON,
    );
    expect(screen.queryByText(/임의 문구/)).not.toBeInTheDocument();
  });
});
