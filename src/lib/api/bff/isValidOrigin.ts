import 'server-only';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// NOTE: Next Server Actions와 같은 기준으로 Origin의 host를 X-Forwarded-Host(없으면 Host)와 비교한다. TLS 종단 위치에 따라 request.url의 스킴이 달라질 수 있어 스킴은 비교하지 않는다
const isValidOrigin = (request: Request) => {
  if (!STATE_CHANGING_METHODS.has(request.method.toUpperCase())) return true;

  const origin = request.headers.get('origin');
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    // NOTE: Origin: null 등 URL이 아닌 값은 출처를 숨긴 요청이므로 거부한다
    return false;
  }
};

export { isValidOrigin };
