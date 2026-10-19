import {
  PART_TIME_STAFF_ATTACHMENT_MAX_BYTES,
  PART_TIME_STAFF_ATTACHMENT_SIZE_MESSAGE,
  getPartTimeStaffAttachmentType,
} from '@lib/utilities/partTime/partTimeStaffAttachment';

const IMAGE_MAX_DIMENSION = 2000;
const IMAGE_QUALITY = 0.8;
const IMAGE_PROCESSING_MESSAGE =
  '이미지를 처리할 수 없어요. 다른 파일을 선택해주세요.';

const preparePartTimeStaffAttachment = async (
  file: File,
): Promise<File | undefined> => {
  const type = getPartTimeStaffAttachmentType(file.type);
  const isHeic =
    /^image\/hei[cf](?:-sequence)?$/i.test(file.type) ||
    (!file.type && /\.hei[cf]$/i.test(file.name));
  if (!type && !isHeic) return undefined;

  if (type === 'pdf') {
    if (!/\.pdf$/i.test(file.name)) return undefined;
    if (file.size > PART_TIME_STAFF_ATTACHMENT_MAX_BYTES) {
      throw new Error(PART_TIME_STAFF_ATTACHMENT_SIZE_MESSAGE);
    }
    return file;
  }

  const url = URL.createObjectURL(file);
  const image = new Image();
  const canvas = document.createElement('canvas');
  try {
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error();
    const scale = Math.min(
      1,
      IMAGE_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
    );
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error();
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const encode = (mimeType: string) =>
      new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mimeType, IMAGE_QUALITY),
      );
    let blob = await encode('image/webp');
    if (blob?.type !== 'image/webp') {
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'source-over';
      blob = await encode('image/jpeg');
      if (blob?.type !== 'image/jpeg') throw new Error();
    }
    if (blob.size > PART_TIME_STAFF_ATTACHMENT_MAX_BYTES) {
      throw new Error(PART_TIME_STAFF_ATTACHMENT_SIZE_MESSAGE);
    }
    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const name = `${file.name.replace(/\.[^.]*$/, '') || 'attachment'}.${extension}`;
    return new File([blob], name, {
      type: blob.type,
      lastModified: file.lastModified,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === PART_TIME_STAFF_ATTACHMENT_SIZE_MESSAGE
    )
      throw error;
    throw new Error(IMAGE_PROCESSING_MESSAGE, { cause: error });
  } finally {
    URL.revokeObjectURL(url);
    image.src = '';
    canvas.width = 0;
    canvas.height = 0;
  }
};

export { preparePartTimeStaffAttachment };
