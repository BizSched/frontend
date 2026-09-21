'use client';

import { Dialog } from '@base-ui/react/dialog';

import { cn } from '@lib/utilities/cn';

interface ModalTitleProps extends Omit<Dialog.Title.Props, 'className'> {
  className?: string;
}

function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <Dialog.Title
      data-slot="modal-title"
      className={cn(
        'text-foreground text-xl font-semibold tracking-[-0.03em]',
        className,
      )}
      {...props}
    />
  );
}

export { ModalTitle };
export type { ModalTitleProps };
