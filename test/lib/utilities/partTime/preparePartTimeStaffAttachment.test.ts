import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PART_TIME_STAFF_ATTACHMENT_MAX_BYTES } from '@lib/utilities/partTime/partTimeStaffAttachment';
import { preparePartTimeStaffAttachment } from '@lib/utilities/partTime/preparePartTimeStaffAttachment';

const decode = vi.fn();
const drawImage = vi.fn();
const fillRect = vi.fn();
const toBlob = vi.fn();
let dimensions = { width: 4000, height: 3000 };
let canvasSize: number[];

beforeEach(() => {
  dimensions = { width: 4000, height: 3000 };
  canvasSize = [];
  decode.mockResolvedValue(undefined);
  vi.stubGlobal(
    'Image',
    class {
      src = '';
      naturalWidth = dimensions.width;
      naturalHeight = dimensions.height;
      decode = decode;
    },
  );
  vi.stubGlobal(
    'URL',
    Object.assign(class extends URL {}, {
      createObjectURL: vi.fn(() => 'blob:source'),
      revokeObjectURL: vi.fn(),
    }),
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
    fillRect,
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D);
  toBlob.mockImplementation(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
  ) {
    canvasSize = [this.width, this.height];
    callback(new Blob(['webp'], { type: 'image/webp' }));
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(toBlob);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('preparePartTimeStaffAttachment', () => {
  it('이미지를 2000px 이하로 줄이고 실제 WebP와 확장자를 반환한다', async () => {
    const file = new File(['png'], '보건증.png', {
      type: 'image/png',
      lastModified: 123,
    });
    const result = await preparePartTimeStaffAttachment(file);
    expect(canvasSize).toEqual([2000, 1500]);
    expect(toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/webp',
      0.8,
    );
    expect(fillRect).not.toHaveBeenCalled();
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 2000, 1500);
    expect(result).toMatchObject({
      name: '보건증.webp',
      type: 'image/webp',
      lastModified: 123,
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:source');
  });

  it('작은 이미지는 확대하지 않고 세로 이미지도 비율을 유지한다', async () => {
    dimensions = { width: 600, height: 1000 };
    await preparePartTimeStaffAttachment(
      new File(['jpeg'], '사진.jpg', { type: 'image/jpeg' }),
    );
    expect(canvasSize).toEqual([600, 1000]);
    dimensions = { width: 3000, height: 6000 };
    await preparePartTimeStaffAttachment(
      new File(['jpeg'], '사진.jpg', { type: 'image/jpeg' }),
    );
    expect(canvasSize).toEqual([1000, 2000]);
  });

  it('WebP 입력도 크기와 품질을 맞춰 다시 인코딩한다', async () => {
    await expect(
      preparePartTimeStaffAttachment(
        new File(['original webp'], '사진.webp', { type: 'image/webp' }),
      ),
    ).resolves.toMatchObject({ name: '사진.webp', type: 'image/webp' });
    expect(decode).toHaveBeenCalledTimes(1);
    expect(toBlob).toHaveBeenCalledTimes(1);
  });

  it.each([null, 'image/png', 'image/jpeg'])(
    'WebP 요청 결과가 %s이면 JPEG로 다시 인코딩하고 확장자를 맞춘다',
    async (returnedType) => {
      toBlob
        .mockImplementationOnce((callback: BlobCallback) =>
          callback(
            returnedType
              ? new Blob(['fallback'], { type: returnedType })
              : null,
          ),
        )
        .mockImplementationOnce((callback: BlobCallback) =>
          callback(new Blob(['jpeg'], { type: 'image/jpeg' })),
        );
      await expect(
        preparePartTimeStaffAttachment(
          new File(['png'], '사진.png', { type: 'image/png' }),
        ),
      ).resolves.toMatchObject({ name: '사진.jpg', type: 'image/jpeg' });
      expect(toBlob).toHaveBeenNthCalledWith(
        1,
        expect.any(Function),
        'image/webp',
        0.8,
      );
      expect(toBlob).toHaveBeenNthCalledWith(
        2,
        expect.any(Function),
        'image/jpeg',
        0.8,
      );
      expect(fillRect).toHaveBeenCalledWith(0, 0, 2000, 1500);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:source');
    },
  );

  it('JPEG 대체 처리 결과도 크기 제한을 적용한다', async () => {
    toBlob
      .mockImplementationOnce((callback: BlobCallback) =>
        callback(new Blob(['png'], { type: 'image/png' })),
      )
      .mockImplementationOnce((callback: BlobCallback) =>
        callback(
          new Blob([new Uint8Array(PART_TIME_STAFF_ATTACHMENT_MAX_BYTES + 1)], {
            type: 'image/jpeg',
          }),
        ),
      );
    await expect(
      preparePartTimeStaffAttachment(
        new File(['png'], '사진.png', { type: 'image/png' }),
      ),
    ).rejects.toThrow('3.5MB');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:source');
  });

  it('브라우저가 디코딩할 수 있는 HEIC도 WebP로 변환한다', async () => {
    await expect(
      preparePartTimeStaffAttachment(
        new File(['heic'], '사진.heic', { type: 'image/heic' }),
      ),
    ).resolves.toMatchObject({ name: '사진.webp', type: 'image/webp' });
  });

  it('PDF는 변환하지 않고 3.5MB 경계까지 허용한다', async () => {
    const file = new File(
      [new Uint8Array(PART_TIME_STAFF_ATTACHMENT_MAX_BYTES)],
      '서류.pdf',
      { type: 'application/pdf' },
    );
    await expect(preparePartTimeStaffAttachment(file)).resolves.toBe(file);
    await expect(
      preparePartTimeStaffAttachment(
        new File([file, 'x'], '서류.pdf', { type: 'application/pdf' }),
      ),
    ).rejects.toThrow('3.5MB 이하 파일만 올릴 수 있어요.');
    expect(decode).not.toHaveBeenCalled();
  });

  it.each(['image/svg+xml', 'text/plain', 'application/msword'])(
    '받지 않는 형식 %s는 처리하지 않는다',
    async (type) => {
      await expect(
        preparePartTimeStaffAttachment(
          new File(['file'], '파일.bin', { type }),
        ),
      ).resolves.toBeUndefined();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    },
  );

  it('디코딩 실패나 잘못된 변환 결과는 거부하고 URL을 해제한다', async () => {
    const file = new File(['heic'], '사진.heic', { type: 'image/heic' });
    decode.mockRejectedValueOnce(new Error('decode'));
    await expect(preparePartTimeStaffAttachment(file)).rejects.toThrow(
      '이미지를 처리할 수 없어요.',
    );
    toBlob.mockImplementationOnce((callback: BlobCallback) => callback(null));
    toBlob.mockImplementationOnce((callback: BlobCallback) => callback(null));
    await expect(preparePartTimeStaffAttachment(file)).rejects.toThrow(
      '이미지를 처리할 수 없어요.',
    );
    toBlob.mockImplementationOnce((callback: BlobCallback) =>
      callback(new Blob(['png'], { type: 'image/png' })),
    );
    toBlob.mockImplementationOnce((callback: BlobCallback) =>
      callback(new Blob(['png'], { type: 'image/png' })),
    );
    await expect(preparePartTimeStaffAttachment(file)).rejects.toThrow(
      '이미지를 처리할 수 없어요.',
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3);
  });

  it('압축 후에도 요청 크기를 넘으면 거부한다', async () => {
    toBlob.mockImplementationOnce((callback: BlobCallback) =>
      callback(
        new Blob([new Uint8Array(PART_TIME_STAFF_ATTACHMENT_MAX_BYTES + 1)], {
          type: 'image/webp',
        }),
      ),
    );
    await expect(
      preparePartTimeStaffAttachment(
        new File(['png'], '사진.png', { type: 'image/png' }),
      ),
    ).rejects.toThrow('3.5MB');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:source');
  });
});
