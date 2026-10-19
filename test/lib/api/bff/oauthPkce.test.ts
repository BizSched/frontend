// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import {
  createCodeChallenge,
  createCodeVerifier,
  createOAuthState,
} from '@lib/api/bff/oauthPkce';

vi.mock('server-only', () => ({}));

const BASE64URL_43 = /^[A-Za-z0-9_-]{43}$/;

describe.each([
  ['createOAuthState', createOAuthState],
  ['createCodeVerifier', createCodeVerifier],
])('%s', (_, createValue) => {
  it('32바이트 난수를 패딩 없는 base64url 43자로 만든다', () => {
    expect(createValue()).toMatch(BASE64URL_43);
  });

  it('호출할 때마다 다른 값을 만든다', () => {
    const values = new Set(Array.from({ length: 20 }, () => createValue()));

    expect(values.size).toBe(20);
  });
});

describe('createCodeChallenge', () => {
  it('code_verifier의 SHA-256을 base64url로 만든다 (RFC 7636 부록 B)', () => {
    expect(
      createCodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'),
    ).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('생성한 code_verifier로 만든 값도 base64url 43자다', () => {
    expect(createCodeChallenge(createCodeVerifier())).toMatch(BASE64URL_43);
  });
});
