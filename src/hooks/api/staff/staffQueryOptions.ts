import { queryOptions } from '@tanstack/react-query';

import {
  getStaffAttachment,
  getStaffDetail,
  getStaffList,
} from '@lib/api/entities/staff/api';
import type { FindAll1Params } from '@lib/api/generated/bizSchedAPI.schemas';
import { retryApiQuery, throwCoreQueryError } from '@lib/api/queryErrorPolicy';

const STAFF_LIST_PAGE_SIZE = 10;

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
    retry: retryApiQuery,
    throwOnError: throwCoreQueryError,
  });

const staffDetailQueryOptions = (staffId: number, options?: RequestInit) =>
  queryOptions({
    queryKey: staffKeys.detail(staffId),
    queryFn: ({ signal }) => getStaffDetail(staffId, { ...options, signal }),
    staleTime: 60_000,
    retry: retryApiQuery,
    throwOnError: throwCoreQueryError,
  });

const staffEditQueryOptions = (staffId: number) =>
  queryOptions({
    ...staffDetailQueryOptions(staffId),
    throwOnError: (error, query) =>
      query.state.data === undefined && throwCoreQueryError(error),
  });

const staffAttachmentQueryOptions = (url: string) =>
  queryOptions({
    queryKey: staffKeys.attachment(url),
    queryFn: ({ signal }) => getStaffAttachment(url, { signal }),
    staleTime: Infinity,
    gcTime: 0,
    retry: retryApiQuery,
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
