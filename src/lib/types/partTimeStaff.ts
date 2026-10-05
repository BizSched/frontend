interface PartTimeStaffListItem {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
}

interface PartTimeStaffAttachment {
  id: number;
  name: string;
  type: 'pdf' | 'image';
  url: string;
}

interface PartTimeStaffDetailItem extends PartTimeStaffListItem {
  birthDate: string;
  gender: 'male' | 'female';
  hourlyWage: number;
  attachments: PartTimeStaffAttachment[];
  memo: string;
}

interface PartTimeStaffShift {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isCheckedIn: boolean;
}

type PartTimeStaffShiftStatus = 'scheduled' | 'completed' | 'missed';

type PartTimeStaffAttachmentType = PartTimeStaffAttachment['type'];

type PartTimeStaffAttachmentPreview = Pick<
  PartTimeStaffAttachment,
  'name' | 'type' | 'url'
>;

interface PartTimeStaffFormSavedAttachment extends PartTimeStaffAttachment {
  kind: 'saved';
  key: string;
}

interface PartTimeStaffFormNewAttachment extends PartTimeStaffAttachmentPreview {
  kind: 'new';
  key: string;
  file: File;
}

type PartTimeStaffFormAttachment =
  PartTimeStaffFormSavedAttachment | PartTimeStaffFormNewAttachment;

interface PartTimeStaffFormValues {
  name: string;
  birthDate: string;
  gender: PartTimeStaffDetailItem['gender'] | '';
  phone: string;
  hourlyWage: string;
  attachments: PartTimeStaffFormAttachment[];
  memo: string;
}

interface PartTimeStaffFormPayload {
  name: string;
  birthDate: string | null;
  gender: PartTimeStaffDetailItem['gender'] | null;
  phone: string;
  hourlyWage: number | null;
  memo: string;
}

interface PartTimeStaffFormattedInput {
  value: string;
  caret: number;
}

type PartTimeStaffInputDeleteDirection = 'backward' | 'forward';

interface PartTimeStaffFormattedInputChange {
  value: string;
  caret: number;
  previousValue: string;
  deleteDirection?: PartTimeStaffInputDeleteDirection;
}

interface PartTimeStaffMemoLength {
  withSpaces: number;
  withoutSpaces: number;
}

export type {
  PartTimeStaffAttachment,
  PartTimeStaffAttachmentPreview,
  PartTimeStaffAttachmentType,
  PartTimeStaffDetailItem,
  PartTimeStaffFormAttachment,
  PartTimeStaffFormattedInput,
  PartTimeStaffFormattedInputChange,
  PartTimeStaffFormNewAttachment,
  PartTimeStaffFormPayload,
  PartTimeStaffFormSavedAttachment,
  PartTimeStaffFormValues,
  PartTimeStaffInputDeleteDirection,
  PartTimeStaffMemoLength,
  PartTimeStaffListItem,
  PartTimeStaffShift,
  PartTimeStaffShiftStatus,
};
