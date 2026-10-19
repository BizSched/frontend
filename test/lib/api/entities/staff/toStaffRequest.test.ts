import { describe, expect, it } from 'vitest';

import {
  toStaffCreateRequest,
  toStaffUpdateRequest,
} from '@lib/api/entities/staff/toStaffRequest';
import type { PartTimeStaffFormPayload } from '@lib/types/partTimeStaff';

const PAYLOAD: PartTimeStaffFormPayload = {
  name: '김알바',
  phone: '010-1234-5678',
  birthDate: '2000-01-01',
  gender: 'female',
  hourlyWage: 0,
  memo: '메모',
};

describe('staff 요청 변환', () => {
  it('성별과 메모를 DTO로 바꾸고 시급 0을 유지한다', () => {
    expect(toStaffCreateRequest(PAYLOAD)).toEqual({
      name: '김알바',
      phone: '010-1234-5678',
      birthDate: '2000-01-01',
      gender: 'FEMALE',
      hourlyWage: 0,
      note: '메모',
    });
    expect(toStaffCreateRequest({ ...PAYLOAD, gender: 'male' }).gender).toBe(
      'MALE',
    );
    expect(
      toStaffCreateRequest({ ...PAYLOAD, gender: null }).gender,
    ).toBeNull();
  });
  it('수정은 달라진 필드만 전송하고 빈 메모는 삭제 요청으로 유지한다', () => {
    expect(toStaffUpdateRequest(PAYLOAD, PAYLOAD)).toEqual({});
    expect(
      toStaffUpdateRequest({ ...PAYLOAD, name: '박알바', memo: '' }, PAYLOAD),
    ).toEqual({ name: '박알바', note: '' });
  });
});
