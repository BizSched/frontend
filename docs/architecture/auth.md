# 인증 (BFF + httpOnly 쿠키)

## 원칙

인증은 **쿠키 기반**으로 한다. 토큰을 클라이언트 JS에서 직접 다루지 않는다.

BE는 `accessToken` / `refreshToken`을 응답 body로 주고, 보호 API에 `Authorization: Bearer`를 요구한다. 이 둘을 잇기 위해 **Next 서버가 BFF(Backend for Frontend) 역할**을 한다. 토큰은 Next 서버만 알고, 브라우저는 httpOnly 쿠키만 가진다.

```
브라우저 ──(쿠키, same-origin)──▶ Next 서버(BFF) ──(Authorization: Bearer)──▶ BE
                                   ▲ 쿠키 ↔ 토큰 변환은 여기서만 한다
```

**BFF는 변환만 한다.** 토큰 유효성 판단은 BE가, refresh와 재시도는 브라우저의 `customFetcher`가 맡는다. BFF는 BE의 401을 그대로 전달한다.

## BE 토큰 규칙

| 항목           | 값                                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| access 만료    | 30분                                                                                                                                                                    |
| refresh 만료   | 로그인 요청의 `autoLogin`이 `true`면 30일, `false`·생략이면 1일. refresh 후에도 처음 로그인 때의 값을 따른다                                                            |
| 만료 시각      | 로그인·refresh 응답에 `expiresIn`이 없다                                                                                                                                |
| rotation       | refresh 응답이 두 토큰을 모두 새로 준다. 이전 refresh 토큰은 유예 없이 즉시 무효이며, 재사용하면 401 `INVALID_REFRESH_TOKEN`. 재사용해도 이미 발급된 새 토큰은 유지된다 |
| 동시 refresh   | 같은 refresh 토큰으로 동시에 요청하면 한쪽만 성공하고, 다른 쪽은 401이 아니라 500 `INTERNAL_SERVER_ERROR`를 받는다                                                      |
| access 만료 시 | 401 `TOKEN_EXPIRED`. BE는 refresh 후 원래 요청을 1회만 재시도하도록 권장한다                                                                                            |
| 토큰 없음      | 401 `UNAUTHORIZED`                                                                                                                                                      |
| 로그아웃       | access 토큰이 필요하다. 응답은 200 + 빈 body                                                                                                                            |

## 토큰 쿠키

로그인·refresh 응답의 토큰은 Route Handler가 httpOnly 쿠키로 저장한다. 브라우저로 가는 응답 body에는 토큰을 넣지 않는다.

| 쿠키            | 값                      | 속성                                     |
| --------------- | ----------------------- | ---------------------------------------- |
| `access_token`  | access 토큰             | `HttpOnly; Secure; SameSite=Lax; Path=/` |
| `refresh_token` | refresh 토큰            | `HttpOnly; Secure; SameSite=Lax; Path=/` |
| `auto_login`    | 로그인 때의 `autoLogin` | `HttpOnly; Secure; SameSite=Lax; Path=/` |

- 세 쿠키의 수명은 같다. `autoLogin`이 `true`면 `Max-Age=2592000`(30일), `false`면 `Max-Age` 없이 세션 쿠키로 둔다. 브라우저를 닫으면 로그인이 풀려야 자동 로그인을 끈 의미가 있다.
- access 쿠키도 refresh 쿠키와 수명이 같다. 만료된 access 토큰도 BE까지 전달되어야 BE가 `TOKEN_EXPIRED`로 판단한다. 쿠키가 먼저 사라지면 `UNAUTHORIZED`가 와서 refresh 대상인지 구분할 수 없다.
- `auto_login`은 refresh 때 쿠키 수명을 정하는 데 쓴다. refresh 응답에 만료 시각이 없고, 브라우저는 쿠키의 만료 속성을 서버로 보내지 않는다.
- `Path`는 모두 `/`다. `proxy.ts`가 모든 페이지 요청에서 refresh 쿠키 존재 여부를 확인하기 때문이다.
- `Secure`는 production에서만 켠다. 로컬 개발 서버는 http다.

