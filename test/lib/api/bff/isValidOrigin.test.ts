// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { isValidOrigin } from '@lib/api/bff/isValidOrigin';

vi.mock('server-only', () => ({}));

const INTERNAL_URL = 'http://10.0.0.5:3000/api/auth/login';
const HOST = 'bizsched.app';
const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const createRequest = (method: string, headers: Record<string, string>) =>
  new Request(INTERNAL_URL, { method, headers });

describe('isValidOrigin', () => {
  it.each(STATE_CHANGING_METHODS)(
    '%s 요청의 Origin host가 Host와 같으면 통과한다',
    (method) => {
      const request = createRequest(method, {
        Origin: 'https://bizsched.app',
        Host: HOST,
      });

      expect(isValidOrigin(request)).toBe(true);
    },
  );

  it.each(STATE_CHANGING_METHODS)(
    '%s 요청의 Origin host가 다르면 막는다',
    (method) => {
      const request = createRequest(method, {
        Origin: 'https://evil.com',
        Host: HOST,
      });

      expect(isValidOrigin(request)).toBe(false);
    },
  );

  it('request.url이 내부 http 주소여도 Host 기준으로 통과한다', () => {
    const request = createRequest('POST', {
      Origin: 'https://bizsched.app',
      Host: HOST,
    });

    expect(request.url.startsWith('http://10.0.0.5')).toBe(true);
    expect(isValidOrigin(request)).toBe(true);
  });

  it('X-Forwarded-Host가 있으면 Host보다 우선한다', () => {
    const request = createRequest('POST', {
      Origin: 'https://bizsched.app',
      Host: '10.0.0.5:3000',
      'X-Forwarded-Host': HOST,
    });

    expect(isValidOrigin(request)).toBe(true);
  });

  it('X-Forwarded-Host와 Origin이 다르면 Host가 같아도 막는다', () => {
    const request = createRequest('POST', {
      Origin: 'https://bizsched.app',
      Host: HOST,
      'X-Forwarded-Host': 'other.app',
    });

    expect(isValidOrigin(request)).toBe(false);
  });

  it('포트가 다르면 막는다', () => {
    const request = createRequest('POST', {
      Origin: 'https://bizsched.app:8443',
      Host: HOST,
    });

    expect(isValidOrigin(request)).toBe(false);
  });

  it('상태 변경 요청에 Origin이 없으면 막는다', () => {
    expect(isValidOrigin(createRequest('POST', { Host: HOST }))).toBe(false);
  });

  it('Origin: null이면 막는다', () => {
    const request = createRequest('POST', { Origin: 'null', Host: HOST });

    expect(isValidOrigin(request)).toBe(false);
  });

  it('Host와 X-Forwarded-Host가 모두 없으면 막는다', () => {
    const request = createRequest('POST', { Origin: 'https://bizsched.app' });

    expect(isValidOrigin(request)).toBe(false);
  });

  it.each(['GET', 'HEAD'])('%s 요청은 Origin을 검사하지 않는다', (method) => {
    const request = createRequest(method, {
      Origin: 'https://evil.com',
      Host: HOST,
    });

    expect(isValidOrigin(request)).toBe(true);
  });
});
