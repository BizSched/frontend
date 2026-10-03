import { describe, expect, it } from 'vitest';

import type { PartTimeStaffShift } from '@lib/types/partTimeStaff';
import {
  formatPartTimeStaffNow,
  formatPartTimeStaffWeekTitle,
  getPartTimeStaffShiftStatus,
  getPartTimeStaffWeekDates,
} from '@lib/utilities/partTime/partTimeStaff';

const createShift = (
  shift: Partial<PartTimeStaffShift> = {},
): PartTimeStaffShift => ({
  id: 1,
  date: '2026-10-03',
  startTime: '17:00',
  endTime: '22:00',
  isCheckedIn: false,
  ...shift,
});

describe('getPartTimeStaffShiftStatus', () => {
  it('출근 확인된 근무는 시각과 관계없이 근무 완료다', () => {
    expect(
      getPartTimeStaffShiftStatus(
        createShift({ isCheckedIn: true }),
        '2026-10-03T10:00',
      ),
    ).toBe('completed');
  });

  it('종료 시각 전에는 근무 중 시간대여도 근무 예정이다', () => {
    expect(getPartTimeStaffShiftStatus(createShift(), '2026-10-03T16:00')).toBe(
      'scheduled',
    );
    expect(getPartTimeStaffShiftStatus(createShift(), '2026-10-03T21:59')).toBe(
      'scheduled',
    );
  });

  it('종료 시각이 되면 출근 확인이 없는 근무는 미출근이다', () => {
    expect(getPartTimeStaffShiftStatus(createShift(), '2026-10-03T22:00')).toBe(
      'missed',
    );
    expect(getPartTimeStaffShiftStatus(createShift(), '2026-10-04T09:00')).toBe(
      'missed',
    );
  });

  it('종료 시각이 시작 시각보다 이르면 다음 날 종료로 본다', () => {
    const overnightShift = createShift({
      startTime: '22:00',
      endTime: '02:00',
    });

    expect(
      getPartTimeStaffShiftStatus(overnightShift, '2026-10-04T01:59'),
    ).toBe('scheduled');
    expect(
      getPartTimeStaffShiftStatus(overnightShift, '2026-10-04T02:00'),
    ).toBe('missed');
  });
});

describe('getPartTimeStaffWeekDates', () => {
  const WEEK_OF_2026_09_28 = [
    '2026-09-28',
    '2026-09-29',
    '2026-09-30',
    '2026-10-01',
    '2026-10-02',
    '2026-10-03',
    '2026-10-04',
  ];

  it('오늘이 속한 주의 월요일부터 일요일까지 7일을 반환한다', () => {
    expect(getPartTimeStaffWeekDates('2026-09-28')).toEqual(WEEK_OF_2026_09_28);
    expect(getPartTimeStaffWeekDates('2026-10-04')).toEqual(WEEK_OF_2026_09_28);
  });

  it('해가 바뀌는 주도 날짜가 이어진다', () => {
    expect(getPartTimeStaffWeekDates('2026-12-31')).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ]);
  });
});

describe('formatPartTimeStaffWeekTitle', () => {
  it('오늘이 속한 달의 1일이 들어 있는 주를 첫째 주로 센다', () => {
    expect(formatPartTimeStaffWeekTitle('2026-10-04')).toBe(
      '10월 첫째 주 근무 스케쥴',
    );
    expect(formatPartTimeStaffWeekTitle('2026-10-05')).toBe(
      '10월 둘째 주 근무 스케쥴',
    );
  });

  it('1일이 주 후반인 달은 여섯째 주까지 센다', () => {
    expect(formatPartTimeStaffWeekTitle('2026-08-31')).toBe(
      '8월 여섯째 주 근무 스케쥴',
    );
  });
});

describe('formatPartTimeStaffNow', () => {
  it('한국 시간 기준 YYYY-MM-DDTHH:mm 문자열을 반환한다', () => {
    expect(formatPartTimeStaffNow(new Date('2026-10-03T15:30:00Z'))).toBe(
      '2026-10-04T00:30',
    );
  });
});
