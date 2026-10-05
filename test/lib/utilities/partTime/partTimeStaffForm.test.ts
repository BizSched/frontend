import { describe, expect, it } from 'vitest';

import type {
  PartTimeStaffAttachment,
  PartTimeStaffDetailItem,
  PartTimeStaffFormSavedAttachment,
  PartTimeStaffFormValues,
} from '@lib/types/partTimeStaff';
import {
  applyPartTimeStaffInputFormat,
  countPartTimeStaffCharacters,
  countPartTimeStaffMemoLength,
  createPartTimeStaffFormNewAttachment,
  formatPartTimeStaffBirthDateInput,
  formatPartTimeStaffHourlyWageInput,
  formatPartTimeStaffPhoneInput,
  getPartTimeStaffAttachmentType,
  isPartTimeStaffBirthDateValid,
  isPartTimeStaffFormChanged,
  isPartTimeStaffNameValid,
  isPartTimeStaffPhoneValid,
  limitPartTimeStaffName,
  toPartTimeStaffFormPayload,
  toPartTimeStaffFormValues,
} from '@lib/utilities/partTime/partTimeStaffForm';

const TODAY = '2026-10-05';

const CONTRACT_ATTACHMENT: PartTimeStaffAttachment = {
  id: 1,
  name: '근로계약서.pdf',
  type: 'pdf',
  url: '/mocks/partTimeStaff/contract.pdf',
};

const SAVED_CONTRACT_ATTACHMENT: PartTimeStaffFormSavedAttachment = {
  ...CONTRACT_ATTACHMENT,
  kind: 'saved',
  key: 'saved-1',
};

describe('getPartTimeStaffAttachmentType', () => {
  it('PDF와 이미지 MIME을 뷰어 형식으로 바꾼다', () => {
    expect(getPartTimeStaffAttachmentType('application/pdf')).toBe('pdf');
    expect(getPartTimeStaffAttachmentType('image/png')).toBe('image');
    expect(getPartTimeStaffAttachmentType('image/jpeg')).toBe('image');
  });

  it('그 외 형식은 받지 않는다', () => {
    expect(getPartTimeStaffAttachmentType('text/plain')).toBeUndefined();
    expect(getPartTimeStaffAttachmentType('')).toBeUndefined();
  });
});

describe('createPartTimeStaffFormNewAttachment', () => {
  it('고른 파일을 새 첨부파일 폼 값으로 만든다', () => {
    const file = new File(['image'], '보건증.png', { type: 'image/png' });

    expect(
      createPartTimeStaffFormNewAttachment(file, 'blob:health-certificate'),
    ).toEqual({
      kind: 'new',
      key: 'blob:health-certificate',
      file,
      name: '보건증.png',
      type: 'image',
      url: 'blob:health-certificate',
    });
  });

  it('받지 않는 형식이면 만들지 않는다', () => {
    const file = new File(['memo'], '메모.txt', { type: 'text/plain' });

    expect(
      createPartTimeStaffFormNewAttachment(file, 'blob:memo'),
    ).toBeUndefined();
  });
});

describe('countPartTimeStaffCharacters', () => {
  it('이모지도 1자로 센다', () => {
    expect(countPartTimeStaffCharacters('정예은😀')).toBe(4);
  });
});

describe('countPartTimeStaffMemoLength', () => {
  it('공백제외는 줄바꿈을 포함한 모든 공백 문자를 뺀다', () => {
    expect(countPartTimeStaffMemoLength('주말 오픈\n\t담당 ')).toEqual({
      withSpaces: 10,
      withoutSpaces: 6,
    });
  });

  it('빈 메모는 0자다', () => {
    expect(countPartTimeStaffMemoLength('')).toEqual({
      withSpaces: 0,
      withoutSpaces: 0,
    });
  });
});

describe('limitPartTimeStaffName', () => {
  it('문자 단위로 30자까지만 남긴다', () => {
    expect(limitPartTimeStaffName('가'.repeat(31))).toBe('가'.repeat(30));
    expect(limitPartTimeStaffName('😀'.repeat(31))).toBe('😀'.repeat(30));
  });
});

