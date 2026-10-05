import type {
  PartTimeStaffAttachment,
  PartTimeStaffAttachmentType,
  PartTimeStaffDetailItem,
  PartTimeStaffFormAttachment,
  PartTimeStaffFormattedInput,
  PartTimeStaffFormattedInputChange,
  PartTimeStaffFormNewAttachment,
  PartTimeStaffFormPayload,
  PartTimeStaffFormSavedAttachment,
  PartTimeStaffFormValues,
  PartTimeStaffMemoLength,
} from '@lib/types/partTimeStaff';

const PART_TIME_STAFF_NAME_MAX_LENGTH = 30;

const BIRTH_DATE_DIGIT_LENGTH = 8;
const PHONE_MAX_DIGIT_LENGTH = 11;
const PHONE_MIN_DIGIT_LENGTH = 10;

const EMPTY_FORM_VALUES: PartTimeStaffFormValues = {
  name: '',
  birthDate: '',
  gender: '',
  phone: '',
  hourlyWage: '',
  attachments: [],
  memo: '',
};

const toDigits = (value: string) => value.replace(/\D/g, '');

const toPartTimeStaffBirthDate = (value: string) => value.replaceAll('.', '-');

const getCaretAfterDigits = (value: string, digitCount: number) => {
  if (digitCount <= 0) {
    return 0;
  }

  let count = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      count += 1;
    }

    if (count === digitCount) {
      return index + 1;
    }
  }

  return value.length;
};

const applyPartTimeStaffInputFormat = (
  {
    value,
    caret,
    previousValue,
    deleteDirection,
  }: PartTimeStaffFormattedInputChange,
  format: (value: string) => string,
): PartTimeStaffFormattedInput => {
  let digits = toDigits(value);
  let digitsBeforeCaret = toDigits(value.slice(0, caret)).length;
  let formattedValue = format(digits);
  const isSeparatorDeleted = formattedValue === previousValue;

  if (
    isSeparatorDeleted &&
    deleteDirection === 'backward' &&
    digitsBeforeCaret > 0
  ) {
    digits =
      digits.slice(0, digitsBeforeCaret - 1) + digits.slice(digitsBeforeCaret);
    digitsBeforeCaret -= 1;
    formattedValue = format(digits);
  }

  if (
    isSeparatorDeleted &&
    deleteDirection === 'forward' &&
    digitsBeforeCaret < digits.length
  ) {
    digits =
      digits.slice(0, digitsBeforeCaret) + digits.slice(digitsBeforeCaret + 1);
    formattedValue = format(digits);
  }

  return {
    value: formattedValue,
    caret: getCaretAfterDigits(formattedValue, digitsBeforeCaret),
  };
};

const countPartTimeStaffCharacters = (value: string) =>
  Array.from(value).length;

const countPartTimeStaffMemoLength = (
  memo: string,
): PartTimeStaffMemoLength => ({
  withSpaces: countPartTimeStaffCharacters(memo),
  withoutSpaces: countPartTimeStaffCharacters(memo.replace(/\s/g, '')),
});

const limitPartTimeStaffName = (value: string) =>
  Array.from(value).slice(0, PART_TIME_STAFF_NAME_MAX_LENGTH).join('');

const isPartTimeStaffNameValid = (value: string) => {
  const trimmedLength = countPartTimeStaffCharacters(value.trim());

  return (
    trimmedLength > 0 &&
    countPartTimeStaffCharacters(value) <= PART_TIME_STAFF_NAME_MAX_LENGTH
  );
};

const formatPartTimeStaffBirthDateInput = (value: string) => {
  const digits = toDigits(value).slice(0, BIRTH_DATE_DIGIT_LENGTH);

  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6)]
    .filter(Boolean)
    .join('.');
};

