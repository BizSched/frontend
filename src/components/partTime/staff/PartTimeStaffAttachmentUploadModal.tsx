'use client';

import Image from 'next/image';
import { type ChangeEvent, useRef, useState } from 'react';

import { Button } from '@components/_common/Button/Button';
import { Modal } from '@components/_common/Modal/Modal';

import { cn } from '@lib/utilities/cn';
import { getPartTimeStaffAttachmentType } from '@lib/utilities/partTime/partTimeStaffForm';

import IcDelete from '@assets/icons/ic_delete.svg';
import IcUpload from '@assets/icons/ic_upload.svg';

const ATTACHMENT_ACCEPT = 'application/pdf,image/*';

const FILE_FIELD_CLASS_NAME =
  'flex w-full items-center gap-2 rounded-[16px] border border-dashed border-[#cccccc] bg-[#fafafa] p-4 text-base leading-6 tracking-[-0.02em] max-tablet:rounded-[12px] max-tablet:p-3 max-tablet:text-sm max-tablet:leading-5 max-tablet:tracking-[-0.03em]';

interface PartTimeStaffAttachmentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  onExitComplete?: () => void;
  stackIndex?: number;
}

function PartTimeStaffAttachmentUploadModal({
  open,
  onOpenChange,
  onUpload,
  onExitComplete,
  stackIndex = 0,
}: PartTimeStaffAttachmentUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selectedFile = input.files?.[0];

    input.value = '';

    if (selectedFile && getPartTimeStaffAttachmentType(selectedFile.type)) {
      setFile(selectedFile);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpened) => {
        if (!isOpened) {
          onExitComplete?.();
        }
      }}
      stackIndex={stackIndex}
    >
      <Modal.Panel
        size="sm"
        className="max-tablet:rounded-[24px] max-tablet:p-4"
      >
        <div className="flex flex-col gap-8 max-tablet:gap-6">
          <Modal.Header align="start">
            <Modal.Title className="leading-7.5 text-[#262626] max-tablet:text-base max-tablet:leading-6">
              첨부파일 업로드
            </Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <input
            ref={inputRef}
            type="file"
            accept={ATTACHMENT_ACCEPT}
            hidden
            onChange={handleFileChange}
          />
          {file ? (
            <div className={FILE_FIELD_CLASS_NAME}>
              <Image
                src={IcUpload}
                alt=""
                width={24}
                height={24}
                className="shrink-0 max-tablet:size-5"
                unoptimized
              />
              <span className="min-w-0 flex-1 truncate text-[#0d0b0a]">
                {file.name}
              </span>
              <button
                type="button"
                aria-label={`${file.name} 선택 취소`}
                onClick={() => setFile(undefined)}
                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring max-tablet:size-5"
              >
                <Image src={IcDelete} alt="" width={9} height={9} unoptimized />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                FILE_FIELD_CLASS_NAME,
                'cursor-pointer text-[#737373] outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <Image
                src={IcUpload}
                alt=""
                width={24}
                height={24}
                className="shrink-0 max-tablet:size-5"
                unoptimized
              />
              파일을 선택해주세요
            </button>
          )}
        </div>
        <Button
          type="button"
          disabled={!file}
          focusableWhenDisabled
          onClick={() => {
            if (file) {
              onUpload(file);
            }
          }}
          className="w-full max-tablet:h-10 max-tablet:py-2.5 max-tablet:text-sm max-tablet:leading-5 data-disabled:cursor-not-allowed data-disabled:bg-[#bbbbbb] data-disabled:hover:bg-[#bbbbbb]"
        >
          업로드
        </Button>
      </Modal.Panel>
    </Modal>
  );
}

export { PartTimeStaffAttachmentUploadModal };
export type { PartTimeStaffAttachmentUploadModalProps };