describe('isPartTimeStaffNameValid', () => {
  it('앞뒤 공백을 뺀 뒤 1자 이상이어야 한다', () => {
    expect(isPartTimeStaffNameValid('')).toBe(false);
    expect(isPartTimeStaffNameValid('   ')).toBe(false);
    expect(isPartTimeStaffNameValid(' 정예은 ')).toBe(true);
  });

  it('문자 단위로 30자를 넘으면 유효하지 않다', () => {
    expect(isPartTimeStaffNameValid('😀'.repeat(30))).toBe(true);
    expect(isPartTimeStaffNameValid('😀'.repeat(31))).toBe(false);
  });
});

describe('formatPartTimeStaffBirthDateInput', () => {
  it('숫자 외 문자는 버리고 입력 길이에 맞춰 점을 넣는다', () => {
    expect(formatPartTimeStaffBirthDateInput('2001')).toBe('2001');
    expect(formatPartTimeStaffBirthDateInput('20010')).toBe('2001.0');
    expect(formatPartTimeStaffBirthDateInput('2001.02')).toBe('2001.02');
    expect(formatPartTimeStaffBirthDateInput('2001a021')).toBe('2001.02.1');
  });

  it('숫자 8자리를 넘는 입력은 버린다', () => {
    expect(formatPartTimeStaffBirthDateInput('200102119')).toBe('2001.02.11');
  });

  it('점을 지우면 앞 숫자만 남는다', () => {
    expect(formatPartTimeStaffBirthDateInput('2001.')).toBe('2001');
  });
});

describe('isPartTimeStaffBirthDateValid', () => {
  it('빈 값은 선택 입력이라 유효하다', () => {
    expect(isPartTimeStaffBirthDateValid('', TODAY)).toBe(true);
  });

  it('8자리를 다 채우지 않으면 유효하지 않다', () => {
    expect(isPartTimeStaffBirthDateValid('2001.02.1', TODAY)).toBe(false);
  });

  it('실제 없는 날짜는 유효하지 않다', () => {
    expect(isPartTimeStaffBirthDateValid('2001.02.29', TODAY)).toBe(false);
    expect(isPartTimeStaffBirthDateValid('2001.13.01', TODAY)).toBe(false);
    expect(isPartTimeStaffBirthDateValid('2004.02.29', TODAY)).toBe(true);
  });

  it('오늘 이전 날짜만 유효하다', () => {
    expect(isPartTimeStaffBirthDateValid('2026.10.04', TODAY)).toBe(true);
    expect(isPartTimeStaffBirthDateValid('2026.10.05', TODAY)).toBe(false);
    expect(isPartTimeStaffBirthDateValid('2026.10.06', TODAY)).toBe(false);
  });
});

describe('formatPartTimeStaffPhoneInput', () => {
  it('숫자만 남기고 입력 길이에 맞춰 하이픈을 넣는다', () => {
    expect(formatPartTimeStaffPhoneInput('010')).toBe('010');
    expect(formatPartTimeStaffPhoneInput('0101')).toBe('010-1');
    expect(formatPartTimeStaffPhoneInput('0101234')).toBe('010-1234');
    expect(formatPartTimeStaffPhoneInput('01012345')).toBe('010-1234-5');
    expect(formatPartTimeStaffPhoneInput('010 1234 5678')).toBe(
      '010-1234-5678',
    );
  });

  it('10자리는 3-3-4로 나눈다', () => {
    expect(formatPartTimeStaffPhoneInput('0111234567')).toBe('011-123-4567');
  });

  it('11자리를 넘는 입력은 버린다', () => {
    expect(formatPartTimeStaffPhoneInput('010123456789')).toBe('010-1234-5678');
  });
});

describe('isPartTimeStaffPhoneValid', () => {
  it('숫자 10~11자리만 유효하다', () => {
    expect(isPartTimeStaffPhoneValid('')).toBe(false);
    expect(isPartTimeStaffPhoneValid('010-1234-56')).toBe(false);
    expect(isPartTimeStaffPhoneValid('011-123-4567')).toBe(true);
    expect(isPartTimeStaffPhoneValid('010-1234-5678')).toBe(true);
  });

  it('0으로 시작하지 않으면 유효하지 않다', () => {
    expect(isPartTimeStaffPhoneValid('123-4567-890')).toBe(false);
    expect(isPartTimeStaffPhoneValid('101-2345-6789')).toBe(false);
  });
});

