'use client';

import type { ReactNode } from 'react';

import { cn } from '@lib/utilities/cn';

import { Modal } from './Modal';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onExitComplete?: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  stackIndex?: number;
  children?: ReactNode;
}

const ACTION_CLASS =
  'rounded-full px-5 py-3 text-lg font-medium tracking-[-0.03em] transition-colors';

function ConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  onExitComplete,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  stackIndex = 0,
  children,
}: ConfirmModalProps) {
  const hasBody = children !== null && children !== undefined;

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
      <Modal.Panel size="sm" className={cn(hasBody ? 'gap-4' : 'gap-10 pt-16')}>
        <Modal.Header align="center">
          <Modal.Title>{title}</Modal.Title>
          {description !== undefined && (
            <Modal.Description>{description}</Modal.Description>
          )}
        </Modal.Header>
        {hasBody && <Modal.Body>{children}</Modal.Body>}
        <Modal.Footer layout="split">
          <Modal.CloseButton
            render={
              <button
                type="button"
                className={cn(ACTION_CLASS, 'border-border border')}
              />
            }
          >
            {cancelText}
          </Modal.CloseButton>
          <button
            type="button"
            className={cn(ACTION_CLASS, 'bg-primary text-primary-foreground')}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </Modal.Footer>
      </Modal.Panel>
    </Modal>
  );
}

export { ConfirmModal };
export type { ConfirmModalProps };
