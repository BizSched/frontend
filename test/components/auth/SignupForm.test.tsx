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
import { SignupForm } from '@components/auth/SignupForm';

import { termsKeys } from '@hooks/api/terms/termsQueryOptions';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { postSignup } from '@lib/api/entities/auth/api';
import { getTerms } from '@lib/api/entities/terms/api';
import { COMMON_ERROR_MESSAGE } from '@lib/api/formatCommonError';
import type {
  SignupResponse,
  TermsResponse,
} from '@lib/api/generated/bizSchedAPI.schemas';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@lib/api/entities/auth/api', () => ({ postSignup: vi.fn() }));
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
const RESPONSE: SignupResponse = {
  id: 1,
  name: '사장님',
  email: 'owner@example.com',
  industry: 'CAFE',
  industryDetail: null,
  createdAt: '2026-10-14T00:00:00Z',
};

const renderForm = (terms = TERMS, staleTime = Infinity) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime } },
  });
  queryClient.setQueryData(termsKeys.list(), terms);
  render(
    <QueryClientProvider client={queryClient}>
      <SignupForm />
      <Toaster />
    </QueryClientProvider>,
  );
  return queryClient;
};

const change = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const fillInputs = (password = 'abcd1234') => {
  change('이름', RESPONSE.name);
  change('이메일', RESPONSE.email);
  change('비밀번호', password);
  change('비밀번호 확인', password);
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
  fillInputs();
  await selectIndustry('카페');
  agreeRequired();
};

const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: '회원가입 하기' }));

