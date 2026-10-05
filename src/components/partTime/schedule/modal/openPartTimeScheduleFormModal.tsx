'use client';

import { overlay } from 'overlay-kit';

import type { PartTimeScheduleFormResult } from '@components/partTime/schedule/modal/PartTimeScheduleFormModal';
import {
  PartTimeScheduleFormModalController,
  type PartTimeScheduleFormModalContent,
} from '@components/partTime/schedule/modal/PartTimeScheduleFormModalController';

let isFormModalOpen = false;

const openPartTimeScheduleFormModal = async (
  content: PartTimeScheduleFormModalContent,
) => {
  if (isFormModalOpen) {
    return null;
  }

  isFormModalOpen = true;

  try {
    return await overlay.openAsync<PartTimeScheduleFormResult | null>(
      (controller) => (
        <PartTimeScheduleFormModalController {...content} {...controller} />
      ),
    );
  } finally {
    isFormModalOpen = false;
  }
};

export { openPartTimeScheduleFormModal };
