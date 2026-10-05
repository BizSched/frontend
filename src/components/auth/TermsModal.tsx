'use client';

import { Button } from '@components/_common/Button/Button';
import { Modal } from '@components/_common/Modal/Modal';
import type { TermsDocument } from '@components/auth/terms';

import { cn } from '@lib/utilities/cn';

const FOOTER_BUTTON_CLASS_NAME =
  'w-auto min-w-0 max-tablet:h-12 max-tablet:py-3 max-tablet:text-base max-tablet:leading-6';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
  onExitComplete?: () => void;
  document: TermsDocument;
  stackIndex?: number;
}

function TermsModal({
  open,
  onOpenChange,
  onAgree,
  onExitComplete,
  document,
  stackIndex = 0,
}: TermsModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpened) => {
        if (!isOpened) {
          onExitComplete?.();
        }
      }}
      stackIndex={stackIndex}
    >
      <Modal.Panel
        size="md"
        placement="sheetOnMobile"
        className="h-[min(720px,calc(100dvh-4rem))] gap-8 max-tablet:h-[85dvh] max-tablet:gap-4"
      >
        <Modal.Header align="start">
          <Modal.Title className="max-tablet:text-xl">
            {document.title}
          </Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-4">
          {document.summary && (
            <ul className="flex flex-col gap-1 rounded-[16px] bg-slate-50 p-4 text-sm tracking-[-0.03em] text-slate-500">
              {document.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          <p className="text-sm leading-6 tracking-[-0.03em] whitespace-pre-line text-slate-400">
            {document.content}
          </p>
        </Modal.Body>
        <Modal.Footer layout="split" className="max-tablet:gap-2">
          <Modal.CloseButton
            render={
              <Button
                type="button"
                hierarchy="tertiary"
                className={cn(
                  FOOTER_BUTTON_CLASS_NAME,
                  'text-muted-foreground',
                )}
              />
            }
          >
            닫기
          </Modal.CloseButton>
          <Button
            type="button"
            onClick={onAgree}
            className={FOOTER_BUTTON_CLASS_NAME}
          >
            동의하기
          </Button>
        </Modal.Footer>
      </Modal.Panel>
    </Modal>
  );
}

export { TermsModal };
export type { TermsModalProps };
