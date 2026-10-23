import type {
  StaffCreateRequest,
  StaffUpdateRequest,
} from '@lib/api/generated/bizSchedAPI.schemas';
import type { PartTimeStaffFormPayload } from '@lib/types/partTimeStaff';

const toStaffCreateRequest = (
  payload: PartTimeStaffFormPayload,
): StaffCreateRequest => ({
  name: payload.name,
  phone: payload.phone,
  birthDate: payload.birthDate,
  gender:
    payload.gender === null
      ? null
      : payload.gender === 'male'
        ? 'MALE'
        : 'FEMALE',
  hourlyWage: payload.hourlyWage,
  note: payload.memo,
});

const toStaffUpdateRequest = (
  payload: PartTimeStaffFormPayload,
  previous: PartTimeStaffFormPayload,
): StaffUpdateRequest => {
  const current = toStaffCreateRequest(payload);
  const initial = toStaffCreateRequest(previous);
  return Object.fromEntries(
    Object.entries(current).filter(
      ([key, value]) => value !== initial[key as keyof StaffCreateRequest],
    ),
  );
};

export { toStaffCreateRequest, toStaffUpdateRequest };
