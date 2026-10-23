'use client';

import { use } from 'react';

import { ModalContext } from '@providers/modal/ModalProvider';
import type { ModalContextValue } from '@providers/types/modal';

const useModalContext = (): ModalContextValue => {
  const context = use(ModalContext);

  if (context === null) {
    throw new Error(
      'Modal 서브컴포넌트는 <Modal> 내부에서만 사용할 수 있습니다.',
    );
  }

  return context;
};

export { useModalContext };
