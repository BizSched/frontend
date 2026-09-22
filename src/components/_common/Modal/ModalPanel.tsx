'use client';

import type { CSSProperties } from 'react';

import { Dialog } from '@base-ui/react/dialog';
import { cva, type VariantProps } from 'class-variance-authority';

import { useModalContext } from '@hooks/modal/useModalContext';
import { cn } from '@lib/utilities/cn';

const modalBackdropVariants = cva(
  'fixed inset-0 z-[calc(var(--z-modal-base)_+_var(--modal-stack-index)_*_10)] data-[open]:animate-in data-[open]:fade-in-0 data-[closed]:animate-out data-[closed]:fade-out-0 motion-reduce:animate-none',
  {
    variants: {
      backdrop: {
        dim: 'bg-overlay',
        transparent: 'bg-transparent',
      },
    },
    defaultVariants: {
      backdrop: 'dim',
    },
  },
);

const modalPanelVariants = cva(
  'fixed top-1/2 left-1/2 z-[calc(var(--z-modal-base)_+_var(--modal-stack-index)_*_10_+_1)] flex max-h-[calc(100dvh-4rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-modal bg-white-50 p-8 shadow-modal data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 motion-reduce:animate-none max-tablet:gap-4 max-tablet:p-6',
  {
    variants: {
      size: {
        sm: 'w-[456px] max-tablet:w-[343px]',
        md: 'w-[488px] max-tablet:w-full',
      },
      placement: {
        center: '',
        sheetOnMobile:
          'max-tablet:top-auto max-tablet:bottom-0 max-tablet:left-0 max-tablet:max-h-[85dvh] max-tablet:w-full max-tablet:translate-x-0 max-tablet:translate-y-0 max-tablet:rounded-b-none max-tablet:data-[open]:zoom-in-100 max-tablet:data-[open]:slide-in-from-bottom max-tablet:data-[closed]:zoom-out-100 max-tablet:data-[closed]:slide-out-to-bottom',
      },
    },
    defaultVariants: {
      size: 'sm',
      placement: 'center',
    },
  },
);

type ModalBackdropVariant = NonNullable<
  VariantProps<typeof modalBackdropVariants>['backdrop']
>;

interface ModalPanelProps
  extends
    Omit<Dialog.Popup.Props, 'className'>,
    VariantProps<typeof modalPanelVariants> {
  className?: string;
  backdrop?: ModalBackdropVariant;
  container?: Dialog.Portal.Props['container'];
}

function ModalPanel({
  size,
  placement,
  backdrop,
  container,
  className,
  ...props
}: ModalPanelProps) {
  const { stackIndex } = useModalContext();
  const resolvedBackdrop =
    backdrop ?? (stackIndex === 0 ? 'dim' : 'transparent');

  return (
    <Dialog.Portal
      container={container}
      style={{ '--modal-stack-index': stackIndex } as CSSProperties}
    >
      <Dialog.Backdrop
        data-slot="modal-backdrop"
        className={modalBackdropVariants({ backdrop: resolvedBackdrop })}
      />
      <Dialog.Popup
        data-slot="modal-panel"
        className={cn(modalPanelVariants({ size, placement }), className)}
        {...props}
      />
    </Dialog.Portal>
  );
}

export { ModalPanel, modalPanelVariants, modalBackdropVariants };
export type { ModalPanelProps, ModalBackdropVariant };
