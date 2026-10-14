'use client';

import { useEffect, useId, useRef } from 'react';

import { Button } from '@components/_common/Button/Button';
import { Checkbox } from '@components/_common/Checkbox/Checkbox';
import { openTermsModal } from '@components/auth/openTermsModal';

import { useTerms } from '@hooks/api/terms/useTerms';

import type { TermsResponse } from '@lib/api/generated/bizSchedAPI.schemas';
import { cn } from '@lib/utilities/cn';

type TermsAgreementValues = Record<number, boolean>;
const TERMS_AGREEMENT_DEFAULT_VALUES: TermsAgreementValues = {};

interface TermsAgreementProps {
  value: TermsAgreementValues;
  onChange: (value: TermsAgreementValues) => void;
  errorMessage?: string;
  disabled?: boolean;
}

function TermsAgreement({
  value,
  onChange,
  errorMessage,
  disabled = false,
}: TermsAgreementProps) {
  const errorId = useId();
  const { data: terms, isError, isFetching, refetch } = useTerms();
  const latestValue = useRef(value);
  const isDisabled = useRef(disabled);
  useEffect(() => {
    latestValue.current = value;
    isDisabled.current = disabled;
  }, [value, disabled]);

  const handleAgreementChange = (id: number, checked: boolean) => {
    if (isDisabled.current) return;
    onChange({ ...latestValue.current, [id]: checked });
  };
  const handleAllChange = (checked: boolean) => {
    if (isDisabled.current) return;
    onChange(Object.fromEntries((terms ?? []).map(({ id }) => [id, checked])));
  };
  const handleDocumentOpen = async (document: TermsResponse) => {
    if (isDisabled.current) return;
    const isAgreed = await openTermsModal({ document });
    if (isAgreed) handleAgreementChange(document.id, true);
  };
  const isAllAgreed =
    !!terms?.length && terms.every(({ id }) => value[id] === true);

  return (
    <fieldset
      disabled={disabled}
      aria-invalid={Boolean(errorMessage)}
      aria-describedby={errorMessage ? errorId : undefined}
      className="flex flex-col gap-4 rounded-[16px] border border-slate-200 bg-white-50 p-4"
    >
      <legend className="sr-only">약관 동의</legend>
      {isError ? (
        <div role="alert" className="flex flex-col items-start gap-2">
          <p className="text-sm text-slate-500">약관을 불러오지 못했어요.</p>
          <Button
            type="button"
            hierarchy="tertiary"
            disabled={isFetching || disabled}
            onClick={() => void refetch()}
          >
            다시 불러오기
          </Button>
        </div>
      ) : terms === undefined ? (
        <p role="status" className="text-sm text-slate-400">
          약관을 불러오는 중이에요.
        </p>
      ) : terms.length === 0 ? (
        <p className="text-sm text-slate-400">동의할 약관이 없습니다.</p>
      ) : (
        <>
          <label className="flex cursor-pointer items-center gap-2 text-base font-semibold tracking-[-0.03em] text-slate-700">
            <Checkbox
              checked={isAllAgreed}
              onCheckedChange={handleAllChange}
              disabled={disabled}
            />
            전체 동의
            <span className="text-sm font-medium text-slate-400">
              (선택 항목 포함)
            </span>
          </label>
          <span aria-hidden className="h-px bg-slate-100" />
          <ul className="flex flex-col gap-3">
            {terms.map((document) => (
              <li
                key={document.id}
                className="flex items-start justify-between gap-2"
              >
                <label className="flex min-w-0 cursor-pointer items-start gap-2 text-sm leading-5 tracking-[-0.03em] text-slate-500">
                  <Checkbox
                    disabled={disabled}
                    checked={value[document.id] === true}
                    onCheckedChange={(checked) =>
                      handleAgreementChange(document.id, checked)
                    }
                    className="mt-px"
                  />
                  <span>
                    <span
                      className={cn(
                        'font-semibold',
                        document.required
                          ? 'text-accent-500'
                          : 'text-slate-400',
                      )}
                    >
                      {document.required ? '[필수]' : '[선택]'}
                    </span>{' '}
                    {document.title}
                  </span>
                </label>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`${document.title} 전문 보기`}
                  onClick={() => void handleDocumentOpen(document)}
                  className="shrink-0 cursor-pointer rounded-lg text-sm leading-5 tracking-[-0.03em] text-slate-400 underline underline-offset-2 outline-none hover:text-slate-500 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  전문 보기
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className="text-sm tracking-[-0.03em] text-warning-500"
        >
          {errorMessage}
        </p>
      )}
    </fieldset>
  );
}

export { TermsAgreement, TERMS_AGREEMENT_DEFAULT_VALUES };
export type { TermsAgreementProps, TermsAgreementValues };
