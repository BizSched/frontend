'use client';

import { overlay } from 'overlay-kit';

import {
  ConfirmModalController,
  type ConfirmModalContent,
} from './ConfirmModalController';

const openConfirmModal = (content: ConfirmModalContent) =>
  overlay.openAsync<boolean>((controller) => (
    <ConfirmModalController {...content} {...controller} />
  ));

export { openConfirmModal };
export type { ConfirmModalContent };
