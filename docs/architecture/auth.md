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
- 로그아웃 후 클라이언트는 `queryClient.clear()`로 이전 사용자 캐시를 지우고, 전체 새로고침(`window.location.assign`)으로 로그인 페이지에 간다. 클라이언트 이동은 라우터 캐시를 남겨 뒤로가기로 이전 화면이 보일 수 있다.
- 로그인 성공 후에도 `queryClient.clear()`로 캐시를 지운다. 뒤로가기로 돌아온 로그인 화면에서 다른 계정으로 로그인하면 이전 사용자의 캐시가 남기 때문이다.
- **회원 탈퇴**(`DELETE /api/users/me`)는 범용 통과 경로로 부른다. 범용 통과는 쿠키를 지우지 않으므로, 탈퇴에 성공하면 클라이언트가 세션 정리 경로를 호출한 뒤 로그아웃과 같이 정리한다.

## 소셜 로그인

카카오·구글은 같은 흐름을 `provider`(`kakao`·`google`)로 나눠 처리한다. 인가 요청부터 토큰 저장까지 BFF가 맡고, 브라우저는 리다이렉트만 따라간다. SDK를 쓰지 않는다. 인가 코드를 브라우저 JS가 다루지 않고, `state`·PKCE 값을 httpOnly 쿠키로 둘 수 있다.

```
소셜 버튼 ─▶ GET /api/oauth/{provider}/authorize (BFF)
             state·code_verifier 생성 → 임시 쿠키 저장 → 제공자 로그인 페이지로 이동
제공자 ─▶ GET /oauth/{provider}?code&state (BFF 콜백)
             state 검증 → 임시 쿠키 삭제 → BE POST /api/oauth/{provider} (authorizationCode, codeVerifier)
             ├─ 기존 회원: 정식 토큰 쿠키 저장 → /dashboard
             ├─ 신규 회원: temp_token 쿠키 저장 → /onboarding
             └─ 실패: 토큰 저장 없이 → /login?socialError={errorCode}
/onboarding 제출 ─▶ PATCH /api/users/signup/additional-info (BFF, tempToken을 Bearer로)
             성공: temp_token 삭제 → 정식 토큰 쿠키 저장 → /dashboard
```

### BE 계약

| 항목           | 내용                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 계정 식별      | 이메일이 아니라 (제공자, 소셜 계정 id)로 찾는다. 같은 이메일이라도 자동으로 연결하지 않는다. 계정 연결 기능은 아직 없다                                                                                                               |
| 1단계 요청     | `POST /api/oauth/{provider}` — `authorizationCode`, `codeVerifier`(필수). `state`는 BE가 받지 않으므로 BFF가 검증을 끝낸 뒤 부른다. 토큰 없이 부른다                                                                                  |
| 1단계 응답     | 200. `isNewUser`가 `false`면 `accessToken`·`refreshToken`, `true`면 `tempToken`만 채워진다                                                                                                                                            |
| `redirect_uri` | BE 설정값이며 BFF 콜백 주소와 같아야 한다. 다르면 `INVALID_AUTHORIZATION_CODE`. 환경별로 `http://localhost:3000/oauth/{provider}`, `https://bizsched.vercel.app/oauth/{provider}` 두 곳만 등록되어 preview 배포는 지원하지 않는다     |
| `tempToken`    | 30분. 2단계 요청에만 쓰고, 다른 API에 넣으면 401이다. 이 단계에서는 계정이 만들어지지 않는다                                                                                                                                          |
| 2단계 요청     | `PATCH /api/users/signup/additional-info` — `Authorization: Bearer {tempToken}`, body는 `industry`·`industryDetail`·`termsAgreed`. 규칙과 업종 값(`RESTAURANT`·`CAFE`·`BAKERY`·`PUB`·`CONVENIENCE_STORE`·`CUSTOM`)은 일반 가입과 같다 |
| 2단계 응답     | 200. 계정이 만들어지고 `accessToken`·`refreshToken`이 발급된다                                                                                                                                                                        |
| refresh 수명   | 1일. 자동 로그인을 끈 일반 로그인과 같다                                                                                                                                                                                              |