describe('formatPartTimeStaffHourlyWageInput', () => {
  it('숫자만 남기고 천 단위 콤마를 넣는다', () => {
    expect(formatPartTimeStaffHourlyWageInput('10320')).toBe('10,320');
    expect(formatPartTimeStaffHourlyWageInput('1,0320원')).toBe('10,320');
    expect(formatPartTimeStaffHourlyWageInput('1234567')).toBe('1,234,567');
  });

  it('앞자리 0은 하나만 남긴다', () => {
    expect(formatPartTimeStaffHourlyWageInput('00')).toBe('0');
    expect(formatPartTimeStaffHourlyWageInput('010320')).toBe('10,320');
  });

  it('숫자가 없으면 빈 값이다', () => {
    expect(formatPartTimeStaffHourlyWageInput('원')).toBe('');
  });
});

describe('toPartTimeStaffFormValues', () => {
  it('상세가 없으면 모두 빈 값이다', () => {
    expect(toPartTimeStaffFormValues()).toEqual({
      name: '',
      birthDate: '',
      gender: '',
      phone: '',
      hourlyWage: '',
      attachments: [],
      memo: '',
    });
  });

  it('상세값을 화면 표시 문자열로 바꾼다', () => {
    const staff: PartTimeStaffDetailItem = {
      id: 3,
      name: '정예은',
      phone: '010-3456-7890',
      createdAt: '2026-09-15',
      birthDate: '2001-02-11',
      gender: 'female',
      hourlyWage: 10_320,
      attachments: [CONTRACT_ATTACHMENT],
      memo: '주말 오픈',
    };

    expect(toPartTimeStaffFormValues(staff)).toEqual({
      name: '정예은',
      birthDate: '2001.02.11',
      gender: 'female',
      phone: '010-3456-7890',
      hourlyWage: '10,320',
      attachments: [SAVED_CONTRACT_ATTACHMENT],
      memo: '주말 오픈',
    });
  });
});

describe('toPartTimeStaffFormPayload', () => {
  it('표시 문자열을 제출 값으로 바꾼다', () => {
    const values: PartTimeStaffFormValues = {
      name: ' 정예은 ',
      birthDate: '2001.02.11',
      gender: 'female',
      phone: '010-3456-7890',
      hourlyWage: '10,320',
      attachments: [],
      memo: '주말 오픈\n',
    };

    expect(toPartTimeStaffFormPayload(values)).toEqual({
      name: '정예은',
      birthDate: '2001-02-11',
      gender: 'female',
      phone: '010-3456-7890',
      hourlyWage: 10_320,
      memo: '주말 오픈\n',
    });
  });

  it('비운 선택 입력은 null로 보낸다', () => {
    const values: PartTimeStaffFormValues = {
      name: '정예은',
      birthDate: '',
      gender: '',
      phone: '010-3456-7890',
      hourlyWage: '',
      attachments: [],
      memo: '',
    };

    expect(toPartTimeStaffFormPayload(values)).toMatchObject({
      birthDate: null,
      gender: null,
      hourlyWage: null,
    });
  });
});

