import type {
  PartTimeSchedule,
  PartTimeStaff,
} from '@lib/types/partTimeSchedule';

const PART_TIME_STAFFS: PartTimeStaff[] = [
  { id: 1, name: '김예림', isDeleted: false },
  { id: 2, name: '강성구', isDeleted: false },
  { id: 3, name: '정예은', isDeleted: false },
  { id: 4, name: '박도윤', isDeleted: true },
];

const ACTIVE_PART_TIME_STAFFS = PART_TIME_STAFFS.filter(
  (staff) => !staff.isDeleted,
);

const [KIM_YERIM, KANG_SEONGGU, JUNG_YEEUN, PARK_DOYUN] = PART_TIME_STAFFS;

const MORNING_SHIFT = { startTime: '07:00', endTime: '13:00', memo: '오픈' };
const AFTERNOON_SHIFT = { startTime: '13:00', endTime: '17:00', memo: '' };
const EVENING_SHIFT = { startTime: '17:00', endTime: '22:00', memo: '마감' };

const MOCK_SHIFTS_BY_DAY: Record<
  number,
  Pick<PartTimeSchedule, 'startTime' | 'endTime' | 'memo' | 'staff'>[]
> = {
  3: [{ ...MORNING_SHIFT, staff: KANG_SEONGGU }],
  6: [{ ...AFTERNOON_SHIFT, staff: JUNG_YEEUN }],
  8: [
    { ...EVENING_SHIFT, staff: KIM_YERIM },
    { ...MORNING_SHIFT, staff: KANG_SEONGGU },
    { ...AFTERNOON_SHIFT, staff: JUNG_YEEUN },
    { startTime: '09:00', endTime: '13:00', memo: '', staff: KIM_YERIM },
  ],
  10: [
    { ...MORNING_SHIFT, staff: KANG_SEONGGU },
    { ...AFTERNOON_SHIFT, staff: JUNG_YEEUN },
    { ...EVENING_SHIFT, staff: KIM_YERIM },
  ],
  11: [{ ...MORNING_SHIFT, staff: KANG_SEONGGU }],
  13: [
    { ...AFTERNOON_SHIFT, staff: JUNG_YEEUN },
    { ...EVENING_SHIFT, staff: PARK_DOYUN },
  ],
  16: [{ ...EVENING_SHIFT, staff: KIM_YERIM }],
  17: [{ ...EVENING_SHIFT, staff: KIM_YERIM }],
  21: [{ ...AFTERNOON_SHIFT, staff: JUNG_YEEUN }],
  22: [{ ...EVENING_SHIFT, staff: KIM_YERIM }],
  24: [{ ...EVENING_SHIFT, staff: KIM_YERIM }],
  27: [{ ...EVENING_SHIFT, staff: KIM_YERIM }],
};

// NOTE: 스케쥴 API 연동 전까지 사용하는 목데이터. 어느 월로 이동해도 화면을 확인할 수 있도록 같은 근무 패턴을 표시 월에 반복하고, 지난 근무는 출근 확인된 것으로 둔다
const getPartTimeScheduleMocks = (
  month: string,
  today: string,
): PartTimeSchedule[] => {
  const monthOffset = Number(month.replace('-', '')) * 100;

  return Object.entries(MOCK_SHIFTS_BY_DAY).flatMap(([day, shifts]) => {
    const date = `${month}-${day.padStart(2, '0')}`;

    return shifts.map((shift, index) => ({
      id: monthOffset + Number(day) * 10 + index,
      date,
      ...shift,
      isCheckedIn: date < today,
    }));
  });
};

export { ACTIVE_PART_TIME_STAFFS, PART_TIME_STAFFS, getPartTimeScheduleMocks };