| 상황                                     | 응답                                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 처음 보는 소셜 계정 + 이미 쓰이는 이메일 | 409 `SOCIAL_EMAIL_CONFLICT`. 토큰·임시 토큰 모두 없다. `data.joinType`(`EMAIL`·`KAKAO`·`GOOGLE`)이 기존 계정의 가입 방법이다 |
| 이메일을 받지 못함                       | 400 `OAUTH_EMAIL_REQUIRED`. 카카오 이메일 제공 미동의, 인증되지 않은 이메일. 가입할 수 없다                                  |
| 인가 코드 교환 실패                      | `INVALID_AUTHORIZATION_CODE`. status는 명세에 없다. 콜백은 status와 관계없이 같은 실패로 처리한다                            |
| 2단계 임시 토큰 없음·만료·잘못됨         | 401 `INVALID_TEMP_TOKEN`. 원인을 나누지 않는다                                                                               |
| 2단계 중복·동시 제출                     | 계정은 하나만 만들어진다. 먼저 끝난 요청이 200, 나머지는 토큰 없이 409 `SOCIAL_ACCOUNT_ALREADY_REGISTERED`                   |
| 2단계 사이 같은 이메일로 다른 계정 가입  | 409 `SOCIAL_EMAIL_CONFLICT`                                                                                                  |

### 임시 쿠키

| 쿠키                  | 값               | 속성                                                                  |
| --------------------- | ---------------- | --------------------------------------------------------------------- |
| `oauth_state`         | `state`          | `HttpOnly; Secure; SameSite=Lax; Path=/oauth/{provider}; Max-Age=600` |
| `oauth_code_verifier` | PKCE 원문        | `HttpOnly; Secure; SameSite=Lax; Path=/oauth/{provider}; Max-Age=600` |
| `temp_token`          | BE의 `tempToken` | `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1800`                |

- `oauth_state`·`oauth_code_verifier`는 `Path`를 콜백 경로로 좁힌다. 콜백에만 전송되고, 시작한 제공자의 콜백에서만 읽혀 제공자가 섞이지 않는다.
- 두 값은 인가 요청을 시작할 때마다 새로 만들고, 콜백에서 결과와 관계없이 삭제해 한 번만 쓴다. 10분은 제공자 로그인 화면에 머무는 시간을 감안한 값이다.
- `SameSite=Lax`여도 제공자에서 돌아오는 최상위 GET 이동에는 쿠키가 전송된다.
- `temp_token`은 BE `tempToken`과 같은 30분이다. `Path=/`는 `proxy.ts`(`/onboarding`)와 2단계 BFF 경로(`/api/users/...`)가 모두 읽기 때문이다.
- `Secure`는 정식 토큰 쿠키와 같이 production에서만 켠다.

### 인가 요청

- `state`와 `code_verifier`는 `crypto`의 난수 32바이트를 base64url로 만든다. `code_challenge`는 `code_verifier`의 SHA-256을 base64url로 만든 값이고, `code_challenge_method`는 `S256`이다.
- 제공자 인가 주소는 카카오 `https://kauth.kakao.com/oauth/authorize`, 구글 `https://accounts.google.com/o/oauth2/v2/auth`다. `response_type=code`, `client_id`, `redirect_uri`, `state`, `code_challenge`, `code_challenge_method`를 넣는다.
- 구글은 `scope=openid email profile`을 넣는다. 카카오는 콘솔의 동의 항목(이메일·닉네임)을 따른다.
- `client_id`(카카오 REST API 키·구글 클라이언트 ID)와 콜백 origin은 서버 환경 변수 `KAKAO_CLIENT_ID`·`GOOGLE_CLIENT_ID`·`OAUTH_REDIRECT_ORIGIN`으로 둔다. `redirect_uri`는 BE 설정값과 정확히 같아야 하므로 요청 origin으로 만들지 않는다. client secret은 BE만 갖는다.
- `provider`가 `kakao`·`google`이 아니면 404를 돌려준다.

