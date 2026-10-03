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

export type {
  PartTimeStaffAttachment,
  PartTimeStaffDetailItem,
  PartTimeStaffListItem,
  PartTimeStaffShift,
  PartTimeStaffShiftStatus,
};
