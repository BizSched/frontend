'use client';

import { Button } from '@components/_common/Button/Button';
import { Modal } from '@components/_common/Modal/Modal';

import type { TermsResponse } from '@lib/api/generated/bizSchedAPI.schemas';
import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

const FOOTER_BUTTON_CLASS_NAME =
  'w-auto min-w-0 max-tablet:h-12 max-tablet:py-3';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
  onExitComplete?: () => void;
  document: TermsResponse;
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
          <Modal.Title>{document.title}</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-4">
          <p
            className={cn(
              typographyVariants({ role: 'body' }),
              'whitespace-pre-line text-slate-400',
            )}
          >
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