### 콜백

콜백은 `app/oauth/[provider]/route.ts`의 Route Handler다. `redirect_uri`가 `/oauth/{provider}`로 정해져 있고, 쿠키를 저장한 뒤 리다이렉트해야 하는데 page는 쿠키를 저장할 수 없다.

| 결과                                                | 처리                                                                                            |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 쿼리 `error`가 있음 (동의 화면에서 취소 등)         | BE를 부르지 않고 `/login`으로 이동한다. 사용자가 직접 취소한 경우라 문구를 보여주지 않는다      |
| `state` 불일치·쿠키 없음, `code` 없음               | BE를 부르지 않고 `/login?socialError=BFF_INVALID_OAUTH_STATE`로 이동한다                        |
| `isNewUser: false`                                  | 정식 토큰을 `autoLogin: false` 수명으로 저장하고 `temp_token`을 지운 뒤 `/dashboard`로 이동한다 |
| `isNewUser: true`                                   | `temp_token`을 저장하고 `/onboarding`으로 이동한다                                              |
| 409 `SOCIAL_EMAIL_CONFLICT`                         | `/login?socialError=SOCIAL_EMAIL_CONFLICT&joinType={data.joinType}`로 이동한다                  |
| 그 밖의 BE 에러·BFF 실패(timeout·응답 검증 실패 등) | `/login?socialError={errorCode}`로 이동한다                                                     |

- 모든 결과에서 `oauth_state`·`oauth_code_verifier`를 삭제한다.
- 생성 zod(`LoginResponse`)는 세 토큰을 모두 `nullish`로 둔다. `isNewUser`가 `false`인데 `accessToken`·`refreshToken`이 비었거나, `true`인데 `tempToken`이 비었으면 BE 응답 검증 실패(`BFF_INVALID_UPSTREAM_RESPONSE`)로 보고 쿠키를 저장하지 않는다.
- 콜백은 브라우저가 이동해 오는 GET이라 JSON 에러 응답을 돌려주지 않고 리다이렉트로 끝낸다. 실패를 `withBffHandler`의 에러 응답으로 바꾸지 않는다.
- 소셜 로그인에는 자동 로그인 선택이 없다. BE refresh 수명(1일)에 맞춰 세션 쿠키로 저장한다.
- 이동은 303으로 한다. 이동한 페이지를 GET으로 연다.

### 2단계 제출

- 브라우저는 인증 전용 경로 `PATCH /api/users/signup/additional-info`를 `customFetcher`로 부른다. BFF가 `temp_token`을 Bearer로 붙여 BE에 보낸다.
- `temp_token`이 없으면 BE를 부르지 않고 401 `INVALID_TEMP_TOKEN`을 돌려준다.
- 성공하면 `temp_token`을 지우고 정식 토큰을 `autoLogin: false` 수명으로 저장한다. 브라우저에는 토큰을 뺀 사용자 정보(`id`, `email`, `industry`, `industryDetail`)만 돌려준다.
- 401 `INVALID_TEMP_TOKEN`, 409 `SOCIAL_ACCOUNT_ALREADY_REGISTERED`·`SOCIAL_EMAIL_CONFLICT`면 `temp_token`을 지우고 에러를 전달한다. 같은 임시 토큰으로는 다시 성공할 수 없다.
- 400(`REQUIRED_TERMS_NOT_AGREED` 등 입력 오류)이면 `temp_token`을 유지한다. 입력을 고쳐 다시 제출할 수 있다.
- `INVALID_TEMP_TOKEN`은 `TOKEN_EXPIRED`가 아니므로 `customFetcher`가 refresh하지 않는다.
- 화면 처리는 [onboarding.md](../feature/auth/onboarding.md) 참고.

