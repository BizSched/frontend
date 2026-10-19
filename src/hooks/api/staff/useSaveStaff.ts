'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { isMatching, P } from 'ts-pattern';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';
import type {
  StaffSaveAttempt,
  StaffSaveProgress,
  StaffSaveResult,
  StaffSaveReview,
} from '@hooks/types/staffMutation';

import { ApiError } from '@lib/api/apiError';
import {
  createStaff,
  deleteStaffAttachment,
  getStaffDetail,
  updateStaff,
  uploadStaffAttachment,
} from '@lib/api/entities/staff/api';
import {
  toStaffCreateRequest,
  toStaffUpdateRequest,
} from '@lib/api/entities/staff/toStaffRequest';
import type {
  PartTimeStaffDetailItem,
  PartTimeStaffFormPayload,
  PartTimeStaffFormValues,
} from '@lib/types/partTimeStaff';
import {
  PART_TIME_STAFF_ATTACHMENT_COUNT_MESSAGE,
  PART_TIME_STAFF_ATTACHMENT_MAX_COUNT,
} from '@lib/utilities/partTime/partTimeStaffAttachment';
import {
  PART_TIME_STAFF_UNSUPPORTED_CLEAR_MESSAGE,
  hasPartTimeStaffUnsupportedClear,
  toPartTimeStaffFormPayload,
  toPartTimeStaffFormValues,
} from '@lib/utilities/partTime/partTimeStaffForm';

import { staffKeys } from './staffQueryOptions';

const toSavedPayload = (staff: PartTimeStaffDetailItem) =>
  toPartTimeStaffFormPayload(toPartTimeStaffFormValues(staff));

const isNotFoundError = (error: unknown) =>
  isMatching(P.intersection(P.instanceOf(ApiError), { status: 404 }), error);

const getRemovedAttachments = (
  staff: PartTimeStaffDetailItem,
  { uploadedAttachments, initialAttachmentIds }: StaffSaveProgress,
  values: PartTimeStaffFormValues,
) => {
  const retainedIds = new Set(
    values.attachments.flatMap((attachment) => {
      if (attachment.kind === 'saved') return [attachment.id];
      const uploaded = uploadedAttachments.get(attachment.key);
      return uploaded ? [uploaded.id] : [];
    }),
  );
  const removableIds = new Set([
    ...initialAttachmentIds,
    ...Array.from(uploadedAttachments.values(), ({ id }) => id),
  ]);
  return staff.attachments.filter(
    ({ id }) => !retainedIds.has(id) && removableIds.has(id),
  );
};

// NOTE: 요청마다 파일 하나만 올리므로 새 ID가 하나면 그 첨부로 본다. BE가 파일명을 바꿔도 찾을 수 있다.
const findUploadedAttachment = (
  previous: PartTimeStaffDetailItem,
  updated: PartTimeStaffDetailItem,
) => {
  const previousIds = new Set(previous.attachments.map(({ id }) => id));
  const added = updated.attachments.filter(({ id }) => !previousIds.has(id));
  return added.length === 1 ? added[0] : undefined;
};

