'use client';

import { overlay } from 'overlay-kit';

import {
  TermsModalController,
  type TermsModalContent,
} from '@components/auth/TermsModalController';

const openTermsModal = (content: TermsModalContent) =>
  overlay.openAsync<boolean>((controller) => (
    <TermsModalController {...content} {...controller} />
  ));

export { openTermsModal };
