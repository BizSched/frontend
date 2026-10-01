interface PartTimeStaff {
  id: number;
  name: string;
  isDeleted: boolean;
}

interface PartTimeSchedule {
  id: number;
  staff: PartTimeStaff;
  date: string;
  startTime: string;
  endTime: string;
  isCheckedIn: boolean;
  memo: string;
}

export type { PartTimeSchedule, PartTimeStaff };
