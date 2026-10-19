import type {
  PartTimeStaffAttachment,
  PartTimeStaffDetailItem,
} from '@lib/types/partTimeStaff';

interface StaffSaveProgress {
  staff?: PartTimeStaffDetailItem;
  uploadedAttachments: Map<string, PartTimeStaffAttachment>;
  initialAttachmentIds: Set<number>;
  hasUncertainInfoUpdate?: boolean;
  requiresReview?: boolean;
}

interface StaffSaveAttempt {
  hasRequested: boolean;
  hasRequestedNameChange: boolean;
}

interface StaffSaveResult {
  staff: PartTimeStaffDetailItem;
  isComplete: boolean;
  error?: unknown;
}

interface StaffSaveReview {
  staffId?: number;
}

export type {
  StaffSaveAttempt,
  StaffSaveProgress,
  StaffSaveResult,
  StaffSaveReview,
};
