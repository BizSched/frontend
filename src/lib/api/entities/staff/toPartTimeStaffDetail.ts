import { match } from 'ts-pattern';
import type { z } from 'zod';

import type { FindById1Response } from '@lib/api/generated/staff/staff.zod';
import type { PartTimeStaffDetailItem } from '@lib/types/partTimeStaff';
import { getPartTimeStaffAttachmentType } from '@lib/utilities/partTime/partTimeStaffAttachment';

const toPartTimeStaffDetail = (
  dto: z.infer<typeof FindById1Response>,
): PartTimeStaffDetailItem => ({
  id: dto.id,
  name: dto.name,
  phone: dto.phone,
  createdAt: dto.createdAt,
  birthDate: dto.birthDate,
  gender: match(dto.gender)
    .with('MALE', () => 'male' as const)
    .with('FEMALE', () => 'female' as const)
    .otherwise(() => null),
  hourlyWage: dto.hourlyWage,
  memo: dto.note,
  attachments: dto.attachments.flatMap((attachment) => {
    const type = getPartTimeStaffAttachmentType(attachment.contentType);
    return type
      ? [
          {
            id: attachment.id,
            name: attachment.fileName,
            type,
            url: attachment.downloadUrl,
          },
        ]
      : [];
  }),
});

export { toPartTimeStaffDetail };
