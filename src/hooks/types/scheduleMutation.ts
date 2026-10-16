import type {
  AttendanceUpdateRequest,
  ScheduleUpdateRequest,
} from '@lib/api/generated/bizSchedAPI.schemas';

interface UpdateScheduleVariables {
  scheduleId: number;
  body: ScheduleUpdateRequest;
}

interface ChangeScheduleAttendanceVariables {
  scheduleId: number;
  body: AttendanceUpdateRequest;
}

export type { ChangeScheduleAttendanceVariables, UpdateScheduleVariables };
