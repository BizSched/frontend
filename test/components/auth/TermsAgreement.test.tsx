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
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OnboardingForm } from '@components/auth/OnboardingForm';
import { openTermsModal } from '@components/auth/openTermsModal';
import { SignupForm } from '@components/auth/SignupForm';
import {
  TermsAgreement,
  type TermsAgreementValues,
} from '@components/auth/TermsAgreement';

import { getTerms } from '@lib/api/entities/terms/api';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@lib/api/entities/terms/api', () => ({ getTerms: vi.fn() }));
vi.mock('@components/auth/openTermsModal', () => ({ openTermsModal: vi.fn() }));

const TERMS = [
  { id: 42, title: '서비스 이용약관', required: true, content: '서비스 본문' },
  {
    id: 19,
    title: '마케팅 정보 수신 동의',
    required: false,
    content: '마케팅 본문',
  },
];

function Agreement() {
  const [value, setValue] = useState<TermsAgreementValues>({});
  return <TermsAgreement value={value} onChange={setValue} />;
}

const renderContent = (content = <Agreement />) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{content}</QueryClientProvider>,
  );
};

describe('TermsAgreement', () => {
  beforeEach(() => {
    vi.mocked(getTerms).mockReset().mockResolvedValue(TERMS);
    vi.mocked(openTermsModal).mockReset();
    push.mockReset();
  });
  afterEach(cleanup);

  it('응답 순서와 필수 여부를 따르고 마케팅 동의를 하나로 표시한다', async () => {
    renderContent();
    await screen.findByRole('checkbox', { name: '[필수] 서비스 이용약관' });
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes[2]).toHaveAccessibleName('[선택] 마케팅 정보 수신 동의');
    expect(screen.queryByText('SMS·알림톡')).not.toBeInTheDocument();
  });

  it('전체 동의는 현재 목록 전체를 켜고 끈다', async () => {
    renderContent();
    const all = await screen.findByRole('checkbox', { name: /전체 동의/ });
    fireEvent.click(all);
    screen
      .getAllByRole('checkbox')
      .forEach((checkbox) => expect(checkbox).toBeChecked());
    fireEvent.click(
      screen.getByRole('checkbox', { name: '[선택] 마케팅 정보 수신 동의' }),
    );
    expect(all).not.toBeChecked();
    fireEvent.click(all);
    fireEvent.click(all);
    screen
      .getAllByRole('checkbox')
      .forEach((checkbox) => expect(checkbox).not.toBeChecked());
  });

  it('전문 동의는 해당 id를 켜고 모달이 열린 동안 바뀐 다른 동의를 보존한다', async () => {
    let agree!: (value: boolean) => void;
    vi.mocked(openTermsModal).mockImplementation(
      () =>
        new Promise((resolve) => {
          agree = resolve;
        }),
    );
    renderContent();
    fireEvent.click(
      await screen.findByRole('button', { name: '서비스 이용약관 전문 보기' }),
    );
    expect(openTermsModal).toHaveBeenCalledWith({ document: TERMS[0] });
    fireEvent.click(
      screen.getByRole('checkbox', { name: '[선택] 마케팅 정보 수신 동의' }),
    );
    await act(async () => agree(true));
    screen
      .getAllByRole('checkbox')
      .forEach((checkbox) => expect(checkbox).toBeChecked());
  });

  it('전문 닫기는 체크 상태를 바꾸지 않는다', async () => {
    vi.mocked(openTermsModal).mockResolvedValue(false);
    renderContent();
    fireEvent.click(
      await screen.findByRole('button', { name: '서비스 이용약관 전문 보기' }),
    );
    await waitFor(() => expect(openTermsModal).toHaveBeenCalled());
    expect(
      screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관' }),
    ).not.toBeChecked();
  });

  it('모달을 연 뒤 폼이 잠기면 늦게 도착한 동의를 적용하지 않는다', async () => {
    let agree!: (value: boolean) => void;
    vi.mocked(openTermsModal).mockImplementation(
      () =>
        new Promise((resolve) => {
          agree = resolve;
        }),
    );
    const onChange = vi.fn();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    const content = (disabled: boolean) => (
      <QueryClientProvider client={client}>
        <TermsAgreement value={{}} onChange={onChange} disabled={disabled} />
      </QueryClientProvider>
    );
    const { rerender } = render(content(false));
    fireEvent.click(
      await screen.findByRole('button', { name: '서비스 이용약관 전문 보기' }),
    );
    rerender(content(true));
    await act(async () => agree(true));
    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관' }),
    ).not.toBeChecked();
  });

  it.each([
    ['회원가입', <SignupForm key="signup" />, '회원가입 하기'],
    ['온보딩', <OnboardingForm key="onboarding" />, '시작하기'],
  ])(
    '%s 조회 실패 시 제출을 막고 재조회 성공 후 활성화한다',
    async (_name, form, buttonName) => {
      vi.mocked(getTerms).mockRejectedValueOnce(new Error('offline'));
      renderContent(form);
      const submit = screen.getByRole('button', { name: buttonName as string });
      expect(submit).toBeDisabled();
      expect(await screen.findByRole('alert')).toHaveTextContent(
        '약관을 불러오지 못했어요.',
      );
      fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
      await waitFor(() => expect(submit).toBeEnabled());
      expect(push).not.toHaveBeenCalled();
    },
  );

  it('빈 목록이어도 조회 성공이면 제출할 수 있다', async () => {
    vi.mocked(getTerms).mockResolvedValue([]);
    renderContent(<SignupForm />);
    expect(await screen.findByText('동의할 약관이 없습니다.')).toBeVisible();
    expect(screen.getByRole('button', { name: '회원가입 하기' })).toBeEnabled();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
