import { domToBlob } from 'modern-screenshot';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CAPTURE_EXCLUDE_PROPS,
  CAPTURE_EXPAND_PROPS,
} from '@lib/utilities/capture/captureAttributes';
import { captureElementImage } from '@lib/utilities/capture/captureElementImage';
import { getUsedFontCssText } from '@lib/utilities/capture/getUsedFontCssText';

vi.mock('modern-screenshot', () => ({ domToBlob: vi.fn() }));
vi.mock('@lib/utilities/capture/getUsedFontCssText', () => ({
  getUsedFontCssText: vi.fn(),
}));

afterEach(() => {
  document.body.replaceChildren();
  vi.resetAllMocks();
});

const getCapturedFrame = () => {
  const frame: unknown = vi.mocked(domToBlob).mock.calls[0][0];
  if (!(frame instanceof HTMLElement)) {
    throw new Error('캡처 대상은 HTML 요소여야 합니다.');
  }
  return frame;
};

describe('captureElementImage', () => {
  it('라이브러리 로딩 전에 화면을 복제해 저장 중 원본 변경이 이미지에 섞이지 않는다', async () => {
    const blob = new Blob(['png'], { type: 'image/png' });
    const element = document.createElement('div');
    element.textContent = '2026-10-15 전체';
    document.body.append(element);
    vi.mocked(getUsedFontCssText).mockResolvedValue('');
    vi.mocked(domToBlob).mockResolvedValue(blob);

    const capture = captureElementImage(element, 48);
    element.textContent = '2026-10-16 김알바';

    expect(await capture).toBe(blob);
    const frame = getCapturedFrame();
    expect(frame.textContent).toBe('2026-10-15 전체');
    expect(frame.style.padding).toBe('48px');
    expect(document.body.children.length).toBe(1);
  });

  it('복제본에서만 액션을 제외하고 메모를 펼친다', async () => {
    const element = document.createElement('div');
    const action = document.createElement('button');
    const memo = document.createElement('p');
    action.textContent = '수정 | 삭제';
    memo.textContent = '긴 메모';
    Object.entries(CAPTURE_EXCLUDE_PROPS).forEach(([name, value]) =>
      action.setAttribute(name, value),
    );
    Object.entries(CAPTURE_EXPAND_PROPS).forEach(([name, value]) =>
      memo.setAttribute(name, value),
    );
    memo.style.overflow = 'hidden';
    memo.style.webkitLineClamp = '2';
    element.append(action, memo);
    document.body.append(element);
    vi.mocked(getUsedFontCssText).mockResolvedValue('');
    vi.mocked(domToBlob).mockResolvedValue(new Blob());

    await captureElementImage(element);

    const frame = getCapturedFrame();
    expect(frame.querySelector('button')).toBeNull();
    expect(frame.querySelector('p')?.style.overflow).toBe('visible');
    expect(frame.querySelector('p')?.style.webkitLineClamp).toBe('unset');
    expect(element.querySelector('button')).toBe(action);
    expect(memo.style.overflow).toBe('hidden');
    expect(memo.style.webkitLineClamp).toBe('2');
  });

  it('이미지 생성에 실패해도 화면 밖 복제본을 제거한다', async () => {
    const element = document.createElement('div');
    document.body.append(element);
    vi.mocked(getUsedFontCssText).mockResolvedValue('');
    vi.mocked(domToBlob).mockRejectedValue(new Error('capture'));

    await expect(captureElementImage(element)).rejects.toThrow('capture');
    expect(document.body.children.length).toBe(1);
    expect(document.body.firstElementChild).toBe(element);
  });
});
