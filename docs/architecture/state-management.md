# 상태 관리

상태 범위에 따라 도구를 구분해서 사용한다.

| 범위                               | 도구              |
| ---------------------------------- | ----------------- |
| 컴포넌트 내부 상태                 | useState          |
| 여러 컴포넌트에서 공유되는 UI 상태 | Context / Zustand |
| 서버에서 가져온 데이터             | TanStack Query (기본) / RSC 직접 조회 (읽기 전용 예외) |
| URL로 관리해야 하는 상태           | URL Search Params |
| Form 상태                          | React Hook Form   |

## 서버 데이터 도구 선택

서버 데이터의 **기본 도구는 TanStack Query**다. 화면 성격에 따라 세 가지로 나뉜다.

| 상황                                              | 방식                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| 클라이언트에서 조회·갱신·무효화가 필요한 데이터   | Client Component에서 `useQuery` / `useMutation`                           |
| 위에 더해 **첫 화면에 즉시 보여야** 하는 데이터   | Server Component `prefetchQuery` + `HydrationBoundary` + `useQuery`       |
| 상호작용·갱신·캐시 동기화가 **전혀 없는** 읽기 전용 | Server Component에서 직접 조회해 props/JSX로 구성 (TanStack Query 미경유) |

각 패턴의 상세 규칙·예시와 경계 판단 기준은 [rendering.md](./rendering.md)의 "하이브리드 데이터 패칭", 데이터 변환과 에러 처리는 [data-flow.md](./data-flow.md) 참고.

## Query Key 관리

TanStack Query 공식 권장에 따라 factory 패턴을 사용한다.

- 도메인별로 `xxxKeys` 객체를 만들고, `all`/`infiniteList` 등 하위 키를 부모 키에 이름과 파라미터를 이어붙여 `as const`로 정의한다.
- 쿼리 옵션은 `xxxQueryOptions` 같은 함수로 분리해 `queryKey`, `queryFn`, `initialPageParam`, `getNextPageParam`, `staleTime` 등을 구성한다.
- 캐시를 구분해야 하는 최소 파라미터(예: 페이지 size)는 key에 포함시킨다.
