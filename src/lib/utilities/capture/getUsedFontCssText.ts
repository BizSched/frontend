const URL_PATTERN = /url\((['"]?)(.+?)\1\)/g;
const FONT_WEIGHT_KEYWORDS: Record<string, number> = { normal: 400, bold: 700 };

const normalizeFontFamily = (family: string) =>
  family
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .toLowerCase();

const parseUnicodeRange = (value: string) =>
  value
    .split(',')
    .map((token) => token.trim().replace(/^u\+/i, ''))
    .filter(Boolean)
    .map((token) => {
      if (token.includes('?')) {
        return [
          parseInt(token.replaceAll('?', '0'), 16),
          parseInt(token.replaceAll('?', 'f'), 16),
        ];
      }
      const [start, end = start] = token.split('-');
      return [parseInt(start, 16), parseInt(end, 16)];
    });

const parseFontWeightRange = (value: string) => {
  const [min, max = min] = (value.trim() || 'normal')
    .split(/\s+/)
    .map((weight) => FONT_WEIGHT_KEYWORDS[weight] ?? Number(weight));
  return [min, max];
};

const collectFontUsage = (root: HTMLElement) => {
  const usage = new Map<string, Map<number, Set<number>>>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent?.trim();
    if (!text || !node.parentElement) continue;

    const { fontFamily, fontWeight } = getComputedStyle(node.parentElement);
    const weight = Number(fontWeight);
    fontFamily.split(',').forEach((family) => {
      const weights = usage.get(normalizeFontFamily(family)) ?? new Map();
      const codePoints = weights.get(weight) ?? new Set<number>();
      for (const char of text) codePoints.add(char.codePointAt(0) ?? 0);
      weights.set(weight, codePoints);
      usage.set(normalizeFontFamily(family), weights);
    });
  }

  return usage;
};

const collectFontFaceRules = (rules: CSSRuleList): CSSFontFaceRule[] =>
  Array.from(rules).flatMap((rule) => {
    if (rule instanceof CSSFontFaceRule) return [rule];
    if (rule instanceof CSSImportRule) {
      return rule.styleSheet ? readFontFaceRules(rule.styleSheet) : [];
    }
    if (rule instanceof CSSGroupingRule) {
      return collectFontFaceRules(rule.cssRules);
    }
    return [];
  });

const readFontFaceRules = (styleSheet: CSSStyleSheet) => {
  try {
    return collectFontFaceRules(styleSheet.cssRules);
  } catch {
    return [];
  }
};

const isFontFaceUsed = (
  rule: CSSFontFaceRule,
  usage: Map<string, Map<number, Set<number>>>,
) => {
  const weights = usage.get(
    normalizeFontFamily(rule.style.getPropertyValue('font-family')),
  );
  if (!weights) return false;

  const [minWeight, maxWeight] = parseFontWeightRange(
    rule.style.getPropertyValue('font-weight'),
  );
  const ranges = parseUnicodeRange(
    rule.style.getPropertyValue('unicode-range'),
  );

  return Array.from(weights).some(
    ([weight, codePoints]) =>
      weight >= minWeight &&
      weight <= maxWeight &&
      (ranges.length === 0 ||
        Array.from(codePoints).some((codePoint) =>
          ranges.some(([start, end]) => codePoint >= start && codePoint <= end),
        )),
  );
};

const toDataUrl = async (url: string) => {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`Failed to fetch font: ${url}`);

  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

const embedFontFaceUrls = async (rule: CSSFontFaceRule) => {
  const baseUrl = rule.parentStyleSheet?.href ?? document.baseURI;
  const urls = Array.from(
    rule.cssText.matchAll(URL_PATTERN),
    ([, , url]) => url,
  );
  const dataUrls = await Promise.all(
    urls.map((url) => toDataUrl(new URL(url, baseUrl).href)),
  );

  return urls.reduce(
    (cssText, url, index) => cssText.replace(url, () => dataUrls[index]),
    rule.cssText,
  );
};

// NOTE: 캡처 라이브러리는 쓰인 글꼴 패밀리의 @font-face를 모두 내장한다. Pretendard dynamic subset은 828개(약 12MB)라 영역 글자·굵기에 맞는 subset만 고른다
const getUsedFontCssText = async (root: HTMLElement) => {
  const usage = collectFontUsage(root);
  const rules = Array.from(document.styleSheets)
    .flatMap(readFontFaceRules)
    .filter((rule) => isFontFaceUsed(rule, usage));
  const results = await Promise.allSettled(rules.map(embedFontFaceUrls));

  return results
    .flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
    .join('\n');
};

export { getUsedFontCssText };