const isPartTimeStaffBirthDateValid = (value: string, today: string) => {
  if (!value) {
    return true;
  }

  const digits = toDigits(value);

  if (digits.length !== BIRTH_DATE_DIGIT_LENGTH) {
    return false;
  }

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6));
  const date = new Date(Date.UTC(year, month - 1, day));
  const isExistingDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isExistingDate && toPartTimeStaffBirthDate(value) < today;
};

const formatPartTimeStaffPhoneInput = (value: string) => {
  const digits = toDigits(value).slice(0, PHONE_MAX_DIGIT_LENGTH);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length === PHONE_MIN_DIGIT_LENGTH) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const isPartTimeStaffPhoneValid = (value: string) => {
  const digits = toDigits(value);
  const digitLength = digits.length;

  return (
    digits.startsWith('0') &&
    digitLength >= PHONE_MIN_DIGIT_LENGTH &&
    digitLength <= PHONE_MAX_DIGIT_LENGTH
  );
};

const formatPartTimeStaffHourlyWageInput = (value: string) =>
  toDigits(value)
    .replace(/^0+(?=\d)/, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const getPartTimeStaffAttachmentType = (
  mimeType: string,
): PartTimeStaffAttachmentType | undefined => {
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }

  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  return undefined;
};

const toPartTimeStaffFormSavedAttachment = (
  attachment: PartTimeStaffAttachment,
): PartTimeStaffFormSavedAttachment => ({
  ...attachment,
  kind: 'saved',
  key: `saved-${attachment.id}`,
});

const createPartTimeStaffFormNewAttachment = (
  file: File,
  url: string,
): PartTimeStaffFormNewAttachment | undefined => {
  const type = getPartTimeStaffAttachmentType(file.type);

  if (!type) {
    return undefined;
  }

  return { kind: 'new', key: url, file, name: file.name, type, url };
};

const isPartTimeStaffAttachmentsChanged = (
  attachments: PartTimeStaffFormAttachment[],
  initialAttachments: PartTimeStaffFormAttachment[],
) =>
  attachments.length !== initialAttachments.length ||
  attachments.some(
    (attachment, index) => attachment.key !== initialAttachments[index].key,
  );

const toPartTimeStaffFormValues = (
  staff?: PartTimeStaffDetailItem,
): PartTimeStaffFormValues => {
  if (!staff) {
    return EMPTY_FORM_VALUES;
  }

  return {
    name: staff.name,
    birthDate: formatPartTimeStaffBirthDateInput(staff.birthDate.slice(0, 10)),
    gender: staff.gender,
    phone: formatPartTimeStaffPhoneInput(staff.phone),
    hourlyWage: formatPartTimeStaffHourlyWageInput(String(staff.hourlyWage)),
    attachments: staff.attachments.map(toPartTimeStaffFormSavedAttachment),
    memo: staff.memo,
  };
};

const toPartTimeStaffFormPayload = ({
  name,
  birthDate,
  gender,
  phone,
  hourlyWage,
  memo,
}: PartTimeStaffFormValues): PartTimeStaffFormPayload => ({
  name: name.trim(),
  birthDate: birthDate ? toPartTimeStaffBirthDate(birthDate) : null,
  gender: gender || null,
  phone,
  hourlyWage: hourlyWage ? Number(toDigits(hourlyWage)) : null,
  memo,
});

const isPartTimeStaffFormChanged = (
  values: PartTimeStaffFormValues,
  initialValues: PartTimeStaffFormValues,
) => {
  const payload = toPartTimeStaffFormPayload(values);
  const initialPayload = toPartTimeStaffFormPayload(initialValues);

  return (
    (Object.keys(payload) as (keyof PartTimeStaffFormPayload)[]).some(
      (key) => payload[key] !== initialPayload[key],
    ) ||
    isPartTimeStaffAttachmentsChanged(
      values.attachments,
      initialValues.attachments,
    )
  );
};

export {
  PART_TIME_STAFF_NAME_MAX_LENGTH,
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
};
