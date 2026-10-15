'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useSyncExternalStore } from 'react';

import { staffAttachmentQueryOptions } from '@hooks/api/staff/staffQueryOptions';

const createAttachmentPreviewStore = (blob?: Blob) => {
  let objectUrl: string | undefined;
  return {
    getSnapshot: () => objectUrl,
    subscribe: (onChange: () => void) => {
      if (!blob) return () => {};
      const createdUrl = URL.createObjectURL(blob);
      objectUrl = createdUrl;
      onChange();
      return () => {
        URL.revokeObjectURL(createdUrl);
        objectUrl = undefined;
      };
    },
  };
};

const useStaffAttachmentPreview = (url: string) => {
  const isLocal = url.startsWith('blob:');
  const { data, error, refetch } = useQuery({
    ...staffAttachmentQueryOptions(url),
    enabled: !isLocal,
  });
  const preview = useMemo(() => createAttachmentPreviewStore(data), [data]);
  const previewUrl = useSyncExternalStore(
    preview.subscribe,
    preview.getSnapshot,
    () => undefined,
  );
  return { previewUrl: isLocal ? url : previewUrl, error, refetch };
};

export { useStaffAttachmentPreview };
