'use client';

import { Dialog } from '@base-ui/react/dialog';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

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
        cn(typographyVariants({ role: 'body' }), 'text-muted-foreground'),
        className,
      )}
      {...props}
    />
  );
}

export { ModalDescription };
export type { ModalDescriptionProps };
