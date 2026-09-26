'use client';

import { Dialog } from '@base-ui/react/dialog';

import { cn } from '@lib/utilities/cn';

interface ModalDescriptionProps extends Omit<
  Dialog.Description.Props,
  'className'
> {
  className?: string;
}

function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return (
    <Dialog.Description
      data-slot="modal-description"
      className={cn(
        'text-muted-foreground text-base tracking-[-0.03em]',
        className,
      )}
      {...props}
    />
  );
}

export { ModalDescription };
export type { ModalDescriptionProps };
