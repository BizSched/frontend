import { describe, expect, it } from 'vitest';

import type {
  PartTimeSchedule,
  PartTimeStaff,
} from '@lib/types/partTimeSchedule';
import {
  formatPartTimeScheduleDuration,
  formatPartTimeScheduleImageFileName,
  getPartTimeScheduleRange,
  getPartTimeScheduleStaffOptions,
  getShiftPeriod,
  groupPartTimeSchedulesByShift,
} from '@lib/utilities/partTime/partTimeSchedule';

describe('getPartTimeScheduleRange', () => {
  it.each([
    { month: '2026-10', from: '2026-09-28', to: '2026-11-01' },
    { month: '2027-02', from: '2027-02-01', to: '2027-02-28' },
    { month: '2026-03', from: '2026-02-23', to: '2026-04-05' },
    { month: '2026-12', from: '2026-11-30', to: '2027-01-03' },
  ])(
    '$month 격자는 첫 주 월요일~마지막 주 일요일이다',
    ({ month, from, to }) => {
      expect(getPartTimeScheduleRange(month)).toEqual({ from, to });
    },
  );

  it('6주 격자도 BE 상한 42일을 넘지 않는다', () => {
    const { from, to } = getPartTimeScheduleRange('2026-03');
    const days = (Date.parse(to) - Date.parse(from)) / 86_400_000 + 1;
    expect(days).toBe(42);
  });

  it('잘못된 월은 거부한다', () => {
    expect(() => getPartTimeScheduleRange('2026-13')).toThrow(RangeError);
  });
});

describe('getPartTimeScheduleStaffOptions', () => {
  const EMPLOYED = [
    { id: 1, name: '김예림', isDeleted: false },
    { id: 2, name: '강성구', isDeleted: false },
  ];
  const createSchedule = (staff: PartTimeStaff): PartTimeSchedule => ({
    id: 10,
    staff,
    date: '2026-10-14',
    startTime: '15:00',
    endTime: '19:00',
    isCheckedIn: true,
    memo: '',
  });

  it('추가 모드는 재직자 목록을 그대로 쓴다', () => {
    expect(getPartTimeScheduleStaffOptions(EMPLOYED)).toBe(EMPLOYED);
  });

  it('수정 대상 담당자가 재직자면 목록을 그대로 쓴다', () => {
    expect(
      getPartTimeScheduleStaffOptions(EMPLOYED, createSchedule(EMPLOYED[1])),
    ).toBe(EMPLOYED);
  });

  it('휴직·퇴사자나 목록 로딩 중에는 현재 담당자를 맨 앞에 덧붙인다', () => {
    const resigned = { id: 99, name: '퇴사한알바', isDeleted: false };
    expect(
      getPartTimeScheduleStaffOptions(EMPLOYED, createSchedule(resigned)),
    ).toEqual([resigned, ...EMPLOYED]);
    expect(
      getPartTimeScheduleStaffOptions([], createSchedule(resigned)),
    ).toEqual([resigned]);
  });
});

describe('getShiftPeriod', () => {
  it.each([
    ['06:00', '오전'],
    ['12:59', '오전'],
    ['13:00', '오후'],
    ['17:59', '오후'],
    ['18:00', '저녁'],
    ['21:59', '저녁'],
    ['22:00', '야간'],
  ])('%s 시작은 %s', (startTime, period) => {
    expect(getShiftPeriod(startTime)).toBe(period);
  });
});

describe('groupPartTimeSchedulesByShift', () => {
  const createSchedule = (
    id: number,
    startTime: string,
    endTime: string,
  ): PartTimeSchedule => ({
    id,
    staff: { id, name: `알바${id}`, isDeleted: false },
    date: '2026-10-16',
    startTime,
    endTime,
    isCheckedIn: false,
    memo: '',
  });

  it('근무자가 없는 시간대도 빈 배열로 둔다', () => {
    expect(groupPartTimeSchedulesByShift([])).toEqual({
      오전: [],
      오후: [],
      저녁: [],
      야간: [],
    });
  });

  it('같은 시간대는 시작 시각 순으로 정렬한다', () => {
    const late = createSchedule(1, '14:00', '18:00');
    const early = createSchedule(2, '13:00', '18:00');
    const morning = createSchedule(3, '09:00', '13:00');

    expect(groupPartTimeSchedulesByShift([late, morning, early])).toEqual({
      오전: [morning],
      오후: [early, late],
      저녁: [],
      야간: [],
    });
  });
});

describe('formatPartTimeScheduleDuration', () => {
  it.each([
    ['12:00', '18:00', '6시간'],
    ['13:00', '16:30', '3시간 30분'],
    ['09:00', '09:30', '30분'],
  ])('%s~%s는 %s', (startTime, endTime, text) => {
    expect(formatPartTimeScheduleDuration(startTime, endTime)).toBe(text);
  });
});

describe('formatPartTimeScheduleImageFileName', () => {
  it.each([
    { staffName: undefined, fileName: '아르바이트생-스케줄-2026-10-22.png' },
    {
      staffName: '신형만',
      fileName: '아르바이트생-스케줄-2026-10-22-신형만.png',
    },
  ])('이름이 $staffName이면 $fileName이다', ({ staffName, fileName }) => {
    expect(formatPartTimeScheduleImageFileName('2026-10-22', staffName)).toBe(
      fileName,
    );
  });
});
