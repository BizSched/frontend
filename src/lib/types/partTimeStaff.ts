type PartTimeStaffEmploymentStatus = 'employed' | 'onLeave' | 'resigned';

interface PartTimeStaffListItem {
  id: number;
  name: string;
  phone?: string | null;
  createdAt: string;
  employmentStatus: PartTimeStaffEmploymentStatus;
}

interface PartTimeStaffAttachment {
  id: number;
  name: string;
  type: 'pdf' | 'image';
  url: string;
}

interface PartTimeStaffDetailItem extends PartTimeStaffListItem {
  birthDate?: string | null;
  gender?: 'male' | 'female' | null;
  hourlyWage?: number | null;
  attachments: PartTimeStaffAttachment[];
  memo?: string | null;
}

interface PartTimeStaffListResponse {
  page: number;
  size: number;
  items: PartTimeStaffListItem[];
  totalCount: number;
  totalPage: number;
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
  gender: NonNullable<PartTimeStaffDetailItem['gender']> | '';
  phone: string;
  hourlyWage: string;
  attachments: PartTimeStaffFormAttachment[];
  memo: string;
}

interface PartTimeStaffFormPayload {
  name: string;
  birthDate: string | null;
  gender: NonNullable<PartTimeStaffDetailItem['gender']> | null;
  phone: string | null;
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

export type {
  PartTimeStaffAttachment,
  PartTimeStaffAttachmentPreview,
  PartTimeStaffAttachmentType,
  PartTimeStaffDetailItem,
  PartTimeStaffEmploymentStatus,
  PartTimeStaffFormAttachment,
  PartTimeStaffFormattedInput,
  PartTimeStaffFormattedInputChange,
  PartTimeStaffFormNewAttachment,
  PartTimeStaffFormPayload,
  PartTimeStaffFormSavedAttachment,
  PartTimeStaffFormValues,
  PartTimeStaffInputDeleteDirection,
  PartTimeStaffListItem,
  PartTimeStaffListResponse,
  PartTimeStaffShift,
  PartTimeStaffShiftStatus,
};
