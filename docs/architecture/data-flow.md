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

### 변환 함수 호출 위치

API 호출 함수(예: `getNewsList` 등 `entities`의 API 함수) 내부에서 응답을 받은 직후 변환 함수를 호출해 DAO로 변환한 뒤 return한다. Hook이나 Component 단에서는 변환된 DAO만 사용한다.

### 직렬화 계약

Formatter가 반환하는 DAO는 **Server Component에서 Client Component로 그대로 넘어갈 수 있어야** 한다. 허용 타입과 금지 값은 [rendering.md](./rendering.md)의 "직렬화 계약"이 단일 출처다.

## 서버 렌더링과의 연결

첫 화면 데이터의 prefetch·hydration 흐름, 서버/클라이언트 `queryOptions` 공유, 읽기 전용 화면 예외는 [rendering.md](./rendering.md)의 "하이브리드 데이터 패칭"이 단일 출처다.

## API 클라이언트 (Fetcher)

> baseURL·인증·캐시·timeout은 아래와 같이 확정됐다. **서버/클라이언트 분리 방식과 `Fetcher` class 구조는 아직 확정되지 않았으므로**, 해당 부분은 "구현 시 준수할 후보 사양"으로 읽는다.

### baseURL (확정)

baseURL은 환경변수로 관리한다. client/server 네이밍 규칙은 [env.md](./env.md)의 "client / server 구분"이 단일 출처다.

### 인증 — 쿠키 기반 (확정)

인증은 **쿠키 기반**으로 한다. 토큰을 클라이언트 JS에서 직접 다루지 않는다.

- **브라우저 요청**: fetch에 `credentials: 'include'`를 설정해 쿠키를 자동 전송한다.
- **서버 요청**: Server Component의 fetch는 **브라우저 쿠키를 자동으로 전달하지 않는다.** 서버에서 보호된 API를 호출할 때는 `cookies()`로 읽어 요청 헤더에 직접 실어야 한다.

이 비대칭 때문에 서버 호출 경로와 브라우저 호출 경로는 최소한 **인증 헤더를 붙이는 지점이 달라진다.** 파일 단위로 분리할지 하나의 Fetcher가 분기할지는 아래 결정 대기 항목 참고.

### 캐시 — SSR 기본 (확정)

**기본값은 SSR(요청마다 새로 조회)** 이다. 서버 fetch는 캐시하지 않는 것을 기본으로 두고, 정적으로 돌릴 구간만 **선언적으로 예외 처리**한다.

| 구간                          | 설정                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| 기본 (인증·사용자별 데이터)   | 캐시하지 않음 (`cache: 'no-store'`)                         |
| 주기적으로 갱신해도 되는 공개 데이터 | `next: { revalidate: <초> }` (ISR)                     |
| 빌드 시점에 고정 가능한 데이터 | `next: { revalidate: false }` 또는 `use cache` (SSG 성격)   |

인증 쿠키가 실린 요청은 **절대 캐시하지 않는다.** 요청 간 캐시가 공유되면 다른 사용자의 데이터가 노출된다.
`use cache` 부분 도입 기준은 [rendering.md](./rendering.md)의 "캐싱 지시어" 참고.

### timeout — Fetcher 내부 구현 (확정)

timeout은 `Fetcher` 내부에서 `AbortController`(또는 `AbortSignal.timeout()`)로 구현한다. 호출부마다 개별 구현하지 않는다.
호출부가 자체 `signal`을 넘길 수 있으므로, Fetcher는 **timeout signal과 호출부 signal을 합쳐서** 전달해야 한다. 기본 timeout 값은 미정.

### 결정 대기 항목

| 항목                 | 내용                                                                  | 상태      |
| -------------------- | --------------------------------------------------------------------- | --------- |
| 서버/클라이언트 분리 | `serverFetcher` / `clientFetcher` 분리 vs 단일 인스턴스 base URL 분기 | 결정 필요 |
| 서버 전용 차단       | 서버 전용 파일에 `server-only` 적용 범위                              | 결정 필요 |
| retry                | 재시도 대상·횟수, Fetcher와 TanStack Query 중 담당 레이어             | 결정 필요 |
| timeout 기본값       | 기본 타임아웃 초 단위 값                                              | 결정 필요 |
| 공통 Wrapper         | `Fetcher` class, private `_baseUrl`, 인터셉터(인증 헤더·에러 변환)    | 결정 필요 |

## API 에러 처리

전체 흐름: `API → error formatter → TanStack Query → UI`

- API 클라이언트에서 응답이 실패하면 `ApiError`(errorCode, status)를 throw한다.
- 도메인별 error formatter(`format{도메인}Error`)가 `errorCode`를 사용자에게 보여줄 한국어 메시지로 매핑한다.
- TanStack Query의 `throwOnError`로 처리 위치를 분기한다 (예: 404는 컴포넌트에서 처리, 나머지는 Error Boundary로 위임).
- 컴포넌트는 `format{도메인}Error(error)`가 반환한 메시지를 표시한다.
- 분기 처리 자체는 `ts-pattern`을 활용한다.
- 로그는 공통 로그 클래스를 만들어 사용한다. (후순위)

`error.tsx` / `not-found.tsx`의 배치 단위와, 경계·컴포넌트 간 오류 표시 책임 분리는 **아직 정해지지 않았다.** `throwOnError` 판정 기준(status 기반 vs errorCode 기반)도 이 결정에 종속된다.