describe('applyPartTimeStaffInputFormat', () => {
  it('끝에 입력하면 구분자가 붙고 커서는 끝에 있다', () => {
    expect(
      applyPartTimeStaffInputFormat(
        {
          value: '010-12345',
          caret: 9,
          previousValue: '010-1234',
        },
        formatPartTimeStaffPhoneInput,
      ),
    ).toEqual({ value: '010-1234-5', caret: 10 });
  });

  it('가운데 숫자를 지우면 커서가 지운 자리에 남는다', () => {
    expect(
      applyPartTimeStaffInputFormat(
        {
          value: '010-124-5678',
          caret: 6,
          previousValue: '010-1234-5678',
          deleteDirection: 'backward',
        },
        formatPartTimeStaffPhoneInput,
      ),
    ).toEqual({ value: '010-124-5678', caret: 6 });
  });

  it('가운데 입력하면 커서가 입력한 숫자 뒤에 있다', () => {
    expect(
      applyPartTimeStaffInputFormat(
        {
          value: '1,0320',
          caret: 3,
          previousValue: '1,320',
        },
        formatPartTimeStaffHourlyWageInput,
      ),
    ).toEqual({ value: '10,320', caret: 2 });
  });

  it('구분자 뒤에서 지우면 구분자 앞 숫자를 지운다', () => {
    expect(
      applyPartTimeStaffInputFormat(
        {
          value: '10320',
          caret: 2,
          previousValue: '10,320',
          deleteDirection: 'backward',
        },
        formatPartTimeStaffHourlyWageInput,
      ),
    ).toEqual({ value: '1,320', caret: 1 });
    expect(
      applyPartTimeStaffInputFormat(
        {
          value: '2001.0211',
          caret: 7,
          previousValue: '2001.02.11',
          deleteDirection: 'backward',
        },
        formatPartTimeStaffBirthDateInput,
      ),
    ).toEqual({ value: '2001.01.1', caret: 6 });
  });

  it('구분자 앞에서 Delete를 누르면 구분자 뒤 숫자를 지우고 커서는 그대로다', () => {
    expect(
      applyPartTimeStaffInputFormat(
        {
          value: '0101234',
          caret: 3,
          previousValue: '010-1234',
          deleteDirection: 'forward',
        },
        formatPartTimeStaffPhoneInput,
      ),
    ).toEqual({ value: '010-234', caret: 3 });
    expect(
      applyPartTimeStaffInputFormat(
        {
          value: '10320',
          caret: 2,
          previousValue: '10,320',
          deleteDirection: 'forward',
        },
        formatPartTimeStaffHourlyWageInput,
      ),
    ).toEqual({ value: '1,020', caret: 3 });
  });

  it('맨 끝에서 Delete를 누르면 값과 커서가 그대로다', () => {
    expect(
      applyPartTimeStaffInputFormat(
        {
          value: '010-1234',
          caret: 8,
          previousValue: '010-1234',
          deleteDirection: 'forward',
        },
        formatPartTimeStaffPhoneInput,
      ),
    ).toEqual({ value: '010-1234', caret: 8 });
  });

  it('맨 앞에서는 커서가 0이다', () => {
    expect(
      applyPartTimeStaffInputFormat(
        {
          value: '',
          caret: 0,
          previousValue: '1',
          deleteDirection: 'backward',
        },
        formatPartTimeStaffHourlyWageInput,
      ),
    ).toEqual({ value: '', caret: 0 });
  });
});

describe('isPartTimeStaffFormChanged', () => {
  const initialValues: PartTimeStaffFormValues = {
    name: '정예은',
    birthDate: '2001.02.11',
    gender: 'female',
    phone: '010-3456-7890',
    hourlyWage: '10,320',
    attachments: [SAVED_CONTRACT_ATTACHMENT],
    memo: '주말 오픈',
  };

  it('첨부파일을 추가하거나 지우면 바뀐 것이다', () => {
    const file = new File(['image'], '보건증.png', { type: 'image/png' });

    expect(
      isPartTimeStaffFormChanged(
        {
          ...initialValues,
          attachments: [
            SAVED_CONTRACT_ATTACHMENT,
            {
              kind: 'new',
              key: 'blob:health-certificate',
              file,
              name: file.name,
              type: 'image',
              url: 'blob:health-certificate',
            },
          ],
        },
        initialValues,
      ),
    ).toBe(true);
    expect(
      isPartTimeStaffFormChanged(
        { ...initialValues, attachments: [] },
        initialValues,
      ),
    ).toBe(true);
  });

  it('첨부파일 목록이 같으면 바뀌지 않은 것이다', () => {
    expect(
      isPartTimeStaffFormChanged(
        { ...initialValues, attachments: [{ ...SAVED_CONTRACT_ATTACHMENT }] },
        initialValues,
      ),
    ).toBe(false);
  });

  it('값이 같으면 바뀌지 않은 것이다', () => {
    expect(
      isPartTimeStaffFormChanged({ ...initialValues }, initialValues),
    ).toBe(false);
  });

  it('이름 앞뒤 공백만 바뀌면 바뀌지 않은 것이다', () => {
    expect(
      isPartTimeStaffFormChanged(
        { ...initialValues, name: ' 정예은 ' },
        initialValues,
      ),
    ).toBe(false);
  });

  it('제출 값이 다르면 바뀐 것이다', () => {
    expect(
      isPartTimeStaffFormChanged(
        { ...initialValues, hourlyWage: '10,330' },
        initialValues,
      ),
    ).toBe(true);
    expect(
      isPartTimeStaffFormChanged(
        { ...initialValues, gender: '' },
        initialValues,
      ),
    ).toBe(true);
  });
});
