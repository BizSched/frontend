import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toaster, toast } from '@components/_common/Toast/Toaster';
import { OnboardingForm } from '@components/auth/OnboardingForm';

import { termsKeys } from '@hooks/api/terms/termsQueryOptions';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { patchCompleteSocialSignup } from '@lib/api/entities/auth/api';
import { getTerms } from '@lib/api/entities/terms/api';
import { COMMON_ERROR_MESSAGE } from '@lib/api/formatCommonError';
import type { TermsResponse } from '@lib/api/generated/bizSchedAPI.schemas';

const push = vi.fn();
const assign = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@lib/api/entities/auth/api', () => ({
  patchCompleteSocialSignup: vi.fn(),
}));
vi.mock('@lib/api/entities/terms/api', () => ({ getTerms: vi.fn() }));

const TERMS: TermsResponse[] = [
  { id: 42, title: '서비스 이용약관', required: true, content: '서비스 본문' },
  { id: 7, title: '개인정보 동의', required: true, content: '개인정보 본문' },
  {
    id: 19,
    title: '마케팅 수신 동의',
    required: false,
    content: '마케팅 본문',
  },
];
const RESPONSE = {
  id: 1,
  email: 'owner@example.com',
  industry: 'CAFE' as const,
  industryDetail: null,
};

const renderForm = (terms = TERMS) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(termsKeys.list(), terms);
  render(
    <QueryClientProvider client={queryClient}>
      <OnboardingForm />
      <Toaster />
    </QueryClientProvider>,
  );
  return queryClient;
};

const selectIndustry = async (label: string) => {
  const group = screen.getByRole('group', { name: '업종' });
  fireEvent.click(group.querySelector('button')!);
  fireEvent.click(await screen.findByRole('menuitem', { name: label }));
};

const agreeRequired = () => {
  for (const term of TERMS.filter(({ required }) => required)) {
    fireEvent.click(
      screen.getByRole('checkbox', { name: `[필수] ${term.title}` }),
    );
  }
};

const fillValidForm = async () => {
  await selectIndustry('카페');
  agreeRequired();
};

const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: '시작하기' }));

const mockNavigation = () => {
  vi.stubGlobal(
    'window',
    new Proxy(window, {
      get: (target, key) =>
        key === 'location' ? { assign } : Reflect.get(target, key, target),
    }),
  );
};

