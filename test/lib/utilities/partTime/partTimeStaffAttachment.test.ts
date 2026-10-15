import { describe, expect, it } from 'vitest';

import { getPartTimeStaffAttachmentType } from '@lib/utilities/partTime/partTimeStaffAttachment';

describe('getPartTimeStaffAttachmentType', () => {
  it.each([
    ['application/pdf', 'pdf'],
    ['image/jpeg', 'image'],
    ['image/png', 'image'],
    ['Application/PDF; charset=binary', 'pdf'],
  ])('%s만 미리보기 형식으로 변환한다', (mimeType, expected) => {
    expect(getPartTimeStaffAttachmentType(mimeType)).toBe(expected);
  });
  it.each([
    'image/svg+xml',
    'text/html',
    'application/xhtml+xml',
    'image/gif',
    'text/plain',
    'application/octet-stream',
    '',
  ])('%s는 허용하지 않는다', (mimeType) => {
    expect(getPartTimeStaffAttachmentType(mimeType)).toBeUndefined();
  });
});
