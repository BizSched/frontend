'use client';

import { Dialog } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@lib/utilities/cn';

interface ModalCloseButtonProps extends Omit<Dialog.Close.Props, 'className'> {
  className?: string;
}

function ModalCloseButton({
  className,
  children,
  render,
  ...props
}: ModalCloseButtonProps) {
  const isIconButton = render === undefined;

  return (
    <Dialog.Close
      data-slot="modal-close"
      render={render}
      className={cn(
        isIconButton &&
          'text-foreground inline-flex size-6 items-center justify-center transition-opacity hover:opacity-60',
        className,
      )}
      {...props}
    >
      {isIconButton ? (
        <>
          <XIcon className="size-6" aria-hidden="true" />
          <span className="sr-only">닫기</span>
        </>
      ) : (
        children
      )}
    </Dialog.Close>
  );
}

export { ModalCloseButton };
export type { ModalCloseButtonProps };