describe('OnboardingForm', () => {
  beforeEach(() => {
    push.mockReset();
    assign.mockReset();
    vi.mocked(patchCompleteSocialSignup)
      .mockReset()
      .mockResolvedValue(RESPONSE);
    vi.mocked(getTerms).mockReset().mockResolvedValue(TERMS);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
    toast.dismiss();
  });

  it('필수 업종과 약관에 오류를 표시하고 미입력 제출을 막는다', async () => {
    renderForm();

    submit();

    expect(await screen.findByText('업종을 선택해주세요.')).toBeVisible();
    expect(
      await screen.findByText('필수 약관에 모두 동의해주세요.'),
    ).toBeVisible();
    expect(patchCompleteSocialSignup).not.toHaveBeenCalled();
  });

  it('선택 약관 미동의를 포함해 전체 약관을 보내고 캐시를 비운 뒤 대시보드로 이동한다', async () => {
    const queryClient = renderForm();
    queryClient.setQueryData(['previousUser'], { id: 99 });
    push.mockImplementationOnce(() => {
      expect(queryClient.getQueryData(['previousUser'])).toBeUndefined();
    });
    await fillValidForm();

    submit();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
    expect(vi.mocked(patchCompleteSocialSignup).mock.calls[0][0]).toEqual({
      industry: 'CAFE',
      termsAgreed: [
        { termsId: 42, agreed: true },
        { termsId: 7, agreed: true },
        { termsId: 19, agreed: false },
      ],
    });
    expect(screen.getByRole('button', { name: '시작하기' })).toBeDisabled();
    expect(assign).not.toHaveBeenCalled();
    submit();
    expect(patchCompleteSocialSignup).toHaveBeenCalledOnce();
  });

  it.each([
    ['', '업종을 입력해주세요.'],
    ['가'.repeat(21), '업종은 20자 이하로 입력해주세요.'],
  ])(
    '직접 입력 업종 %s의 필수·길이 규칙을 검증한다',
    async (value, message) => {
      renderForm();
      await selectIndustry('직접입력');
      fireEvent.change(screen.getByLabelText('업종 직접 입력'), {
        target: { value },
      });
      agreeRequired();

      submit();

      expect(await screen.findByText(message)).toBeVisible();
      expect(patchCompleteSocialSignup).not.toHaveBeenCalled();
    },
  );

  it('직접 입력 업종을 보내고 요청 중에는 입력과 중복 제출을 잠근다', async () => {
    let resolveSignup!: (value: typeof RESPONSE) => void;
    vi.mocked(patchCompleteSocialSignup).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignup = resolve;
        }),
    );
    renderForm();
    await selectIndustry('직접입력');
    fireEvent.change(screen.getByLabelText('업종 직접 입력'), {
      target: { value: '꽃집' },
    });
    agreeRequired();

    submit();

    await waitFor(() =>
      expect(patchCompleteSocialSignup).toHaveBeenCalledOnce(),
    );
    expect(vi.mocked(patchCompleteSocialSignup).mock.calls[0][0]).toMatchObject(
      {
        industry: 'CUSTOM',
        industryDetail: '꽃집',
      },
    );
    expect(screen.getByLabelText('업종 직접 입력')).toBeDisabled();
    expect(screen.getByRole('button', { name: '직접입력' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '서비스 이용약관 전문 보기' }),
    ).toBeDisabled();
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toHaveAttribute('data-disabled');
    }
    submit();
    expect(patchCompleteSocialSignup).toHaveBeenCalledOnce();
    await act(async () => resolveSignup(RESPONSE));
    expect(push).toHaveBeenCalledWith('/dashboard');
  });

  it('직접 입력에서 일반 업종으로 바꾸면 이전 입력의 검증과 전송을 제외한다', async () => {
    renderForm();
    await selectIndustry('직접입력');
    fireEvent.change(screen.getByLabelText('업종 직접 입력'), {
      target: { value: '가'.repeat(21) },
    });
    agreeRequired();
    submit();
    await screen.findByText('업종은 20자 이하로 입력해주세요.');

    await selectIndustry('카페');
    submit();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
    expect(
      vi.mocked(patchCompleteSocialSignup).mock.calls[0][0],
    ).not.toHaveProperty('industryDetail');
  });

  it.each([
    [
      401,
      'INVALID_TEMP_TOKEN',
      undefined,
      '/login?socialError=INVALID_TEMP_TOKEN',
    ],
    [
      409,
      'SOCIAL_ACCOUNT_ALREADY_REGISTERED',
      undefined,
      '/login?socialError=SOCIAL_ACCOUNT_ALREADY_REGISTERED',
    ],
    [
      409,
      'SOCIAL_EMAIL_CONFLICT',
      { joinType: 'EMAIL' },
      '/login?socialError=SOCIAL_EMAIL_CONFLICT&joinType=EMAIL',
    ],
    [
      409,
      'SOCIAL_EMAIL_CONFLICT',
      { joinType: 'KAKAO' },
      '/login?socialError=SOCIAL_EMAIL_CONFLICT&joinType=KAKAO',
    ],
    [
      409,
      'SOCIAL_EMAIL_CONFLICT',
      { joinType: 'GOOGLE' },
      '/login?socialError=SOCIAL_EMAIL_CONFLICT&joinType=GOOGLE',
    ],
    [
      409,
      'SOCIAL_EMAIL_CONFLICT',
      { joinType: 'NAVER' },
      '/login?socialError=SOCIAL_EMAIL_CONFLICT',
    ],
  ])(
    '%i %s (%j)는 temp_token이 지워져 재제출할 수 없으므로, 라우터 캐시가 남지 않게 전체 새로고침으로 로그인에 보내고 재제출을 막는다',
    async (status, errorCode, data, path) => {
      vi.mocked(patchCompleteSocialSignup).mockRejectedValue(
        new ApiError(errorCode, status, '', data),
      );
      renderForm();
      await fillValidForm();
      mockNavigation();

      submit();

      await waitFor(() => expect(assign).toHaveBeenCalledWith(path));
      expect(push).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: '시작하기' })).toBeDisabled();
      submit();
      expect(patchCompleteSocialSignup).toHaveBeenCalledOnce();
    },
  );

  it.each([
    [
      new ApiError('UNKNOWN', 400, '입력값을 확인해주세요.'),
      '입력값을 확인해주세요.',
    ],
    [new ApiError('UNAUTHORIZED', 401), COMMON_ERROR_MESSAGE],
    [new Error('HTTP 500'), COMMON_ERROR_MESSAGE],
    [new NetworkError(), COMMON_ERROR_MESSAGE],
  ])(
    '재시도 가능한 실패는 입력을 유지하고 토스트 안내 후 재제출한다: %s',
    async (error, message) => {
      vi.mocked(patchCompleteSocialSignup)
        .mockRejectedValueOnce(error)
        .mockResolvedValue(RESPONSE);
      renderForm();
      await fillValidForm();

      submit();

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '카페' })).toBeEnabled();
      expect(
        screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관' }),
      ).toBeChecked();
      expect(push).not.toHaveBeenCalled();
      expect(assign).not.toHaveBeenCalled();
      submit();
      await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
      expect(patchCompleteSocialSignup).toHaveBeenCalledTimes(2);
      await waitFor(() =>
        expect(screen.queryByText(message)).not.toBeInTheDocument(),
      );
    },
  );

  it('업종 오류는 업종 필드에 표시한다', async () => {
    vi.mocked(patchCompleteSocialSignup).mockRejectedValue(
      new ApiError('INVALID_INDUSTRY_VALUE', 400),
    );
    renderForm();
    await fillValidForm();

    submit();

    expect(await screen.findByText('업종을 다시 선택해주세요.')).toBeVisible();
    expect(
      screen.getByRole('group', { name: '업종' }),
    ).toHaveAccessibleDescription('업종을 다시 선택해주세요.');
    expect(screen.getByRole('button', { name: '시작하기' })).toBeEnabled();
  });

  it('약관 오류 후 새 필수 약관을 조회하고 동의해야 재제출할 수 있다', async () => {
    const newTerm: TermsResponse = {
      id: 99,
      title: '새 필수 약관',
      required: true,
      content: '새 본문',
    };
    let resolveTerms!: (terms: TermsResponse[]) => void;
    vi.mocked(getTerms).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveTerms = resolve;
        }),
    );
    vi.mocked(patchCompleteSocialSignup)
      .mockRejectedValueOnce(new ApiError('REQUIRED_TERMS_NOT_AGREED', 400))
      .mockResolvedValue(RESPONSE);
    renderForm();
    await fillValidForm();

    submit();

    await waitFor(() => expect(getTerms).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: '시작하기' })).toBeDisabled();
    expect(
      screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관' }),
    ).toHaveAttribute('data-disabled');
    submit();
    expect(patchCompleteSocialSignup).toHaveBeenCalledOnce();
    await act(async () => resolveTerms([...TERMS, newTerm]));
    const newAgreement = await screen.findByRole('checkbox', {
      name: '[필수] 새 필수 약관',
    });
    expect(newAgreement).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관' }),
    ).toBeChecked();
    submit();
    expect(
      await screen.findByText('필수 약관에 모두 동의해주세요.'),
    ).toBeVisible();
    expect(patchCompleteSocialSignup).toHaveBeenCalledOnce();
    fireEvent.click(newAgreement);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
    expect(
      vi.mocked(patchCompleteSocialSignup).mock.calls[1][0].termsAgreed,
    ).toEqual([
      { termsId: 42, agreed: true },
      { termsId: 7, agreed: true },
      { termsId: 19, agreed: false },
      { termsId: 99, agreed: true },
    ]);
  });

  it('약관 재조회 실패 시 제출을 막고 다시 불러온 후 재제출할 수 있다', async () => {
    vi.mocked(getTerms)
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue(TERMS);
    vi.mocked(patchCompleteSocialSignup)
      .mockRejectedValueOnce(new ApiError('REQUIRED_TERMS_NOT_AGREED', 400))
      .mockResolvedValue(RESPONSE);
    renderForm();
    await fillValidForm();

    submit();

    expect(await screen.findByText('약관을 불러오지 못했어요.')).toBeVisible();
    expect(screen.getByRole('button', { name: '시작하기' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '시작하기' })).toBeEnabled(),
    );
    expect(getTerms).toHaveBeenCalledTimes(2);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
    expect(patchCompleteSocialSignup).toHaveBeenCalledTimes(2);
  });
});