### 실패 안내

콜백·2단계에서 다시 소셜 로그인부터 해야 하는 실패는 `/login?socialError={errorCode}`로 보내고, 로그인 화면이 문구를 보여준다. 문구와 위치는 [login.md](../feature/auth/login.md) 참고.

- 쿼리 값은 누구나 만들 수 있으므로 정해진 errorCode·`joinType`만 문구로 바꾸고, 그 외 값은 공통 실패 문구로 보여준다. 쿼리 값을 화면에 그대로 출력하지 않는다.

## 보호 API 호출 경로

| 호출 위치                                               | 경로                                                                                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 서버 (Server Component · Server Action · Route Handler) | 인증 헤더 헬퍼로 쿠키의 access 토큰을 `Authorization: Bearer` 헤더로 만들어 `customFetcher`에 넘기고, BE에 **직접** 요청한다 |
| 브라우저 (Client Component의 TanStack Query 등)         | same-origin BFF 경로로 요청한다. BFF가 쿠키의 토큰을 Bearer 헤더로 붙여 BE로 전달한다                                        |

- 브라우저는 BE를 직접 호출하지 않는다. JS가 httpOnly 쿠키를 읽을 수 없어 Bearer 헤더를 만들 수 없기 때문이다.
- 브라우저 요청이 모두 same-origin이 되므로 BE CORS 설정과 `credentials: 'include'`가 필요 없다.
- `customFetcher`와 인증 헤더 헬퍼 구성은 [data-flow.md](./data-flow.md)의 "API 클라이언트 (Fetcher)" 참고.

## BFF 경로

BFF 경로는 두 종류로 나눈다. 소셜 로그인 콜백(`app/oauth/[provider]/route.ts`)을 빼면 모두 `app/api/` 아래의 Route Handler다. 콜백 주소는 BE의 `redirect_uri` 설정을 따른다.

| 종류      | 경로                                     | 역할                                         | 응답                                                             |
| --------- | ---------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| 인증 전용 | 아래 표                                  | 토큰 ↔ 쿠키 변환                             | BE 응답에서 토큰만 뺀 부분. 변환은 API 함수의 Formatter가 맡는다 |
| 범용 통과 | `app/api/[...path]/route.ts` (catch-all) | 쿠키의 access 토큰을 Bearer 헤더로 붙여 전달 | BE 응답 그대로. 변환은 API 함수의 Formatter가 맡는다             |