describe('SignupForm', () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(postSignup).mockReset().mockResolvedValue(RESPONSE);
    vi.mocked(getTerms).mockReset().mockResolvedValue(TERMS);
  });
  afterEach(() => {
    cleanup();
    toast.dismiss();
  });

  it('입력 전에도 제출할 수 있고 빈 값은 필드별로 안내한다', async () => {
    renderForm();
    expect(screen.getByRole('button', { name: '회원가입 하기' })).toBeEnabled();
    submit();
    for (const message of [
      '이름을 입력해주세요.',
      '이메일을 입력해주세요.',
      '비밀번호를 입력해주세요.',
      '비밀번호를 한 번 더 입력해주세요.',
      '업종을 선택해주세요.',
      '필수 약관에 모두 동의해주세요.',
    ]) {
      expect(await screen.findByText(message)).toBeVisible();
    }
    expect(screen.getByLabelText('이름')).toHaveAccessibleDescription(
      '이름을 입력해주세요.',
    );
    expect(
      screen.getByRole('group', { name: '약관 동의' }),
    ).toHaveAccessibleDescription('필수 약관에 모두 동의해주세요.');
    expect(postSignup).not.toHaveBeenCalled();
  });

  it.each([
    ['이름', '가'.repeat(21), '이름은 20자 이하로 입력해주세요.'],
    ['이메일', 'owner', '올바른 이메일 형식이 아닙니다.'],
    ['비밀번호 확인', 'different123', '비밀번호가 일치하지 않습니다.'],
  ])('%s 입력 규칙 위반 시 요청하지 않는다', async (label, value, message) => {
    renderForm();
    await fillValidForm();
    change(label, value);
    submit();
    expect(await screen.findByText(message)).toBeVisible();
    expect(postSignup).not.toHaveBeenCalled();
  });

  it.each(['abc1234', 'a1'.repeat(11), 'abcdefgh', '12345678', 'abc 1234'])(
    '비밀번호 규칙 위반 %s를 차단한다',
    async (password) => {
      renderForm();
      await fillValidForm();
      change('비밀번호', password);
      change('비밀번호 확인', password);
      submit();
      expect(
        await screen.findByText(
          '비밀번호는 공백 없이 8~20자의 영문과 숫자를 포함해야 합니다.',
        ),
      ).toBeVisible();
      expect(postSignup).not.toHaveBeenCalled();
    },
  );

  it.each(['abcd1234', 'a1'.repeat(10), 'abcd123!'])(
    '유효한 비밀번호 %s로 가입하고 로그인으로 이동한다',
    async (password) => {
      renderForm();
      await fillValidForm();
      fillInputs(password);
      submit();
      await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
      expect(postSignup).toHaveBeenCalledTimes(1);
      expect(vi.mocked(postSignup).mock.calls[0][0]).toEqual({
        name: RESPONSE.name,
        email: RESPONSE.email,
        password,
        industry: 'CAFE',
        termsAgreed: [
          { termsId: 42, agreed: true },
          { termsId: 7, agreed: true },
          { termsId: 19, agreed: false },
        ],
      });
      expect(
        screen.getByRole('button', { name: '회원가입 하기' }),
      ).toBeDisabled();
      submit();
      expect(postSignup).toHaveBeenCalledTimes(1);
    },
  );

  it('이름 20자와 전체 약관 동의를 전송한다', async () => {
    renderForm();
    fillInputs();
    change('이름', '가'.repeat(20));
    await selectIndustry('카페');
    fireEvent.click(screen.getByRole('checkbox', { name: /전체 동의/ }));
    submit();
    await waitFor(() => expect(postSignup).toHaveBeenCalled());
    expect(
      vi
        .mocked(postSignup)
        .mock.calls[0][0].termsAgreed.every(({ agreed }) => agreed),
    ).toBe(true);
  });

  it('필수 약관 중 하나라도 미동의이면 제출을 막는다', async () => {
    renderForm();
    fillInputs();
    await selectIndustry('카페');
    fireEvent.click(
      screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관' }),
    );
    submit();
    expect(
      await screen.findByText('필수 약관에 모두 동의해주세요.'),
    ).toBeVisible();
    expect(postSignup).not.toHaveBeenCalled();
  });

  it.each([
    ['', '업종을 입력해주세요.'],
    ['가'.repeat(21), '업종은 20자 이하로 입력해주세요.'],
  ])('CUSTOM의 직접 입력 %s를 검증한다', async (value, message) => {
    renderForm();
    fillInputs();
    await selectIndustry('직접입력');
    change('업종 직접 입력', value);
    agreeRequired();
    submit();
    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.getByLabelText('업종 직접 입력')).toHaveAccessibleDescription(
      message,
    );
    expect(postSignup).not.toHaveBeenCalled();
  });

  it('CUSTOM일 때만 직접 입력 업종을 전송한다', async () => {
    renderForm();
    fillInputs();
    await selectIndustry('직접입력');
    change('업종 직접 입력', '가'.repeat(20));
    agreeRequired();
    submit();
    await waitFor(() => expect(postSignup).toHaveBeenCalled());
    expect(vi.mocked(postSignup).mock.calls[0][0]).toMatchObject({
      industry: 'CUSTOM',
      industryDetail: '가'.repeat(20),
    });
  });

  it('직접 입력에서 일반 업종으로 바꾸면 이전 값의 검증과 전송을 제외한다', async () => {
    renderForm();
    fillInputs();
    await selectIndustry('직접입력');
    change('업종 직접 입력', '가'.repeat(21));
    agreeRequired();
    submit();
    await screen.findByText('업종은 20자 이하로 입력해주세요.');
    await selectIndustry('카페');
    submit();
    await waitFor(() => expect(postSignup).toHaveBeenCalled());
    expect(vi.mocked(postSignup).mock.calls[0][0]).not.toHaveProperty(
      'industryDetail',
    );
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('약관 빈 목록은 termsAgreed 빈 배열로 제출한다', async () => {
    renderForm([]);
    fillInputs();
    await selectIndustry('카페');
    submit();
    await waitFor(() => expect(postSignup).toHaveBeenCalled());
    expect(vi.mocked(postSignup).mock.calls[0][0].termsAgreed).toEqual([]);
  });

  it.each([
    ['EMAIL_ALREADY_EXISTS', '이메일', '이미 가입된 이메일입니다.'],
    ['INVALID_EMAIL_FORMAT', '이메일', '올바른 이메일 형식이 아닙니다.'],
    [
      'INVALID_PASSWORD_FORMAT',
      '비밀번호',
      '비밀번호는 공백 없이 8~20자의 영문과 숫자를 포함해야 합니다.',
    ],
    ['INVALID_INDUSTRY_VALUE', '업종', '업종을 다시 선택해주세요.'],
    [
      'REQUIRED_TERMS_NOT_AGREED',
      '약관 동의',
      '필수 약관에 모두 동의해주세요.',
    ],
  ])('%s는 해당 필드에 표시한다', async (code, label, message) => {
    vi.mocked(postSignup).mockRejectedValue(
      new ApiError(
        code,
        code === 'EMAIL_ALREADY_EXISTS' ? 409 : 400,
        'BE 문구',
      ),
    );
    renderForm();
    await fillValidForm();
    submit();
    expect(await screen.findByText(message)).toBeVisible();
    const field =
      label === '업종' || label === '약관 동의'
        ? screen.getByRole('group', { name: label })
        : screen.getByLabelText(label);
    expect(field).toHaveAccessibleDescription(message);
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '회원가입 하기' })).toBeEnabled();
  });

  it.each([
    [
      new ApiError('UNKNOWN', 400, '이름을 확인해주세요.'),
      '이름을 확인해주세요.',
    ],
    [new Error('HTTP 500'), COMMON_ERROR_MESSAGE],
    [new NetworkError(), COMMON_ERROR_MESSAGE],
  ])(
    '필드에 연결되지 않는 실패는 토스트로 알리고 입력을 유지한 채 재제출한다: %s',
    async (error, message) => {
      vi.mocked(postSignup)
        .mockRejectedValueOnce(error)
        .mockResolvedValue(RESPONSE);
      renderForm();
      await fillValidForm();
      submit();
      expect(await screen.findByText(message as string)).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByLabelText('이름')).toHaveValue(RESPONSE.name);
      expect(screen.getByLabelText('비밀번호')).toHaveValue('abcd1234');
      expect(push).not.toHaveBeenCalled();
      submit();
      await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
      expect(postSignup).toHaveBeenCalledTimes(2);
      await waitFor(() =>
        expect(screen.queryByText(message as string)).not.toBeInTheDocument(),
      );
    },
  );

  it('이메일 서버 오류를 수정하면 다시 제출할 수 있다', async () => {
    vi.mocked(postSignup)
      .mockRejectedValueOnce(new ApiError('EMAIL_ALREADY_EXISTS', 409))
      .mockResolvedValue(RESPONSE);
    renderForm();
    await fillValidForm();
    submit();
    await screen.findByText('이미 가입된 이메일입니다.');
    change('이메일', 'new@example.com');
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(vi.mocked(postSignup).mock.calls[1][0].email).toBe(
      'new@example.com',
    );
  });

  it('가입 진행 중에는 중복 제출하지 않고 성공해도 기존 캐시를 유지한다', async () => {
    let resolveSignup!: (value: SignupResponse) => void;
    vi.mocked(postSignup).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignup = resolve;
        }),
    );
    const queryClient = renderForm();
    queryClient.setQueryData(['previousData'], { name: '기존 데이터' });
    await fillValidForm();
    submit();
    await waitFor(() => expect(postSignup).toHaveBeenCalledTimes(1));
    for (const label of ['이름', '이메일', '비밀번호', '비밀번호 확인']) {
      expect(screen.getByLabelText(label)).toBeDisabled();
    }
    expect(screen.getByRole('button', { name: '카페' })).toBeDisabled();
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toHaveAttribute('data-disabled');
    }
    expect(
      screen.getByRole('button', { name: '서비스 이용약관 전문 보기' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '회원가입 하기' }),
    ).toBeDisabled();
    submit();
    expect(postSignup).toHaveBeenCalledTimes(1);
    await act(async () => resolveSignup(RESPONSE));
    expect(queryClient.getQueryData(['previousData'])).toEqual({
      name: '기존 데이터',
    });
    expect(push).toHaveBeenCalledWith('/login');
    expect(screen.getByLabelText('이메일')).toBeDisabled();
  });

  it('지연된 가입 오류가 올 때까지 입력을 잠그고 실패하면 기존 값으로 다시 편집할 수 있다', async () => {
    let rejectSignup!: (error: unknown) => void;
    vi.mocked(postSignup).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectSignup = reject;
        }),
    );
    renderForm();
    fillInputs();
    await selectIndustry('직접입력');
    change('업종 직접 입력', '꽃집');
    agreeRequired();
    submit();
    await waitFor(() => expect(postSignup).toHaveBeenCalledTimes(1));
    for (const label of ['이메일', '업종 직접 입력']) {
      expect(screen.getByLabelText(label)).toBeDisabled();
    }
    expect(screen.getByRole('button', { name: '직접입력' })).toBeDisabled();
    await act(async () =>
      rejectSignup(new ApiError('EMAIL_ALREADY_EXISTS', 409)),
    );
    const email = screen.getByLabelText('이메일');
    expect(email).toHaveValue(RESPONSE.email);
    expect(email).toHaveAccessibleDescription('이미 가입된 이메일입니다.');
    expect(email).toBeEnabled();
    expect(screen.getByLabelText('업종 직접 입력')).toBeEnabled();
    change('이메일', 'new@example.com');
    expect(email).toHaveValue('new@example.com');
  });

  it('필수 약관 오류 후 새 목록을 조회하고 새 약관에 동의해야 재제출한다', async () => {
    const newTerm = {
      id: 99,
      required: true,
      title: '새 필수 약관',
      content: '새 본문',
    };
    let resolveTerms!: (terms: TermsResponse[]) => void;
    vi.mocked(getTerms).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveTerms = resolve;
        }),
    );
    vi.mocked(postSignup)
      .mockRejectedValueOnce(new ApiError('REQUIRED_TERMS_NOT_AGREED', 400))
      .mockResolvedValue(RESPONSE);
    renderForm();
    await fillValidForm();
    submit();
    await waitFor(() => expect(getTerms).toHaveBeenCalledTimes(1));
    expect(
      screen.getByRole('button', { name: '회원가입 하기' }),
    ).toBeDisabled();
    submit();
    expect(postSignup).toHaveBeenCalledTimes(1);
    await act(async () => resolveTerms([...TERMS, newTerm]));
    const newAgreement = await screen.findByRole('checkbox', {
      name: '[필수] 새 필수 약관',
    });
    expect(newAgreement).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관' }),
    ).toBeChecked();
    expect(screen.getByLabelText('이메일')).toHaveValue(RESPONSE.email);
    submit();
    await screen.findByText('필수 약관에 모두 동의해주세요.');
    expect(postSignup).toHaveBeenCalledTimes(1);
    fireEvent.click(newAgreement);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(vi.mocked(postSignup).mock.calls[1][0].termsAgreed).toEqual([
      { termsId: 42, agreed: true },
      { termsId: 7, agreed: true },
      { termsId: 19, agreed: false },
      { termsId: 99, agreed: true },
    ]);
  });

  it('필수 약관 재조회가 실패하면 제출을 막고 재조회 버튼으로 복구한다', async () => {
    vi.mocked(postSignup)
      .mockRejectedValueOnce(new ApiError('REQUIRED_TERMS_NOT_AGREED', 400))
      .mockResolvedValue(RESPONSE);
    vi.mocked(getTerms)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(TERMS);
    renderForm();
    await fillValidForm();
    submit();
    expect(await screen.findByText('약관을 불러오지 못했어요.')).toBeVisible();
    expect(
      screen.getByRole('button', { name: '회원가입 하기' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '회원가입 하기' }),
      ).toBeEnabled(),
    );
    expect(getTerms).toHaveBeenCalledTimes(2);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(postSignup).toHaveBeenCalledTimes(2);
  });

  it('약관 백그라운드 갱신 중에는 약관 조작과 제출을 막지 않는다', async () => {
    vi.mocked(getTerms).mockImplementation(() => new Promise(() => {}));
    renderForm(TERMS, 0);
    await waitFor(() => expect(getTerms).toHaveBeenCalledTimes(1));
    await fillValidForm();
    expect(
      screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관' }),
    ).toBeChecked();
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
  });
});