const useSaveStaff = (staff?: PartTimeStaffDetailItem) => {
  const queryClient = useQueryClient();
  const isCreate = staff === undefined;
  const progress = useRef<StaffSaveProgress>({
    staff,
    uploadedAttachments: new Map(),
    initialAttachmentIds: new Set(staff?.attachments.map(({ id }) => id)),
  });
  const running = useRef<Promise<StaffSaveResult> | undefined>(undefined);
  const [review, setReview] = useState<StaffSaveReview | null>(null);

  // NOTE: 재제출 차단은 렌더 시점과 무관하게 ref로 판단하고, state는 화면 표시에만 쓴다.
  const requestReview = () => {
    progress.current.requiresReview = true;
    setReview({ staffId: progress.current.staff?.id });
  };

  const setSavedStaff = (next: PartTimeStaffDetailItem) => {
    progress.current.staff = next;
    return next;
  };

  // NOTE: 비멱등 요청이 ApiError 없이 실패하면 서버 반영 여부를 알 수 없어 재제출을 막는다.
  const runUncertain = async <T>(request: () => Promise<T>) => {
    try {
      return await request();
    } catch (error) {
      if (!isMatching(P.instanceOf(ApiError), error)) requestReview();
      throw error;
    }
  };

  const deleteRemovedAttachments = async (
    saved: PartTimeStaffDetailItem,
    values: PartTimeStaffFormValues,
    attempt: StaffSaveAttempt,
  ) => {
    const current = progress.current;
    let next = saved;
    for (const attachment of getRemovedAttachments(saved, current, values)) {
      attempt.hasRequested = true;
      try {
        await deleteStaffAttachment(saved.id, attachment.id);
      } catch (error) {
        if (!isNotFoundError(error)) throw error;
      }
      next = setSavedStaff({
        ...next,
        attachments: next.attachments.filter(({ id }) => id !== attachment.id),
      });
      for (const [key, uploaded] of current.uploadedAttachments) {
        if (uploaded.id === attachment.id)
          current.uploadedAttachments.delete(key);
      }
      queryClient.removeQueries({
        queryKey: staffKeys.attachment(attachment.url),
      });
    }
    return next;
  };

  const saveStaffInfo = async (
    saved: PartTimeStaffDetailItem | undefined,
    payload: PartTimeStaffFormPayload,
    attempt: StaffSaveAttempt,
  ) => {
    if (!saved) {
      attempt.hasRequested = true;
      return setSavedStaff(
        await runUncertain(() => createStaff(toStaffCreateRequest(payload))),
      );
    }
    const body = toStaffUpdateRequest(payload, toSavedPayload(saved));
    if (!Object.keys(body).length) return saved;
    attempt.hasRequested = true;
    attempt.hasRequestedNameChange = body.name !== undefined;
    try {
      return setSavedStaff(await updateStaff(saved.id, body));
    } catch (error) {
      if (!isMatching(P.instanceOf(ApiError), error))
        progress.current.hasUncertainInfoUpdate = true;
      throw error;
    }
  };

  const uploadNewAttachments = async (
    saved: PartTimeStaffDetailItem,
    values: PartTimeStaffFormValues,
    attempt: StaffSaveAttempt,
  ) => {
    const current = progress.current;
    let next = saved;
    for (const attachment of values.attachments) {
      if (
        attachment.kind !== 'new' ||
        current.uploadedAttachments.has(attachment.key)
      )
        continue;
      attempt.hasRequested = true;
      const updated = await runUncertain(() =>
        uploadStaffAttachment(saved.id, attachment.file),
      );
      const uploaded = findUploadedAttachment(next, updated);
      next = setSavedStaff(updated);
      if (!uploaded) {
        requestReview();
        throw new Error('업로드한 첨부파일 정보를 확인할 수 없어요.');
      }
      current.uploadedAttachments.set(attachment.key, uploaded);
    }
    return next;
  };

  const syncStaffCache = async (
    saved: PartTimeStaffDetailItem | undefined,
    hasChanges: boolean,
    attempt: StaffSaveAttempt,
  ) => {
    void queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    if (!saved) return;
    const detailKey = staffKeys.detail(saved.id);
    await queryClient.cancelQueries({ queryKey: detailKey });
    if (hasChanges) queryClient.setQueryData(detailKey, saved);
    void queryClient.invalidateQueries({ queryKey: detailKey });
    if (attempt.hasRequestedNameChange)
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
  };

  const save = async (
    values: PartTimeStaffFormValues,
  ): Promise<StaffSaveResult> => {
    const current = progress.current;
    if (current.requiresReview)
      throw new Error('저장된 내용을 먼저 확인해주세요.');
    if (values.attachments.length > PART_TIME_STAFF_ATTACHMENT_MAX_COUNT)
      throw new Error(PART_TIME_STAFF_ATTACHMENT_COUNT_MESSAGE);
    const initialStaff = current.staff;
    const attempt: StaffSaveAttempt = {
      hasRequested: false,
      hasRequestedNameChange: false,
    };
    try {
      let saved = initialStaff;
      if (saved && current.hasUncertainInfoUpdate) {
        attempt.hasRequested = true;
        saved = setSavedStaff(await getStaffDetail(saved.id));
        current.hasUncertainInfoUpdate = false;
      }
      if (
        saved &&
        hasPartTimeStaffUnsupportedClear(
          values,
          toPartTimeStaffFormValues(saved),
        )
      )
        throw new Error(PART_TIME_STAFF_UNSUPPORTED_CLEAR_MESSAGE);
      if (saved) saved = await deleteRemovedAttachments(saved, values, attempt);
      saved = await saveStaffInfo(
        saved,
        toPartTimeStaffFormPayload(values),
        attempt,
      );
      saved = await uploadNewAttachments(saved, values, attempt);
      return { staff: saved, isComplete: true };
    } catch (error) {
      if (isCreate && current.staff)
        return { staff: current.staff, isComplete: false, error };
      throw error;
    } finally {
      if (attempt.hasRequested)
        await syncStaffCache(
          current.staff,
          current.staff !== initialStaff,
          attempt,
        );
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: (values: PartTimeStaffFormValues) => {
      if (!running.current) {
        running.current = save(values).finally(() => {
          running.current = undefined;
        });
      }
      return running.current;
    },
  });
  return {
    ...mutation,
    requiresReview: review !== null,
    reviewStaffId: review?.staffId,
  };
};

export { useSaveStaff };
