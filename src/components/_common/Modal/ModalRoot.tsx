'use client';

import { Dialog } from '@base-ui/react/dialog';

import { ModalProvider } from '@providers/modal/ModalProvider';

interface ModalRootProps extends Dialog.Root.Props {
  stackIndex?: number;
}

function ModalRoot({ stackIndex = 0, ...props }: ModalRootProps) {
  return (
    <ModalProvider stackIndex={stackIndex}>
      <Dialog.Root {...props} />
    </ModalProvider>
  );
}

export { ModalRoot };
export type { ModalRootProps };
