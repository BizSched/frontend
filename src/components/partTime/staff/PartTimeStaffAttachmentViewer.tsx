import { cva } from 'class-variance-authority';
import Image from 'next/image';
import { useId } from 'react';

import { buttonVariants } from '@components/_common/Button/Button';

import { useStaffAttachmentPreview } from '@hooks/api/staff/useStaffAttachmentPreview';

import { formatCommonError } from '@lib/api/formatCommonError';
import type { PartTimeStaffAttachmentPreview } from '@lib/types/partTimeStaff';

import IcChevronLeftDark from '@assets/icons/ic_chevron-left-dark.svg';

const attachmentViewerVariants = cva(
  'relative shrink-0 border-[#ddd] bg-[#fafafa] max-laptop:border-t laptop:min-w-0 laptop:shrink',
  {
    variants: {
      collapsed: {
        true: 'laptop:w-0',
        false: 'laptop:w-183.5 laptop:border-l',
      },
    },
  },
);

const attachmentViewerToggleIconVariants = cva(
  'shrink-0 motion-safe:transition-transform max-tablet:size-5',
  {
    variants: {
      collapsed: {
        true: 'max-laptop:rotate-90',
        false: 'max-laptop:-rotate-90 laptop:rotate-180',
      },
    },
  },
);

interface PartTimeStaffAttachmentViewerProps {
  attachment: PartTimeStaffAttachmentPreview;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

function PartTimeStaffAttachmentViewer({
  attachment,
  isCollapsed,
  onCollapsedChange,
}: PartTimeStaffAttachmentViewerProps) {
  const contentId = useId();
  const { name, type, url } = attachment;
  const { previewUrl, error, refetch } = useStaffAttachmentPreview(url);

  return (
    <section
      aria-label={`${name} 미리보기`}
      className={attachmentViewerVariants({ collapsed: isCollapsed })}
    >
      <button
        type="button"
        aria-label={
          isCollapsed ? '첨부파일 미리보기 펼치기' : '첨부파일 미리보기 접기'
        }
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
        onClick={() => onCollapsedChange(!isCollapsed)}
        className="absolute flex cursor-pointer items-center justify-center border border-[#ddd] bg-[#fafafa] outline-none focus-visible:ring-2 focus-visible:ring-ring max-laptop:right-5 max-laptop:bottom-full max-laptop:h-9.5 max-laptop:w-15 max-laptop:rounded-t-[16px] max-laptop:border-b-0 max-tablet:h-7 max-tablet:w-10.25 max-tablet:rounded-t-[12px] laptop:top-29 laptop:right-full laptop:h-15 laptop:w-9.5 laptop:rounded-l-[16px] laptop:border-r-0"
      >
        <Image
          src={IcChevronLeftDark}
          alt=""
          width={24}
          height={24}
          className={attachmentViewerToggleIconVariants({
            collapsed: isCollapsed,
          })}
          unoptimized
        />
      </button>
      <div
        id={contentId}
        hidden={isCollapsed}
        className="flex size-full flex-col p-10 max-laptop:h-[417px] max-tablet:h-57.5 max-tablet:p-4"
      >
        <div className="mb-4 flex min-h-11 items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm text-slate-600">{name}</p>
          {previewUrl && !error && (
            <a
              href={previewUrl}
              download={name}
              className={buttonVariants({
                hierarchy: 'tertiary',
                size: 'small',
              })}
            >
              다운로드
            </a>
          )}
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          {error ? (
            <div role="alert" className="text-center text-sm text-slate-500">
              <p>{formatCommonError(error)}</p>
              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                className="mt-2 cursor-pointer underline"
              >
                다시 시도
              </button>
            </div>
          ) : !previewUrl ? (
            <p role="status" className="text-sm text-slate-500">
              첨부파일을 불러오는 중입니다.
            </p>
          ) : type === 'pdf' ? (
            <iframe
              src={previewUrl}
              title={name}
              className="size-full border border-[#ccc] bg-white"
            />
          ) : (
            <Image
              src={previewUrl}
              alt={name}
              width={0}
              height={0}
              className="h-auto max-h-full w-auto max-w-full border border-[#ccc] object-contain"
              unoptimized
            />
          )}
        </div>
      </div>
    </section>
  );
}

export { PartTimeStaffAttachmentViewer };
export type { PartTimeStaffAttachmentViewerProps };
