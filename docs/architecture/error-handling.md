# 에러 처리

API 에러의 변환·표시 위치·경계 파일 배치의 단일 출처다. [data-flow.md](./data-flow.md), [code-review.md](../collaboration/code-review.md)는 이 문서를 참조만 한다.

## 흐름

`API → error formatter → TanStack Query → UI`

- Fetcher는 실패를 `ApiError(errorCode, status)` 또는 `NetworkError`로 변환해 throw한다.
- TanStack Query는 `throwOnError`로 처리 위치를 나눈다. 컴포넌트 인라인 처리 또는 Error Boundary(`error.tsx`) 위임이다.
- 컴포넌트는 `format{도메인}Error(error)`가 반환한 메시지를 표시한다.
- 분기 처리는 `ts-pattern`을 쓴다.
- 로그는 공통 로그 클래스를 만들어 사용한다. (후순위)

## Fetcher 에러 변환

| 상황                                        | 변환                               | 이유                                                        |
| ------------------------------------------- | ---------------------------------- | ----------------------------------------------------------- |
| 실패 응답, body가 JSON                      | `ApiError(body.errorCode, status)` |                                                             |
| 실패 응답, body가 JSON이 아님(예: 502 HTML) | `ApiError('UNKNOWN', status)`      | status를 보존해야 처리 위치 판단(`throwOnError`)이 동작한다 |
| 네트워크 오류 · timeout                     | `NetworkError`                     | 서버 응답이 있는 실패와 구분한다                            |
| 성공 응답 204 No Content                    | `undefined` 반환                   | 빈 body를 JSON으로 파싱하면 실패한다                        |

## 메시지 변환 (error formatter)

- 도메인 formatter(`format{도메인}Error`)는 **자기 도메인 errorCode만** 매핑한다.
- 공통 formatter(`formatCommonError`)는 도메인과 무관한 에러를 매핑한다. `UNAUTHORIZED`, `NetworkError`, 알 수 없는 오류.
- 메시지는 **도메인 매핑 → 공통 매핑 → 기본 문구** 순서로 찾는다.
- `ApiError` 판별은 `P.instanceOf(ApiError)`로 한다. 매핑에 없는 errorCode는 `.otherwise()`로 공통 formatter에 넘긴다.

```ts
const formatStaffError = (error: unknown) =>
  match(error)
    .with(P.instanceOf(ApiError), ({ errorCode }) =>
      match(errorCode)
        .with('STAFF_NOT_FOUND', () => '존재하지 않는 알바생입니다.')
        .with('STAFF_ALREADY_DELETED', () => '이미 삭제된 알바생입니다.')
        .otherwise(() => formatCommonError(error)),
    )
    .otherwise(() => formatCommonError(error));
```

## 처리 위치 (`throwOnError`)

판단 축은 **에러 종류(status)** 와 **실패한 데이터의 중요도(핵심 / 서브)** 두 가지다. 이 기준은 **query**에 적용한다.

| 구분        | `throwOnError: true` (Boundary 위임)                                                     | `throwOnError: false` (컴포넌트 인라인 처리)                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 적용 시점   | 500대 서버 내부 장애<br>핵심 데이터 로드 실패로 페이지 진입 불가<br>치명적 네트워크 단절 | 400 Bad Request, 폼 유효성 검증 실패<br>서브 위젯 데이터 로드 실패(전체 화면 차단 불필요)<br>인라인 재시도 버튼이나 토스트 노출이 적절한 경우 |
| 사용자 경험 | 세그먼트 전체를 Error Boundary 폴백 화면으로 전환                                        | 기존 화면을 유지한 채 오류 알림/인라인 메시지만 표시                                                                                          |

- **두 기준이 충돌하면 중요도가 우선이다.** 서브 위젯은 status와 관계없이 인라인으로 처리한다. 위젯 하나 때문에 화면 전체를 가리지 않기 위해서다.
- **치명적 네트워크 단절**은 retry 후에도 실패한 `NetworkError`(timeout 포함)를 말한다. 오프라인일 때는 TanStack Query 기본 동작(`networkMode: 'online'`)에 따라 쿼리가 일시정지되며 에러로 처리되지 않는다.
- **mutation은 `throwOnError`를 쓰지 않는다.** `onError`에서 폼 인라인 메시지 또는 토스트로 처리한다.

### 구현 방식

중요도는 에러 객체만 보고 알 수 없으므로 두 단계로 나눈다.

1. QueryClient 공통 옵션(`defaultOptions.queries.throwOnError`)에서 status로 판단한다. 5xx·`NetworkError`는 `true`, 4xx는 `false`.
2. 서브 위젯 쿼리는 자기 `queryOptions`에서 `throwOnError: false`로 덮어쓴다.

기본값을 경계 위임 쪽에 두는 이유는, 덮어쓰기를 빠뜨려도 에러가 조용히 묻히지 않게 하기 위해서다. 쿼리별 핵심/서브 구분은 페이지 설계 문서(`feature/{도메인}/{페이지}.md`)의 "상태·데이터"에 적는다.

### `useSuspenseQuery`

기본은 `useQuery`다. `useSuspenseQuery`는 **핵심 데이터 쿼리에만** 쓴다. suspense 훅은 `throwOnError`를 설정할 수 없고, 캐시에 데이터가 없을 때의 에러를 항상 Error Boundary로 던지기 때문이다.

## 에러별 처리

