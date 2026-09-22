import { ModalBody } from './ModalBody';
import { ModalCloseButton } from './ModalCloseButton';
import { ModalDescription } from './ModalDescription';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';
import { ModalPanel } from './ModalPanel';
import { ModalRoot } from './ModalRoot';
import { ModalTitle } from './ModalTitle';

const Modal = Object.assign(ModalRoot, {
  Panel: ModalPanel,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  CloseButton: ModalCloseButton,
  Body: ModalBody,
  Footer: ModalFooter,
});

export { Modal };
