import { QueryClient } from '@tanstack/react-query';

// 요청마다 새 인스턴스를 만든다. 모듈 전역 싱글턴은 요청 간 캐시가 공유되어 금지된다.
export function getServerQueryClient() {
  return new QueryClient();
}
