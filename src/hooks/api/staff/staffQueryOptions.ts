import { queryOptions } from '@tanstack/react-query';
import { match, P } from 'ts-pattern';

import { ApiError } from '@lib/api/apiError';
import {
  getStaffAttachment,
  getStaffDetail,
  getStaffList,
} from '@lib/api/entities/staff/api';
import type { FindAll1Params } from '@lib/api/generated/bizSchedAPI.schemas';

const STAFF_LIST_PAGE_SIZE = 10;

const retryStaffQuery = (failureCount: number, error: unknown) =>
  match(error)
    .with(P.instanceOf(ApiError), () => false)
    .otherwise(() => failureCount < 3);

const throwStaffQueryError = (error: unknown) =>
  match(error)
    .with(P.instanceOf(ApiError), ({ status }) => status === 403)
    .otherwise(() => true);

const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (params?: FindAll1Params) => [...staffKeys.lists(), params] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (staffId: number) => [...staffKeys.details(), staffId] as const,
  attachments: () => [...staffKeys.all, 'attachment'] as const,
  attachment: (url: string) => [...staffKeys.attachments(), url] as const,
};

const staffListQueryOptions = (
  params?: FindAll1Params,
  options?: RequestInit,
) =>
  queryOptions({
    queryKey: staffKeys.list(params),
    queryFn: ({ signal }) => getStaffList(params, { ...options, signal }),
    staleTime: 60_000,
    retry: retryStaffQuery,
    throwOnError: throwStaffQueryError,
  });

const staffDetailQueryOptions = (staffId: number, options?: RequestInit) =>
  queryOptions({
    queryKey: staffKeys.detail(staffId),
    queryFn: ({ signal }) => getStaffDetail(staffId, { ...options, signal }),
    staleTime: 60_000,
    retry: retryStaffQuery,
    throwOnError: throwStaffQueryError,
  });

const staffEditQueryOptions = (staffId: number) =>
  queryOptions({
    ...staffDetailQueryOptions(staffId),
    throwOnError: (error, query) =>
      query.state.data === undefined && throwStaffQueryError(error),
  });

const staffAttachmentQueryOptions = (url: string) =>
  queryOptions({
    queryKey: staffKeys.attachment(url),
    queryFn: ({ signal }) => getStaffAttachment(url, { signal }),
    staleTime: Infinity,
    gcTime: 0,
    retry: retryStaffQuery,
    throwOnError: false,
    refetchOnWindowFocus: false,
  });

export {
  STAFF_LIST_PAGE_SIZE,
  staffKeys,
  staffListQueryOptions,
  staffDetailQueryOptions,
  staffEditQueryOptions,
  staffAttachmentQueryOptions,
};