## 로그인 · 로그아웃

- **로그인**: 로그인 폼 → 로그인 Route Handler → BE 로그인 API → body의 토큰과 `autoLogin`을 쿠키로 `Set-Cookie`. 브라우저에는 사용자 정보만 돌려준다.
- 로그인 화면에 자동 로그인 체크박스를 두고, 값을 `autoLogin`으로 보낸다.
- **로그아웃**: 로그아웃 Route Handler → access 토큰으로 BE 로그아웃 API 호출 → 성공하면 세 쿠키를 `Max-Age=0`으로 삭제.
  - BE가 401을 주면 쿠키를 지우지 않고 401을 그대로 전달한다. 클라이언트가 refresh 후 로그아웃을 다시 호출한다. 쿠키만 지우면 서버의 refresh 토큰이 만료 전까지 유효하게 남는다.
  - refresh까지 실패하거나 BE가 401 `UNAUTHORIZED`(토큰 없음·잘못됨, refresh 대상 아님)를 주면, 클라이언트가 세션 정리 경로로 쿠키를 지우고 로그인 페이지로 이동한다. 사용자는 언제든 로그아웃할 수 있어야 한다.
- 로그아웃 후 클라이언트는 `queryClient.clear()`로 이전 사용자 캐시를 지우고 로그인 페이지로 이동한다.
- **회원 탈퇴**(`DELETE /api/users/me`)는 범용 통과 경로로 부른다. 범용 통과는 쿠키를 지우지 않으므로, 탈퇴에 성공하면 클라이언트가 세션 정리 경로를 호출한 뒤 로그아웃과 같이 정리한다.

## 보호 API 호출 경로

| 호출 위치                                               | 경로                                                                                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 서버 (Server Component · Server Action · Route Handler) | 인증 헤더 헬퍼로 쿠키의 access 토큰을 `Authorization: Bearer` 헤더로 만들어 `customFetcher`에 넘기고, BE에 **직접** 요청한다 |
| 브라우저 (Client Component의 TanStack Query 등)         | same-origin BFF 경로로 요청한다. BFF가 쿠키의 토큰을 Bearer 헤더로 붙여 BE로 전달한다                                        |

- 브라우저는 BE를 직접 호출하지 않는다. JS가 httpOnly 쿠키를 읽을 수 없어 Bearer 헤더를 만들 수 없기 때문이다.
- 브라우저 요청이 모두 same-origin이 되므로 BE CORS 설정과 `credentials: 'include'`가 필요 없다.
- `customFetcher`와 인증 헤더 헬퍼 구성은 [data-flow.md](./data-flow.md)의 "API 클라이언트 (Fetcher)" 참고.

## BFF 경로

BFF 경로는 두 종류로 나눈다. 모두 `app/api/` 아래의 Route Handler다.

| 종류      | 경로                                     | 역할                                         | 응답                                                             |
| --------- | ---------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| 인증 전용 | `app/api/auth/*/route.ts` (아래 표)      | 토큰 ↔ 쿠키 변환                             | BE 응답에서 토큰만 뺀 부분. 변환은 API 함수의 Formatter가 맡는다 |
| 범용 통과 | `app/api/[...path]/route.ts` (catch-all) | 쿠키의 access 토큰을 Bearer 헤더로 붙여 전달 | BE 응답 그대로. 변환은 API 함수의 Formatter가 맡는다             |

