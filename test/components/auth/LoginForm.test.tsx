import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toaster, toast } from '@components/_common/Toast/Toaster';
import { LoginForm } from '@components/auth/LoginForm';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { postLogin } from '@lib/api/entities/auth/api';
import { INVALID_CREDENTIALS_MESSAGE } from '@lib/api/entities/auth/formatAuthError';
import { COMMON_ERROR_MESSAGE } from '@lib/api/formatCommonError';

const push = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@lib/api/entities/auth/api', () => ({ postLogin: vi.fn() }));

const USER = { id: 1, email: 'owner@bizsched.app', name: '사장님' };

const renderLoginForm = (queryClient = new QueryClient()) =>
  render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
      <Toaster />
    </QueryClientProvider>,
  );

const fillForm = (email: string, password: string) => {
  fireEvent.change(screen.getByLabelText('이메일'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText('비밀번호'), {
    target: { value: password },
  });
};

const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: '로그인하기' }));

describe('LoginForm', () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(postLogin).mockReset();
  });

  afterEach(() => {
    cleanup();
    toast.dismiss();
  });

  it('빈 값으로 제출하면 필드별 문구를 보여주고 요청하지 않는다', async () => {
    renderLoginForm();

    submit();

    expect(await screen.findByText('이메일을 입력해주세요.')).toBeVisible();
    expect(screen.getByText('비밀번호를 입력해주세요.')).toBeVisible();
    expect(postLogin).not.toHaveBeenCalled();
  });

  it('이메일 형식이 틀리면 형식 문구를 보여준다', async () => {
    renderLoginForm();

    fillForm('owner', 'pw');
    submit();

    expect(
      await screen.findByText('올바른 이메일 형식이 아닙니다.'),
    ).toBeVisible();
    expect(postLogin).not.toHaveBeenCalled();
  });

  it('자동 로그인을 체크하고 로그인하면 autoLogin true로 요청하고 대시보드로 이동한다', async () => {
    vi.mocked(postLogin).mockResolvedValue(USER);
    renderLoginForm();

    fillForm(USER.email, 'pw');
    fireEvent.click(screen.getByRole('checkbox', { name: '자동 로그인' }));
    submit();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
    expect(vi.mocked(postLogin).mock.calls[0][0]).toEqual({
      email: USER.email,
      password: 'pw',
      autoLogin: true,
    });
  });

  it('로그인에 성공하면 이전 사용자의 쿼리 캐시를 비운다', async () => {
    vi.mocked(postLogin).mockResolvedValue(USER);
    const queryClient = new QueryClient();
    queryClient.setQueryData(['previousUser'], { name: '이전 사용자' });
    renderLoginForm(queryClient);

    fillForm(USER.email, 'pw');
    submit();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
    expect(queryClient.getQueryData(['previousUser'])).toBeUndefined();
  });

  it('로그인에 실패하면 쿼리 캐시를 그대로 둔다', async () => {
    vi.mocked(postLogin).mockRejectedValue(
      new ApiError('INVALID_CREDENTIALS', 401, 'BE 문구'),
    );
    const queryClient = new QueryClient();
    queryClient.setQueryData(['previousUser'], { name: '이전 사용자' });
    renderLoginForm(queryClient);

    fillForm(USER.email, 'wrong');
    submit();

    await screen.findByRole('alert');
    expect(queryClient.getQueryData(['previousUser'])).toEqual({
      name: '이전 사용자',
    });
  });

  it('로그인에 성공하면 이동하기 전까지 버튼을 다시 켜지 않는다', async () => {
    vi.mocked(postLogin).mockResolvedValue(USER);
    renderLoginForm();

    fillForm(USER.email, 'pw');
    submit();

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeDisabled();

    submit();

    expect(postLogin).toHaveBeenCalledTimes(1);
  });

  it('로그인에 실패하면 버튼을 다시 켠다', async () => {
    vi.mocked(postLogin).mockRejectedValue(
      new ApiError('INVALID_CREDENTIALS', 401, 'BE 문구'),
    );
    renderLoginForm();

    fillForm(USER.email, 'wrong');
    submit();

    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeEnabled();
  });

  it('자동 로그인 기본값은 꺼짐이다', async () => {
    vi.mocked(postLogin).mockResolvedValue(USER);
    renderLoginForm();

    fillForm(USER.email, 'pw');
    submit();

    await waitFor(() => expect(postLogin).toHaveBeenCalled());
    expect(vi.mocked(postLogin).mock.calls[0][0]).toMatchObject({
      autoLogin: false,
    });
  });

  it('INVALID_CREDENTIALS면 소셜 로그인 안내 문구를 보여준다', async () => {
    vi.mocked(postLogin).mockRejectedValue(
      new ApiError('INVALID_CREDENTIALS', 401, 'BE 문구'),
    );
    renderLoginForm();

    fillForm(USER.email, 'wrong');
    submit();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      INVALID_CREDENTIALS_MESSAGE,
    );
    expect(push).not.toHaveBeenCalled();
  });

  it('네트워크 오류면 공통 문구를 폼 안이 아닌 토스트로 알린다', async () => {
    vi.mocked(postLogin).mockRejectedValue(new NetworkError());
    renderLoginForm();

    fillForm(USER.email, 'pw');
    submit();

    expect(await screen.findByText(COMMON_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('다시 제출하면 이전 오류 토스트를 지운다', async () => {
    vi.mocked(postLogin)
      .mockRejectedValueOnce(new NetworkError())
      .mockImplementation(() => new Promise(() => {}));
    renderLoginForm();

    fillForm(USER.email, 'pw');
    submit();
    await screen.findByText(COMMON_ERROR_MESSAGE);
    submit();

    await waitFor(() =>
      expect(screen.queryByText(COMMON_ERROR_MESSAGE)).not.toBeInTheDocument(),
    );
  });
});
