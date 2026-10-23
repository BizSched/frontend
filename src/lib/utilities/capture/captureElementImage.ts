import { CAPTURE_ATTRIBUTES } from '@lib/utilities/capture/captureAttributes';
import { getUsedFontCssText } from '@lib/utilities/capture/getUsedFontCssText';

const CAPTURE_SCALE = 2;
const TRANSPARENT_COLORS = ['transparent', 'rgba(0, 0, 0, 0)'];

const getBackgroundColor = (element: HTMLElement) => {
  for (
    let current: HTMLElement | null = element;
    current;
    current = current.parentElement
  ) {
    const { backgroundColor } = getComputedStyle(current);
    if (!TRANSPARENT_COLORS.includes(backgroundColor)) return backgroundColor;
  }
  return null;
};

const mountCaptureClone = (element: HTMLElement, padding: number) => {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.inert = true;
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '-100000px',
    width: `${element.getBoundingClientRect().width + padding * 2}px`,
    pointerEvents: 'none',
  });
  const frame = document.createElement('div');
  frame.style.padding = `${padding}px`;

  const clone = element.cloneNode(true) as HTMLElement;
  // NOTE: 화면 밖 복제본의 lazy 이미지는 로드되지 않아 라이브러리가 타임아웃(30초)까지 기다린다
  clone.querySelectorAll('img').forEach((image) => {
    image.loading = 'eager';
  });
  clone
    .querySelectorAll(`[${CAPTURE_ATTRIBUTES.exclude}]`)
    .forEach((node) => node.remove());
  clone
    .querySelectorAll<HTMLElement>(`[${CAPTURE_ATTRIBUTES.expand}]`)
    .forEach((node) => {
      node.style.display = 'block';
      node.style.overflow = 'visible';
      node.style.webkitLineClamp = 'unset';
    });

  frame.append(clone);
  host.append(frame);
  document.body.append(host);

  return { frame, unmount: () => host.remove() };
};

// NOTE: 원본 대신 화면 밖 복제본을 찍는다. 라이브러리 복제 훅은 원본 크기로 캔버스를 잡아 펼친 메모가 잘리고, 원본을 바꾸면 화면이 깜빡인다
const captureElementImage = async (element: HTMLElement, padding = 0) => {
  const { frame, unmount } = mountCaptureClone(element, padding);

  try {
    const backgroundColor = getBackgroundColor(element);
    const { domToBlob } = await import('modern-screenshot');
    const fontCssText = await getUsedFontCssText(frame);
    return await domToBlob(frame, {
      scale: CAPTURE_SCALE,
      backgroundColor,
      font: fontCssText ? { cssText: fontCssText } : false,
    });
  } finally {
    unmount();
  }
};

export { captureElementImage };
