'use client';

import type { ReactNode } from 'react';

import { Checkbox } from '@components/_common/Checkbox/Checkbox';
import { openTermsModal } from '@components/auth/openTermsModal';
import { TERMS_DOCUMENTS, type TermsDocumentKey } from '@components/auth/terms';

type TermsAgreementKey =
  | 'age'
  | 'service'
  | 'privacy'
  | 'entrustment'
  | 'marketingEmail'
  | 'marketingSms';

type TermsAgreementValues = Record<TermsAgreementKey, boolean>;

interface RequiredTermsItem {
  key: Exclude<TermsAgreementKey, 'marketingEmail' | 'marketingSms'>;
  label: string;
  documentKey?: TermsDocumentKey;
}

const REQUIRED_TERMS_ITEMS: RequiredTermsItem[] = [
  { key: 'age', label: '만 19세 이상이며 사업자입니다' },
  {
    key: 'service',
    label: '서비스 이용약관에 동의합니다',
    documentKey: 'service',
  },
  {
    key: 'privacy',
    label: '개인정보 수집·이용에 동의합니다',
    documentKey: 'privacy',
  },
  {
    key: 'entrustment',
    label: '근로자 개인정보 처리 위탁 특약에 동의합니다',
    documentKey: 'entrustment',
  },
];

const MARKETING_CHANNEL_ITEMS = [
  { key: 'marketingEmail', label: '이메일' },
  { key: 'marketingSms', label: 'SMS·알림톡' },
] as const;

const TERMS_AGREEMENT_DEFAULT_VALUES: TermsAgreementValues = {
  age: false,
  service: false,
  privacy: false,
  entrustment: false,
  marketingEmail: false,
  marketingSms: false,
};

interface TermsCheckboxLabelProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}

function TermsCheckboxLabel({
  checked,
  onCheckedChange,
  children,
}: TermsCheckboxLabelProps) {
  return (
    <label className="flex min-w-0 cursor-pointer items-start gap-2 text-sm leading-5 tracking-[-0.03em] text-slate-500">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-px"
      />
      <span>{children}</span>
    </label>
  );
}

interface TermsAgreementProps {
  value: TermsAgreementValues;
  onChange: (value: TermsAgreementValues) => void;
}

function TermsAgreement({ value, onChange }: TermsAgreementProps) {
  const isAllAgreed = Object.values(value).every(Boolean);
  const isMarketingAgreed = value.marketingEmail || value.marketingSms;

  const handleAgreementChange = (key: TermsAgreementKey, checked: boolean) => {
    onChange({ ...value, [key]: checked });
  };

  const handleAllChange = (checked: boolean) => {
    onChange({
      age: checked,
      service: checked,
      privacy: checked,
      entrustment: checked,
      marketingEmail: checked,
      marketingSms: checked,
    });
  };

  const handleMarketingChange = (checked: boolean) => {
    onChange({ ...value, marketingEmail: checked, marketingSms: checked });
  };

  const handleDocumentOpen = async (
    key: RequiredTermsItem['key'],
    documentKey: TermsDocumentKey,
  ) => {
    const isAgreed = await openTermsModal({
      document: TERMS_DOCUMENTS[documentKey],
    });

    if (isAgreed) {
      handleAgreementChange(key, true);
    }
  };

  return (
    <fieldset className="flex flex-col gap-4 rounded-[16px] border border-slate-200 bg-white-50 p-4">
      <legend className="sr-only">약관 동의</legend>
      <label className="flex cursor-pointer items-center gap-2 text-base font-semibold tracking-[-0.03em] text-slate-700">
        <Checkbox checked={isAllAgreed} onCheckedChange={handleAllChange} />
        전체 동의
        <span className="text-sm font-medium text-slate-400">
          (선택 항목 포함)
        </span>
      </label>
      <span aria-hidden className="h-px bg-slate-100" />
      <ul className="flex flex-col gap-3">
        {REQUIRED_TERMS_ITEMS.map(({ key, label, documentKey }) => (
          <li key={key} className="flex items-start justify-between gap-2">
            <TermsCheckboxLabel
              checked={value[key]}
              onCheckedChange={(checked) => handleAgreementChange(key, checked)}
            >
              <span className="font-semibold text-accent-500">[필수]</span>{' '}
              {label}
            </TermsCheckboxLabel>
            {documentKey && (
              <button
                type="button"
                aria-label={`${TERMS_DOCUMENTS[documentKey].title} 전문 보기`}
                onClick={() => handleDocumentOpen(key, documentKey)}
                className="shrink-0 cursor-pointer rounded-lg text-sm leading-5 tracking-[-0.03em] text-slate-400 underline underline-offset-2 outline-none hover:text-slate-500 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                전문 보기
              </button>
            )}
          </li>
        ))}
      </ul>
      <span aria-hidden className="h-px bg-slate-100" />
      <div className="flex flex-col gap-2">
        <TermsCheckboxLabel
          checked={isMarketingAgreed}
          onCheckedChange={handleMarketingChange}
        >
          <span className="font-semibold text-slate-400">[선택]</span> 마케팅
          정보 수신에 동의합니다
        </TermsCheckboxLabel>
        <div className="flex flex-col gap-2 pl-6.5">
          <p className="text-xs leading-4 tracking-[-0.03em] text-slate-400">
            신규 기능, 이벤트, 혜택 안내를 받아보실 수 있습니다.
          </p>
          <div className="flex items-center gap-4">
            {MARKETING_CHANNEL_ITEMS.map(({ key, label }) => (
              <TermsCheckboxLabel
                key={key}
                checked={value[key]}
                onCheckedChange={(checked) =>
                  handleAgreementChange(key, checked)
                }
              >
                {label}
              </TermsCheckboxLabel>
            ))}
          </div>
          <p className="text-xs leading-4 tracking-[-0.03em] text-slate-400">
            동의하지 않아도 서비스를 이용할 수 있습니다.
          </p>
        </div>
      </div>
    </fieldset>
  );
}

export { TermsAgreement, TERMS_AGREEMENT_DEFAULT_VALUES };
export type { TermsAgreementProps, TermsAgreementValues };