| 에러                 | 조회 — 핵심 데이터                                                            | 조회 — 서브 위젯 | 변경(mutation)                        |
| -------------------- | ----------------------------------------------------------------------------- | ---------------- | ------------------------------------- |
| 401                  | 인증 계층에서 로그인 리다이렉트 ([auth.md](./auth.md))                        | 동일             | 동일                                  |
| 403                  | 경계 (해당 쿼리에서 `throwOnError: true`로 덮어씀)                            | 인라인           | 토스트                                |
| 404                  | 서버에서 조회하는 엔터티 페이지는 `notFound()`. 클라이언트 전용 조회는 인라인 | 인라인           | 토스트                                |
| 400 / 409 / 422      | 인라인                                                                        | 인라인           | 폼 인라인 또는 토스트 (도메인 메시지) |
| 5xx / `NetworkError` | 경계                                                                          | 인라인           | 토스트, 입력값 보존                   |

## retry

- Fetcher는 재시도하지 않는다. 재시도는 TanStack Query가 담당한다.
- **4xx는 재시도하지 않고**, 5xx·`NetworkError`만 재시도한다. 횟수는 기본값(3회)을 쓴다.
- mutation은 재시도하지 않는다. (기본값)
- 401의 refresh 후 재시도는 인증 계층이 맡는다. ([auth.md](./auth.md))
- QueryClient 공통 옵션(`defaultOptions.queries.retry`)에 한 번만 설정한다.

## 경계 파일 배치

| 파일               | 위치                                                                                         | 용도                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `error.tsx`        | `app/error.tsx`                                                                              | `(main)` 밖(로그인·회원가입·온보딩 등)의 공통 에러                                   |
| `error.tsx`        | `app/(main)/error.tsx`                                                                       | 사이드바(`app/(main)/layout.tsx`)를 유지한 채 본문만 폴백으로 전환                   |
| `error.tsx`        | `(main)` 하위 segment                                                                        | 다른 복구 UI가 필요할 때만 추가한다                                                  |
| `global-error.tsx` | `app/global-error.tsx`                                                                       | 루트 layout(`app/layout.tsx`) 자체의 에러. `app/error.tsx`는 이 경우를 잡지 못한다   |
| `not-found.tsx`    | `app/not-found.tsx`                                                                          | 존재하지 않는 URL 진입, 공통 404                                                     |
| `not-found.tsx`    | 서버에서 엔터티를 조회하는 segment (예: `app/(main)/partTime/staff/[id]/edit/not-found.tsx`) | 조회 결과가 없을 때 `notFound()`를 호출해 레이아웃을 유지한 채 맥락형 404를 표시한다 |

- 경계는 **segment `error.tsx`만** 사용한다. 페이지 안의 일부 영역 실패는 인라인으로 처리하므로 컴포넌트 단위 `<ErrorBoundary>`는 당장 도입하지 않는다.
- segment `not-found.tsx`는 서버에서 `notFound()`를 호출하는 라우트에만 둔다. 클라이언트에서만 조회하는 화면(예: 목록 화면의 상세 뷰어)의 404는 인라인으로 처리한다.

### 경계 화면

- `error.tsx`는 **공통 메시지 + "다시 시도"** 만 보여준다. Server Component에서 난 에러는 production에서 message가 지워지고 `digest`만 전달되어 `ApiError` 정보를 쓸 수 없기 때문이다.
- "다시 시도"는 `useQueryErrorResetBoundary()`의 `reset()`을 먼저 호출한 뒤 `error.tsx`의 `reset()`을 호출한다. `error.tsx`의 `reset()`만으로는 실패한 쿼리의 에러 상태가 남아 같은 에러가 바로 다시 던져진다.
- segment `not-found.tsx`는 에러 객체가 필요 없으므로 맥락형 문구(예: "알바생을 찾을 수 없습니다")를 그대로 쓴다.

## 서버 prefetch 실패

- `prefetchQuery`는 실패해도 에러를 던지지 않고, `dehydrate`는 기본적으로 성공한 쿼리만 클라이언트로 넘긴다. 서버에서 실패한 쿼리는 클라이언트에서 다시 조회되고, 그 결과에 위 기준이 적용된다.
- `notFound()`가 필요한 엔터티 페이지만 `prefetchQuery` 대신 `fetchQuery`로 조회하고, 404면 `notFound()`를 호출한다.
- 404 외의 에러는 서버에서 다시 던지지 않는다. 다시 던지면 `error.tsx`에 `digest`만 전달된다.

## 결정 대기 항목

| 항목                   | 내용                                                                                                                                     | 상태      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| errorCode 예외         | 같은 status 안에서 errorCode로 처리 위치를 달리해야 하는 경우가 있는지. BE errorCode 명세 확인 후 필요한 경우에만 추가                   | 확인 필요 |
| errorCode 타입         | union 타입으로 만들어 exhaustive 검사를 할지. DTO 타입은 openapi-typescript로 생성하므로 BE 명세의 errorCode 정의 방식(enum 여부)에 종속 | 결정 필요 |
| 공통 메시지 문구       | `formatCommonError`의 기본 문구, 경계 화면 문구                                                                                          | 확인 필요 |
| 그 외 에러의 처리 위치 | `ApiError`·`NetworkError`가 아닌 에러(코드 버그 등)를 경계로 보낼지 인라인으로 처리할지                                                  | 결정 필요 |
| 서버 에러 "다시 시도"  | Server Component에서 난 에러의 `reset()` 재시도 동작                                                                                     | 확인 필요 |

## 참고

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Next.js `error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Next.js `not-found.js`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [Next.js `notFound()`](https://nextjs.org/docs/app/api-reference/functions/not-found)
- [TanStack Query Suspense](https://tanstack.com/query/latest/docs/framework/react/guides/suspense)
