'use client';

import { overlay } from 'overlay-kit';

import {
  PartTimeScheduleFormModalController,
  type PartTimeScheduleFormModalContent,
} from '@components/partTime/schedule/modal/PartTimeScheduleFormModalController';

import type { PartTimeScheduleFormResult } from '@lib/types/partTimeSchedule';

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