| 인증 전용 경로                            | BE API                                    | 동작                                                                                                                                                                                                                            |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/login`                    | `POST /api/auth/login`                    | 토큰·`autoLogin`을 쿠키로 저장하고 사용자 정보만 돌려준다                                                                                                                                                                       |
| `POST /api/auth/refresh`                  | `POST /api/auth/refresh`                  | refresh 쿠키를 body로 보내고, 성공하면 두 토큰을 `auto_login`에 맞는 수명으로 다시 저장하고 204를 돌려준다. 실패하면 쿠키를 그대로 두고 실패를 전달한다. refresh 쿠키가 없으면 BE를 호출하지 않고 401 `UNAUTHORIZED`를 돌려준다 |
| `POST /api/auth/logout`                   | `POST /api/auth/logout`                   | 성공하면 쿠키를 삭제한다. BE가 401을 주면 쿠키를 그대로 두고 401을 전달한다                                                                                                                                                     |
| `DELETE /api/auth/session`                | 없음                                      | BE를 호출하지 않고 쿠키만 삭제한다. refresh까지 실패했을 때 클라이언트가 호출한다                                                                                                                                               |
| `GET /api/oauth/{provider}/authorize`     | 없음                                      | `state`·PKCE 임시 쿠키를 저장하고 제공자 인가 주소로 리다이렉트한다 ("소셜 로그인"의 "인가 요청")                                                                                                                               |
| `GET /oauth/{provider}`                   | `POST /api/oauth/{provider}`              | `state`를 검증하고 결과에 따라 쿠키를 저장한 뒤 리다이렉트한다 ("소셜 로그인"의 "콜백")                                                                                                                                         |
| `PATCH /api/users/signup/additional-info` | `PATCH /api/users/signup/additional-info` | `temp_token`을 Bearer로 보내고, 성공하면 정식 토큰을 저장하고 사용자 정보만 돌려준다 ("소셜 로그인"의 "2단계 제출")                                                                                                             |

- 소셜 인가 시작 경로는 BE의 `/api/oauth/{provider}`와 계약이 달라(BE 호출 없이 리다이렉트) 같은 경로를 쓰지 않고 `/authorize`를 붙인다.

- 범용 통과 경로는 catch-all Route Handler로 한다. BE `Set-Cookie` 제거와 BFF 에러 정규화는 `proxy.ts` rewrite로 구현할 수 없다.
- 데이터 집계·가공은 BFF에서 하지 않는다. 서버 렌더링 경로와 브라우저 경로가 같은 DTO를 받아야 Formatter를 공유할 수 있다.
- BFF 경로는 BE 경로와 같게 둔다. orval이 생성한 요청 함수의 URL(`/api/...`)이 그대로 BFF 경로가 되어, 인증 외 API는 브라우저에서 생성 함수를 그대로 쓸 수 있다. `/api/`로 시작하지 않는 `/health`는 BFF로 열지 않고 서버에서만 부른다.

### 생성 함수와 BFF

orval이 생성한 auth·oauth 요청 함수(`login1`, `refresh`, `logout`, oauth의 `login`, `completeSignup`)는 BE 계약 그대로다. 로그인 응답에 토큰이 있고, refresh 요청 body에 refresh 토큰이 필요하다. 브라우저용 BFF 계약과 다르므로 아래처럼 나눈다.

| 위치                                            | 쓰는 것                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| BFF Route Handler (인증 전용 경로)              | 생성 요청 함수와 생성 zod 스키마를 직접 쓴다. 토큰이 든 원래 응답이 필요하므로 `entities`를 거치지 않는다     |
| 브라우저용 인증 함수 (`lib/api/entities/auth/`) | 생성 요청 함수를 쓰지 않고 BFF 경로를 `customFetcher`로 직접 부른다. 응답은 생성 zod 스키마의 일부로 검증한다 |

- 생성된 auth 요청 함수는 브라우저에서 쓰지 않는다. 경로는 BFF와 같지만 계약이 다르다.

### 범용 통과 규칙

- 요청이나 응답에 토큰이 오가는 경로는 전달하지 않는다. 인증 전용 핸들러를 거치지 않으면 토큰이 담긴 BE 응답이 브라우저로 나간다. 대상은 `auth/*`, `oauth/*`, `users/signup/additional-info`(소셜 가입 마무리. 응답에 토큰이 있고 요청에 `tempToken`이 필요하다)다. BE에 이런 경로가 추가되면 이 목록에 더한다.
  - `users/signup`(일반 가입)은 응답에 토큰이 없어 전달한다. `users/signup/additional-info`는 정확히 일치할 때만 막는다.
  - 차단 검사는 대소문자를 구분하지 않는다. BE 경로 매칭 설정이 바뀌어도 우회되지 않게 한다.
  - 경로 세그먼트에 `/`·`\`가 들어 있으면 전달하지 않는다. Next는 `%2F`를 디코딩해 세그먼트 하나로 넘기므로(`auth%2Flogin` → `['auth/login']`) 차단 검사를 지나친 뒤 BE에서 `auth/login`으로 해석될 수 있다. `.`·`..` 세그먼트는 Next가 라우팅 전에 정규화한다.
  - BE URL은 세그먼트마다 `encodeURIComponent`로 다시 인코딩해 만든다. Next가 한 번 디코딩한 값(`%3F` → `?`, `%252F` → `%2F`)을 그대로 이으면 쿼리나 경로 구분자로 바뀐다.
  - 전달하지 않는 경로는 BE를 호출하지 않고 404 `BFF_PATH_NOT_ALLOWED`를 돌려준다.
- 요청 헤더는 `Content-Type`, `Accept`, `Accept-Language`만 전달하고 `Authorization`을 붙인다. 브라우저의 `Cookie`, `Host`, `Origin`, `Authorization`은 BE로 보내지 않는다. 빠뜨린 헤더가 새지 않도록 제거 목록이 아니라 허용 목록으로 둔다.
- BE에는 `Accept-Encoding: identity`를 보낸다. Node `fetch`는 기본으로 `Accept-Encoding: gzip, deflate`를 보내고, 압축 응답을 자동으로 풀면서 `Content-Encoding`·`Content-Length`(압축 크기)는 그대로 남긴다. 그대로 전달하면 브라우저가 풀린 본문을 다시 풀려다 실패하거나, 본문이 압축 크기에서 잘린다. 압축하지 않은 응답을 받으면 `Content-Length`가 유지되어 다운로드 진행률도 보인다. 브라우저 구간 압축은 배포 환경 CDN이 맡는다.
- BE 응답의 `Set-Cookie`와 hop-by-hop 헤더(`Connection`, `Keep-Alive`, `Proxy-Connection`, `TE`, `Transfer-Encoding`, `Upgrade`, `Trailer`, `Proxy-Authenticate`, `Proxy-Authorization`, `Connection`에 적힌 헤더)는 제거한다. BE 쿠키가 우리 도메인 쿠키로 저장되면 인증 쿠키를 덮어쓸 수 있다.
- BE가 `identity`를 무시하고 압축 응답을 주면 `Content-Encoding`과 `Content-Length`를 제거한다. 본문은 이미 풀려 있다.
- 요청·응답 body는 스트림으로 전달한다. 응답을 버퍼링하면 배포 환경의 응답 크기 제한(4.5MB)에 걸린다. `GET`·`HEAD`에는 body를 넣지 않는다.
  - 스트림 요청 body는 `Content-Length` 없이 `Transfer-Encoding: chunked`로 전송된다. 요청 `Content-Length`는 허용 목록에 넣지 않는다.
- BE 요청 timeout은 응답 헤더를 받을 때까지만 건다(10초, 서버 요청 기준과 같다). body 전송 중에 timeout을 걸면 큰 첨부파일 다운로드가 중간에 끊긴다. body 전송 시간은 배포 환경의 함수 최대 실행 시간이 제한한다.
- 브라우저가 요청을 취소하면 BE 요청도 취소한다.
- BE 응답은 status와 body를 바꾸지 않고 전달한다. 4xx·5xx도 그대로이며, 해석은 브라우저의 `customFetcher`가 맡는다.
  - redirect 응답도 자동으로 따라가지 않는다(`redirect: 'manual'`). 다른 경로를 호출하지 않고 BE의 3xx 응답을 그대로 전달한다.
- access 쿠키가 없으면 헤더 없이 전달한다. 401 판단은 BE가 한다.
- 응답은 캐시하지 않는다(`cache: 'no-store'`). 사용자마다 토큰이 다르다.
- `HEAD`·`OPTIONS`는 열지 않는다. same-origin이라 CORS preflight가 없다.
  - Next의 자동 메서드 구현을 막기 위해 두 메서드를 명시적으로 405로 처리하고, `Allow`에는 `GET, POST, PUT, PATCH, DELETE`를 넣는다.

### 범용 통과 구현 · 검증

- `app/api/[...path]/route.ts`: `GET`·`POST`·`PUT`·`PATCH`·`DELETE` 진입점. `withBffHandler`가 상태 변경 요청의 Origin을 검사하고 실패를 BFF 에러 응답으로 변환한다.
- `src/lib/api/bff/proxyRequest.ts`: 경로 차단, URL 재인코딩, 헤더 필터링, 쿠키 기반 인증 헤더와 요청·응답 스트림 전달을 담당한다. JSON 파싱이나 DTO 검증은 하지 않는다.
- 스트림 요청에는 Node `fetch`가 요구하는 `duplex: 'half'`를 넣는다. 응답 헤더를 받으면 timeout 타이머를 해제하고, 요청 취소 signal은 응답 body 전송 중에도 유지한다.
- `test/app/api/[...path]/route.test.ts`와 `test/lib/api/bff/proxyRequest.test.ts`에서 메서드·Origin, 경로 차단 우회, 요청 헤더 허용 목록, 응답 쿠키·hop-by-hop 헤더 제거, status·body 보존, timeout·취소를 검증한다. 로컬 HTTP 서버를 사용해 실제 Node `fetch`의 chunked 업로드와 압축 응답 처리도 검증한다.
- BE 설정과 Vercel 배포 환경의 압축·다운로드 검증은 아래 "결정 대기 항목"으로 유지한다.

참고: [Next.js Route Handler](https://nextjs.org/docs/app/api-reference/file-conventions/route), [Node Undici의 스트림 요청·duplex](https://github.com/nodejs/undici#requestduplex).

## BFF 응답 · 에러 계약

BFF의 실패 응답은 모두 BE `ErrorResponse`와 같은 `{ code, message, errorCode }` 형태로 돌려준다. `customFetcher`가 BE 응답과 같은 방식으로 에러를 변환할 수 있게 하기 위해서다.

| 상황                             | status       | errorCode                       |
| -------------------------------- | ------------ | ------------------------------- |
| BE 에러 응답                     | BE 값 그대로 | BE 값 그대로                    |
| 상태 변경 요청의 `Origin` 불일치 | 403          | `BFF_INVALID_ORIGIN`            |
| 요청 body 검증 실패              | 400          | `VALIDATION_ERROR`              |
| 범용 통과로 전달하지 않는 경로   | 404          | `BFF_PATH_NOT_ALLOWED`          |
| refresh 요청에 refresh 쿠키 없음 | 401          | `UNAUTHORIZED`                  |
| 소셜 2단계 요청에 임시 쿠키 없음 | 401          | `INVALID_TEMP_TOKEN`            |
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
- 공개 페이지는 `/`, `/login`, `/signup`과 소셜 로그인 콜백 `/oauth/{provider}`이고, 그 밖의 페이지는 모두 보호 페이지다. 새 페이지가 기본으로 보호되도록 보호 목록이 아니라 공개 목록을 둔다. 공개 페이지를 추가하면 `getAuthRedirectPath`의 목록에 넣는다.
  - 콜백은 로그인 여부와 관계없이 실행되어야 해서 `/login`·`/signup`과 달리 refresh 쿠키가 있어도 `/dashboard`로 보내지 않는다. `/oauth/` 아래 경로를 접두사로 판단한다.
- `/onboarding`은 `temp_token` 쿠키로 판단한다. 쿠키가 없으면 refresh 쿠키가 있을 때 `/dashboard`, 없을 때 `/login`으로 리다이렉트한다. 쿠키가 있어도 유효성은 BE가 2단계 요청에서 판단한다.
- `proxy.ts`는 `/api` 경로와 `_next` 정적 파일, 확장자가 있는 파일(`public/` 등)에서는 실행하지 않는다. BFF 경로는 Route Handler가 직접 판단한다.

## 보안

- **XSS**: 토큰은 JS에 노출되지 않는다. 다만 XSS가 생기면 사용자 권한으로 BFF를 호출할 수는 있으므로 XSS 대응 자체는 계속 필요하다.
- **CSRF**: `SameSite=Lax`에 더해, BFF는 상태 변경 메서드(POST/PUT/PATCH/DELETE)의 `Origin` 헤더가 자기 origin인지 검사한다.

## 제약

- BFF를 거치는 요청 body는 4MB를 넘을 수 없다. Vercel Functions는 4.5MB, Routing Middleware(`proxy.ts`)는 4MB가 한도다.
- 첨부파일(BE 기준 파일당 10MB)은 업로드 전에 FE에서 크기를 줄여 이 한도 안에서 BFF로 보낸다. 방식은 [아르바이트 도메인 문서 설계 결정](../feature/partTime/README.md#설계-결정)
- 첨부파일 다운로드는 범용 통과 경로로 처리한다. BE의 `downloadUrl`(`/api/staff/{staffId}/attachments/{attachmentId}`)은 BFF 경로와 같아 쿠키로 인증된다. 미리보기는 생성 다운로드 함수에 `responseType: 'blob'`을 넘겨 `customFetcher`로 받는다. `<img src>`·`iframe src`에 API URL을 직접 넣으면 토큰 만료 시 refresh할 수 없으므로, 성공한 Blob의 임시 URL을 사용하고 파일 교체·닫기 때 해제한다. BFF 응답은 스트리밍이며, `Content-Disposition`은 아래 MIME 기준으로 설정한다(파일명 유지).
- 성공한 첨부파일 GET의 `inline`은 `application/pdf`·`image/jpeg`·`image/png`·`image/webp`만 허용한다(WebP 추가 2026-10-17). 그 외 형식은 upstream이 `inline`이어도 `attachment`로 강제하며, disposition이 없어도 설정한다. 파일명 파라미터는 유지하고 `X-Content-Type-Options: nosniff`를 함께 전달한다. Blob 미리보기도 실제 다운로드 응답의 MIME을 같은 허용 목록으로 검증한 후에만 임시 URL로 만든다. 상세 DTO와 새 업로드에서도 SVG 등 목록 밖의 MIME은 미리보기 대상으로 받지 않는다.

## 결정 대기 항목

| 항목               | 내용                                                                                                                                                                                                                                       | 상태      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| 다중 탭 refresh    | refresh는 탭 안에서만 하나로 묶는다. 탭 사이에서도 묶을지(Web Locks API 등)는 실제 충돌 빈도를 보고 정한다                                                                                                                                 | 결정 필요 |
| 소셜 가입 업종 값  | 업종 값은 일반 가입과 같은 6개로 정했다. Swagger의 2단계 요청(`CompleteSignupBody`)만 `RETAIL`·`BEAUTY`·`ACADEMY`로 남아 있어, 생성 zod로 요청을 검증하면 `BAKERY`·`PUB`·`CONVENIENCE_STORE`가 거부된다. BE 명세 수정을 확인한다           | 확인 필요 |
| 범용 통과 압축     | Vercel CDN은 JSON 등 정해진 MIME 타입 응답을 압축한다. 스트리밍 Route Handler 응답에도 적용되는지 배포 후 응답 헤더(`Content-Encoding`)로 확인한다. 적용되지 않으면 BE와 Next 사이만 압축을 받는 방식(BE 압축 허용 + 헤더 제거)과 비교한다 | 확인 필요 |
| BE 응답 압축       | BE가 `Accept-Encoding: identity`를 따르는지, 응답 압축(`server.compression.enabled`)을 켰는지, `Content-Length` 없는 chunked 요청 body를 받는지 BE에 확인한다                                                                              | 확인 필요 |
| 스트리밍 응답 크기 | Vercel 문서는 함수 요청·응답 body 한도를 4.5MB로 적고, 스트리밍 응답은 이 한도를 받지 않는다고 가이드에서 안내한다. 10MB 첨부파일 다운로드를 배포 환경에서 확인한다                                                                        | 확인 필요 |
