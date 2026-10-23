'use client';

import { Dialog } from '@base-ui/react/dialog';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

interface ModalTitleProps extends Omit<Dialog.Title.Props, 'className'> {
  className?: string;
}

function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <Dialog.Title
      data-slot="modal-title"
      className={cn(
        cn(typographyVariants({ role: 'sectionTitle' }), 'text-foreground'),
        className,
      )}
      {...props}
    />
  );
}

export { ModalTitle };
export type { ModalTitleProps };
