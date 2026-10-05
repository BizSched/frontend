import type {
  PartTimeStaffDetailItem,
  PartTimeStaffListItem,
  PartTimeStaffShift,
} from '@lib/types/partTimeStaff';
import { getPartTimeStaffWeekDates } from '@lib/utilities/partTime/partTimeStaff';

const PART_TIME_STAFF_LIST_MOCKS: PartTimeStaffListItem[] = [
  { id: 1, name: '김예림', phone: '010-1234-5678', createdAt: '2026-09-28' },
  { id: 2, name: '강성구', phone: '010-2345-6789', createdAt: '2026-09-21' },
  { id: 3, name: '정예은', phone: '010-3456-7890', createdAt: '2026-09-15' },
  { id: 4, name: '이서준', phone: '010-4567-8901', createdAt: '2026-09-02' },
  { id: 5, name: '최하린', phone: '010-5678-9012', createdAt: '2026-08-27' },
  { id: 6, name: '윤지호', phone: '010-6789-0123', createdAt: '2026-08-11' },
  { id: 7, name: '한소율', phone: '010-7890-1234', createdAt: '2026-07-30' },
  { id: 8, name: '오민재', phone: '010-8901-2345', createdAt: '2026-07-14' },
  { id: 9, name: '서지안', phone: '010-9012-3456', createdAt: '2026-06-03' },
  { id: 10, name: '임도현', phone: '010-0123-4567', createdAt: '2026-05-19' },
  { id: 11, name: '송유나', phone: '010-1357-2468', createdAt: '2026-04-29' },
  { id: 12, name: '배시우', phone: '010-2468-1357', createdAt: '2026-03-08' },
];

const PART_TIME_STAFF_MEMO_MOCK = `주말 오픈 담당. 포스 마감 정산까지 가능합니다.

- 화요일은 학교 수업으로 13시 이후 출근
- 보건증 만료일 2027. 03. 15
- 12월부터 주 3회로 변경 희망`;

const getPartTimeStaffDetailMock = (
  staffId: number,
): PartTimeStaffDetailItem | undefined => {
  const staff = PART_TIME_STAFF_LIST_MOCKS.find(({ id }) => id === staffId);

  if (!staff) {
    return undefined;
  }

  const isOddId = staffId % 2 === 1;

  return {
    ...staff,
    birthDate: `${2000 + (staffId % 6)}-0${(staffId % 9) + 1}-1${staffId % 10}`,
    gender: isOddId ? 'female' : 'male',
    hourlyWage: 10_320 + (staffId % 3) * 500,
    attachments: isOddId
      ? [
          {
            id: 1,
            name: '근로계약서.pdf',
            type: 'pdf',
            url: '/mocks/partTimeStaff/contract.pdf',
          },
          {
            id: 2,
            name: '보건증.jpg',
            type: 'image',
            url: '/mocks/partTimeStaff/health-certificate.svg',
          },
        ]
      : [],
    memo: isOddId ? PART_TIME_STAFF_MEMO_MOCK : '',
  };
};

const MOCK_WEEKLY_SHIFTS = [
  { dayIndex: 0, startTime: '17:00', endTime: '22:00', isMissed: false },
  { dayIndex: 2, startTime: '17:00', endTime: '22:00', isMissed: true },
  { dayIndex: 4, startTime: '17:00', endTime: '22:00', isMissed: false },
  { dayIndex: 5, startTime: '09:00', endTime: '13:00', isMissed: false },
  { dayIndex: 6, startTime: '17:00', endTime: '22:00', isMissed: false },
];

const getPartTimeStaffWeeklyShiftMocks = (
  staffId: number,
  now: string,
): PartTimeStaffShift[] => {
  const weekDates = getPartTimeStaffWeekDates(now.slice(0, 10));

  return MOCK_WEEKLY_SHIFTS.map(
    ({ dayIndex, startTime, endTime, isMissed }) => {
      const date = weekDates[dayIndex];

      return {
        id: staffId * 100 + dayIndex,
        date,
        startTime,
        endTime,
        isCheckedIn: !isMissed && `${date}T${endTime}` <= now,
      };
    },
  );
};

export {
  PART_TIME_STAFF_LIST_MOCKS,
  getPartTimeStaffDetailMock,
  getPartTimeStaffWeeklyShiftMocks,
};