| 인증 전용 경로             | BE API                   | 동작                                                                                                                                     |
| -------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/login`     | `POST /api/auth/login`   | 토큰·`autoLogin`을 쿠키로 저장하고 사용자 정보만 돌려준다                                                                                |
| `POST /api/auth/refresh`   | `POST /api/auth/refresh` | refresh 쿠키를 body로 보내고, 성공하면 두 토큰을 `auto_login`에 맞는 수명으로 다시 저장한다. 실패하면 쿠키를 그대로 두고 실패를 전달한다 |
| `POST /api/auth/logout`    | `POST /api/auth/logout`  | 성공하면 쿠키를 삭제한다. BE가 401을 주면 쿠키를 그대로 두고 401을 전달한다                                                              |
| `DELETE /api/auth/session` | 없음                     | BE를 호출하지 않고 쿠키만 삭제한다. refresh까지 실패했을 때 클라이언트가 호출한다                                                        |

- 범용 통과 경로는 catch-all Route Handler로 한다. BE `Set-Cookie` 제거와 BFF 에러 정규화는 `proxy.ts` rewrite로 구현할 수 없다.
- 데이터 집계·가공은 BFF에서 하지 않는다. 서버 렌더링 경로와 브라우저 경로가 같은 DTO를 받아야 Formatter를 공유할 수 있다.
- BFF 경로는 BE 경로와 같게 둔다. orval이 생성한 요청 함수의 URL(`/api/...`)이 그대로 BFF 경로가 되어, 인증 외 API는 브라우저에서 생성 함수를 그대로 쓸 수 있다. `/api/`로 시작하지 않는 `/health`는 BFF로 열지 않고 서버에서만 부른다.

### 생성 함수와 BFF

orval이 생성한 auth 요청 함수(`login1`, `refresh`, `logout`)는 BE 계약 그대로다. 로그인 응답에 토큰이 있고, refresh 요청 body에 refresh 토큰이 필요하다. 브라우저용 BFF 계약과 다르므로 아래처럼 나눈다.

| 위치                                            | 쓰는 것                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| BFF Route Handler (`app/api/auth/*`)            | 생성 요청 함수와 생성 zod 스키마를 직접 쓴다. 토큰이 든 원래 응답이 필요하므로 `entities`를 거치지 않는다     |
| 브라우저용 인증 함수 (`lib/api/entities/auth/`) | 생성 요청 함수를 쓰지 않고 BFF 경로를 `customFetcher`로 직접 부른다. 응답은 생성 zod 스키마의 일부로 검증한다 |

- 생성된 auth 요청 함수는 브라우저에서 쓰지 않는다. 경로는 BFF와 같지만 계약이 다르다.

### 범용 통과 규칙

- 요청이나 응답에 토큰이 오가는 경로는 전달하지 않는다. 인증 전용 핸들러를 거치지 않으면 토큰이 담긴 BE 응답이 브라우저로 나간다. 대상은 `auth/*`, `oauth/*`, `users/signup/additional-info`(소셜 가입 마무리. 응답에 토큰이 있고 요청에 `tempToken`이 필요하다)다. BE에 이런 경로가 추가되면 이 목록에 더한다.
- 요청 헤더는 `Content-Type`, `Accept`, `Accept-Language`만 전달하고 `Authorization`을 붙인다. 브라우저의 `Cookie`, `Host`, `Origin`은 BE로 보내지 않는다.
- BE 응답의 `Set-Cookie`와 hop-by-hop 헤더는 제거한다.
- 요청·응답 body는 스트림으로 전달한다. 응답을 버퍼링하면 배포 환경의 응답 크기 제한에 걸린다.
- access 쿠키가 없으면 헤더 없이 전달한다. 401 판단은 BE가 한다.

## BFF 응답 · 에러 계약

BFF의 실패 응답은 모두 BE `ErrorResponse`와 같은 `{ code, message, errorCode }` 형태로 돌려준다. `customFetcher`가 BE 응답과 같은 방식으로 에러를 변환할 수 있게 하기 위해서다.

| 상황                             | status       | errorCode                       |
| -------------------------------- | ------------ | ------------------------------- |
| BE 에러 응답                     | BE 값 그대로 | BE 값 그대로                    |
| 상태 변경 요청의 `Origin` 불일치 | 403          | `BFF_INVALID_ORIGIN`            |
| 요청 body 검증 실패              | 400          | `VALIDATION_ERROR`              |
| BE 요청 timeout                  | 504          | `BFF_UPSTREAM_TIMEOUT`          |
| BE 연결 실패                     | 502          | `BFF_UPSTREAM_UNAVAILABLE`      |
| BE 응답 검증 실패                | 502          | `BFF_INVALID_UPSTREAM_RESPONSE` |

- errorCode 이름 규칙은 [error-handling.md](./error-handling.md)의 "errorCode 이름" 참고.
- BE 응답 검증에 실패하면 쿠키를 저장하지 않는다.
- 요청 body와 BE 응답은 orval이 생성한 zod 스키마로 검증한다.
- 클라이언트는 지금 5xx를 `ApiError`로 변환하지 않으므로, BFF의 5xx 코드(`BFF_UPSTREAM_TIMEOUT` 등)로 분기하지 않고 공통 문구로 처리한다. BFF는 원인 추적과 이후 상황별 안내를 위해 코드를 그대로 보낸다.
- BFF 5xx를 처리할 일이 생기면 BFF 5xx만 골라 변환하지 않고, 클라이언트가 5xx 전부를 `ApiError`로 변환하도록 바꾼다. ([error-handling.md](./error-handling.md)의 "Fetcher 에러 변환")
- BE 에러를 전달할 때 `ErrorResponse`의 `data` 필드(예: 스케줄 시간 충돌 정보)를 그대로 유지한다. 화면이 이 값으로 분기한다.

## Refresh

refresh는 **브라우저의 `customFetcher`가 401을 받은 뒤** 한다. 브라우저 요청은 생성 요청 함수든 직접 작성한 함수든 모두 `customFetcher`를 거치므로 한곳에서 처리된다. BFF는 BE의 401을 그대로 전달하고, 서버(`proxy.ts` · Server Component)는 refresh하지 않는다. 서버리스 인스턴스끼리 메모리를 공유하지 않아 서버에서는 동시 refresh를 하나로 묶을 수 없다.

```
customFetcher(브라우저) ─▶ BFF ─▶ BE
                       ◀─ 401 TOKEN_EXPIRED
1. refresh: POST /api/auth/refresh (진행 중인 refresh가 있으면 그 결과를 함께 기다린다)
2-a. 성공 → 원래 요청을 1회 재시도
2-b. 실패 → 원래 요청을 1회 재시도 (다른 탭이 이미 refresh했을 수 있다)
3. 재시도도 401 → DELETE /api/auth/session → 로그인 페이지로 이동
```

- refresh 대상은 401 `TOKEN_EXPIRED`뿐이다. 로그인 실패(401 `INVALID_CREDENTIALS`)는 인증 만료가 아니므로 대상에서 뺀다.
- `/api/auth/login`, `/api/auth/refresh`, `/api/auth/session` 요청은 refresh하지 않는다. refresh가 다시 refresh를 부르는 반복을 막기 위해서다.
- **refresh는 탭 안에서 하나로 묶는다(single-flight).** 진행 중인 refresh Promise를 하나 두고, 동시에 401을 받은 요청들이 그 결과를 함께 기다린다. rotation에 유예가 없어 같은 refresh 토큰으로 두 번 보내면 한쪽이 실패한다.
- **refresh 실패를 바로 로그아웃으로 처리하지 않는다.** 쿠키는 모든 탭이 공유하므로, 다른 탭이 먼저 refresh에 성공했다면 브라우저에는 이미 새 쿠키가 있다. 이때 쿠키를 지우면 성공한 탭까지 로그아웃된다. 그래서 BFF refresh 경로는 실패해도 쿠키를 지우지 않고, 클라이언트가 원래 요청을 1회 재시도해 확인한다. 동시 refresh의 500도 같은 실패로 다룬다.
- 재시도까지 401이면 세션 정리 경로로 쿠키를 지운 뒤 이동한다. 무효한 refresh 쿠키가 남으면 `proxy.ts`가 로그인 페이지를 `/dashboard`로 돌려보내 왕복이 생긴다.
- 로그인 페이지 이동은 `window.location.assign`으로 한다. `customFetcher`는 React 밖의 모듈이라 router를 쓸 수 없고, 전체 새로고침으로 쿼리 캐시도 함께 정리된다.
- Server Component의 요청이 401을 받으면 서버에서 처리하지 않는다. prefetch 실패는 클라이언트로 넘어가지 않으므로 클라이언트가 다시 조회하며 위 흐름을 탄다. ([error-handling.md](./error-handling.md)의 "서버 prefetch 실패")
- Fetcher의 일반 재시도 금지 규칙과의 관계는 [error-handling.md](./error-handling.md)의 "retry" 참고.

## 로그인 상태 판단

- JS가 쿠키를 읽을 수 없으므로 "토큰이 있으면 로그인 상태"로 판단하지 않는다. 사용자 정보는 `/me` 조회로 얻는다.
- 보호 페이지 접근은 `proxy.ts`에서 **refresh 쿠키** 존재 여부로 1차 판단해 로그인 페이지로 리다이렉트한다. refresh 쿠키가 세션을 이어갈 수 있는지를 나타내기 때문이다. 토큰의 실제 유효성은 BE가 판단한다.
- refresh 쿠키가 있는 사용자가 `/login`·`/signup`에 들어오면 `/dashboard`로 리다이렉트한다.

## 보안

- **XSS**: 토큰은 JS에 노출되지 않는다. 다만 XSS가 생기면 사용자 권한으로 BFF를 호출할 수는 있으므로 XSS 대응 자체는 계속 필요하다.
- **CSRF**: `SameSite=Lax`에 더해, BFF는 상태 변경 메서드(POST/PUT/PATCH/DELETE)의 `Origin` 헤더가 자기 origin인지 검사한다.

## 제약

- BFF를 거치는 요청 body는 4MB를 넘을 수 없다. Vercel Functions는 4.5MB, Routing Middleware(`proxy.ts`)는 4MB가 한도다.
- 첨부파일(파일당 10MB) 업로드는 BFF를 거치지 않는 방식이 필요하다. 아래 "결정 대기 항목" 참고.
- 첨부파일 다운로드는 범용 통과 경로로 처리한다. BE의 `downloadUrl`(`/api/staff/{staffId}/attachments/{attachmentId}`)은 BFF 경로와 같아서 `<img src>`·`<a href>`에 그대로 쓰면 쿠키로 인증된다. 응답은 스트리밍이라 응답 크기 제한을 받지 않는다.

## 결정 대기 항목

| 항목            | 내용                                                                                                                                                                                                                                                                                                                                                                                                                                 | 상태      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| 다중 탭 refresh | refresh는 탭 안에서만 하나로 묶는다. 탭 사이에서도 묶을지(Web Locks API 등)는 실제 충돌 빈도를 보고 정한다                                                                                                                                                                                                                                                                                                                           | 결정 필요 |
| 소셜 로그인     | FE가 소셜 SDK에서 받은 인가 코드를 인증 전용 경로로 보내고, BFF가 BE `POST /api/oauth/{provider}`를 호출한다. 기존 회원은 토큰을 쿠키로 저장하고, 신규 회원은 `tempToken`(30분, 추가 정보 입력에만 사용)을 받는다. 추가 정보 제출(`PATCH /api/users/signup/additional-info`)도 `tempToken`을 Bearer로 보내고 정식 토큰을 받으므로 인증 전용 경로로 둔다. `tempToken` 보관 방식(예: 30분짜리 httpOnly 쿠키)과 `/onboarding` 진입 처리 | 결정 필요 |
| 첨부파일 전송   | presigned URL로 저장소에 직접 업로드할지. BE 저장소와 API 변경에 종속                                                                                                                                                                                                                                                                                                                                                                | 확인 필요 |
