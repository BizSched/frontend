# 데이터 흐름 (DTO/DAO, 에러 처리)

## 레이어별 책임

- **Component**: UI 표현, 사용자 이벤트 처리, Hook에서 전달받은 상태 표현
- **Hook**: React 상태 관리, 서버 상태 관리, UI와 비즈니스 로직 연결
- **API**: HTTP 요청, 응답 타입 검증, DTO → FE DAO 변환
- **Utility**: React 무관 순수 함수, 데이터 포맷팅, 계산·변환

## DTO/DAO 분리

BE에서 온 응답(DTO)을 변환 함수(Formatter)를 통해 FE 구조(DAO)로 바꿔서 사용한다.

`BE API(DTO) → Formatter → FE DAO → TanStack Query → UI`

변환 함수 작성 시 AI를 적극 활용한다.

> **용어 주의**: 여기서 말하는 DAO는 **DTO를 변환한 프론트엔드 구조**를 가리킨다. 백엔드에서 DAO(Data Access Object)는 데이터 접근 계층을 뜻하므로 같은 단어가 서로 다른 의미로 쓰인다. BE와 소통할 때는 "FE DAO" 또는 "DTO 변환 결과"로 풀어서 말한다.

### API 타입·클라이언트·zod 생성 (orval)

- DTO 타입과 API 호출 함수는 직접 작성하지 않고 BE OpenAPI 명세에서 `orval`로 생성한다 (`client: 'fetch'`). 명세와 타입이 어긋나지 않게 하기 위해서다.
- 런타임 검증용 `zod` 스키마도 같은 명세에서 `orval`로 함께 생성한다 (`client: 'zod'`). 타입과 zod 스키마를 손으로 따로 유지하면 BE 명세가 바뀔 때 둘이 어긋날 위험이 있어, 같은 소스에서 동기화해서 생성한다.
- 생성된 타입은 컴파일 타임 검사만 하므로, 응답의 런타임 검증은 생성된 `zod` 스키마로 한다. 검증은 API 레이어에서 Formatter 호출 전에 한다.
- **TanStack Query 훅은 생성하지 않는다.** orval의 `react-query` 클라이언트 모드는 쓰지 않고, 생성된 fetch 함수를 가져와 Hook 레이어(`hooks/api/`)에서 직접 `queryOptions`/`useQuery`로 조립한다. 이유:
  - 생성된 훅은 DTO를 그대로 반환해 Formatter·zod 검증을 끼울 지점이 없다.
  - `queryKey` 구조가 생성기 컨벤션에 묶여 세밀한 캐시 무효화 전략을 설계하기 어렵다.
  - 서버 prefetch와 클라이언트 `useQuery`가 같은 `queryOptions`를 공유하는 구조([결정 대기 항목](#결정-대기-항목) 참고)와 맞지 않는다.
- orval 산출물 위치: `src/lib/api/generated/` (손으로 쓴 Fetcher·API 레이어와 분리 — orval이 `generate` 시 타겟 폴더 내용을 정리(clean)하므로 같은 폴더에 두면 안 됨).
- orval의 `override.mutator`로 생성된 모든 호출 함수가 `serverFetcher`/`clientFetcher`를 거치도록 연결한다. 자세한 설정은 `orval.config.ts` 참고.

### 변환 함수 호출 위치

API 호출 함수(예: `getNewsList` 등 `entities`의 API 함수) 내부에서 응답을 받은 직후 변환 함수를 호출해 DAO로 변환한 뒤 return한다. Hook이나 Component 단에서는 변환된 DAO만 사용한다.

### 직렬화 계약

Formatter가 반환하는 DAO는 **Server Component에서 Client Component로 그대로 넘어갈 수 있어야** 한다. 허용 타입과 금지 값은 [rendering.md](./rendering.md)의 "직렬화 계약"이 단일 출처다.

## 서버 렌더링과의 연결

첫 화면 데이터의 prefetch·hydration 흐름, 서버/클라이언트 `queryOptions` 공유, 읽기 전용 화면 예외는 [rendering.md](./rendering.md)의 "하이브리드 데이터 패칭"이 단일 출처다.

## API 클라이언트 (Fetcher)

### baseURL (확정)

baseURL은 환경변수로 관리한다. client/server 네이밍 규칙은 [env.md](./env.md)의 "client / server 구분"이 단일 출처다.

### 인증 — BFF + httpOnly 쿠키 (확정)

인증은 **쿠키 기반**으로 하고, 토큰을 클라이언트 JS에서 직접 다루지 않는다. BE가 요구하는 `Authorization: Bearer` 헤더는 Next 서버(BFF)가 쿠키의 토큰으로 붙인다. 로그인·refresh·로그아웃 흐름과 보안 규칙은 [auth.md](./auth.md)가 단일 출처다.

- **서버 요청**: Server Component의 fetch는 브라우저 쿠키를 자동으로 전달하지 않는다. `cookies()`로 access 토큰을 읽어 Bearer 헤더로 BE에 직접 요청한다.
- **브라우저 요청**: BE를 직접 호출하지 않고 same-origin BFF 경로로 요청한다. BFF가 헤더를 붙여 BE로 전달한다.

### 서버/클라이언트 분리 (확정)

두 경로는 baseURL과 인증 방식이 모두 다르므로 Fetcher를 둘로 나눈다.

| Fetcher         | 요청 대상            | 인증                               |
| --------------- | -------------------- | ---------------------------------- |
| `serverFetcher` | BE 직접              | `cookies()`의 토큰을 Bearer 헤더로 |
| `clientFetcher` | same-origin BFF 경로 | 없음 (BFF가 처리)                  |

- timeout·signal 병합과 에러 변환은 두 Fetcher가 공유하는 공통 코어에 둔다. 인증 헤더 주입은 `serverFetcher`에만 있다.
- `serverFetcher`는 `next/headers`를 import하므로 클라이언트 번들에 들어갈 수 없다. 단일 인스턴스에서 분기하지 않는다.

### 서버 전용 차단 (확정)

- `server-only` 적용: `serverFetcher`, 토큰 쿠키 읽기·쓰기 유틸, refresh 로직
- 적용하지 않음: API 함수, `queryOptions`, Formatter, DTO 타입, `ApiError` — 서버·클라이언트가 공유하는 모듈이다

### 캐시 — SSR 기본 (확정)

**기본값은 SSR(요청마다 새로 조회)** 이다. 서버 fetch는 캐시하지 않는 것을 기본으로 두고, 정적으로 돌릴 구간만 **선언적으로 예외 처리**한다.

| 구간                                 | 설정                                                      |
| ------------------------------------ | --------------------------------------------------------- |
| 기본 (인증·사용자별 데이터)          | 캐시하지 않음 (`cache: 'no-store'`)                       |
| 주기적으로 갱신해도 되는 공개 데이터 | `next: { revalidate: <초> }` (ISR)                        |
| 빌드 시점에 고정 가능한 데이터       | `next: { revalidate: false }` 또는 `use cache` (SSG 성격) |

인증 쿠키가 실린 요청은 **절대 캐시하지 않는다.** 요청 간 캐시가 공유되면 다른 사용자의 데이터가 노출된다.
`use cache` 부분 도입 기준은 [rendering.md](./rendering.md)의 "캐싱 지시어" 참고.

### timeout — Fetcher 내부 구현 (확정)

timeout은 `Fetcher` 내부에서 `AbortController`(또는 `AbortSignal.timeout()`)로 구현한다. 호출부마다 개별 구현하지 않는다.
호출부가 자체 `signal`을 넘길 수 있으므로, Fetcher는 **timeout signal과 호출부 signal을 합쳐서** 전달해야 한다.

브라우저 요청은 `브라우저 → BFF → BE` 두 홉이므로 **`clientFetcher` timeout은 BFF→BE timeout보다 길어야** 한다. 짧으면 브라우저가 포기한 뒤에도 BFF가 BE 응답을 기다린다.

### retry · 에러 변환 (확정)

Fetcher는 재시도하지 않는다. 재시도 규칙과 Fetcher의 에러 변환 규칙은 [error-handling.md](./error-handling.md)가 단일 출처다.

### 결정 대기 항목

| 항목                               | 내용                                                                                                                                                                                                         | 상태      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| timeout 기본값                     | `clientFetcher`, `serverFetcher`(BFF→BE 포함) 각각의 초 단위 값                                                                                                                                              | 결정 필요 |
| 공통 코어 형태                     | `Fetcher` class vs 팩토리 함수(예: `createFetcher({ baseUrl, getHeaders })`)                                                                                                                                 | 결정 필요 |
| 공유 `queryOptions`의 Fetcher 선택 | 서버 prefetch와 클라이언트 `useQuery`가 같은 `queryOptions`를 쓰지만 Fetcher는 다르다. Fetcher 주입(`xxxQueryOptions(fetcher)`) vs 환경 분기 동적 import(`server-only` 모듈이 클라이언트 그래프에 섞일 위험) | 결정 필요 |

## API 에러 처리

전체 흐름은 `API → error formatter → TanStack Query → UI`다. `ApiError`·`NetworkError` 변환, 도메인·공통 formatter, `throwOnError` 기준, `error.tsx`·`not-found.tsx` 배치는 [error-handling.md](./error-handling.md)가 단일 출처다.
