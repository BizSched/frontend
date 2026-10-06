# 인증 (BFF + httpOnly 쿠키)

## 원칙

인증은 **쿠키 기반**으로 한다. 토큰을 클라이언트 JS에서 직접 다루지 않는다.

BE는 `accessToken` / `refreshToken`을 응답 body로 주고, 보호 API에 `Authorization: Bearer`를 요구한다. 이 둘을 잇기 위해 **Next 서버가 BFF(Backend for Frontend) 역할**을 한다. 토큰은 Next 서버만 알고, 브라우저는 httpOnly 쿠키만 가진다.

```
브라우저 ──(쿠키, same-origin)──▶ Next 서버(BFF) ──(Authorization: Bearer)──▶ BE
                                   ▲ 쿠키 ↔ 토큰 변환은 여기서만 한다
```

## 토큰 쿠키

로그인·refresh 응답의 토큰은 Route Handler가 httpOnly 쿠키로 저장한다. 브라우저로 가는 응답 body에는 토큰을 넣지 않는다.

| 쿠키    | 속성                                                                            |
| ------- | ------------------------------------------------------------------------------- |
| access  | `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=<access 만료>`                 |
| refresh | `HttpOnly; Secure; SameSite=Lax; Path=<아래 결정 대기>; Max-Age=<refresh 만료>` |

## 로그인 · 로그아웃

- **로그인**: 로그인 폼 → 로그인 Route Handler → BE 로그인 API → body의 토큰을 쿠키로 `Set-Cookie`. 브라우저에는 사용자 정보만 돌려준다.
- **로그아웃**: 로그아웃 Route Handler → BE 로그아웃 API로 refresh token 무효화 → 두 쿠키를 `Max-Age=0`으로 삭제.

## 보호 API 호출 경로

| 호출 위치                                               | 경로                                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 서버 (Server Component · Server Action · Route Handler) | `await cookies()`로 access 토큰을 읽어 BE에 `Authorization: Bearer`로 **직접** 요청한다 |
| 브라우저 (Client Component의 TanStack Query 등)         | same-origin BFF 경로로 요청한다. BFF가 쿠키의 토큰을 Bearer 헤더로 붙여 BE로 전달한다   |

- 브라우저는 BE를 직접 호출하지 않는다. JS가 httpOnly 쿠키를 읽을 수 없어 Bearer 헤더를 만들 수 없기 때문이다.
- 브라우저 요청이 모두 same-origin이 되므로 BE CORS 설정과 `credentials: 'include'`가 필요 없다.
- 각 경로를 담당하는 Fetcher 구성은 [data-flow.md](./data-flow.md)의 "API 클라이언트 (Fetcher)" 참고.

## Refresh

Server Component는 렌더링 중 쿠키를 쓸 수 없다. refresh는 쿠키를 쓸 수 있는 **`proxy.ts` · Route Handler · Server Action**에서만 한다.

- 401 처리는 인증 계층이 맡는다. Fetcher·TanStack Query는 401을 재시도하지 않는다. ([error-handling.md](./error-handling.md))
- refresh 시점과 담당 위치는 아래 "결정 대기 항목" 참고.

## 로그인 상태 판단

- JS가 쿠키를 읽을 수 없으므로 "토큰이 있으면 로그인 상태"로 판단하지 않는다. 사용자 정보는 `/me` 조회로 얻는다.
- 보호 페이지 접근은 `proxy.ts`에서 쿠키 존재 여부로 1차 판단해 로그인 페이지로 리다이렉트한다. 토큰의 실제 유효성은 BE가 판단한다.

## 보안

- **XSS**: 토큰은 JS에 노출되지 않는다. 다만 XSS가 생기면 사용자 권한으로 BFF를 호출할 수는 있으므로 XSS 대응 자체는 계속 필요하다.
- **CSRF**: `SameSite=Lax`에 더해, BFF는 상태 변경 메서드(POST/PUT/PATCH/DELETE)의 `Origin` 헤더가 자기 origin인지 검사한다.

## 결정 대기 항목

| 항목                 | 내용                                                                                                                                                                                                                      | 상태      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| refresh 방식         | 선제 refresh(`proxy.ts`가 요청마다 access 만료 임박 여부를 확인해 refresh 후 새 쿠키를 심음. RSC가 항상 유효한 토큰을 받음) + 사후 처리(BE 401 시 refresh 1회 후 재시도, 실패하면 쿠키 삭제 후 로그인 페이지로) 조합 여부 | 결정 필요 |
| BE base URL 환경변수 | 브라우저가 BE를 직접 호출하지 않으므로 `NEXT_PUBLIC_` 없이 서버 전용으로 선언할지 ([env.md](./env.md))                                                                                                                    | 결정 필요 |
| BFF 전달 방식        | `proxy.ts` rewrite(요청 헤더 추가, 코드가 짧고 body 스트리밍) vs catch-all Route Handler(401 → refresh → 재시도 같은 세밀한 제어 가능). 사후 refresh 재시도는 Route Handler 방식에서만 가능하다                           | 결정 필요 |
| refresh 쿠키 `Path`  | `proxy.ts`에서 refresh하면 `/`, Route Handler에서만 하면 refresh 경로로 좁힌다. refresh 방식·BFF 전달 방식에 종속                                                                                                         | 결정 필요 |
| 만료 시각 확인 방법  | access JWT payload를 서버에서 디코드 vs 만료 시각만 담은 별도 쿠키. 선제 refresh를 할 때만 필요                                                                                                                           | 결정 필요 |
| 소셜 로그인 콜백     | OAuth 콜백을 Route Handler에서 받아 토큰을 쿠키로 저장하는 흐름. BE OAuth 설계에 종속                                                                                                                                     | 확인 필요 |
| BE 확인 사항         | access / refresh 만료 시간, refresh token rotation 여부와 유예 시간(동시 요청·다중 탭에서 중복 refresh 시 로그아웃 위험), 로그아웃 API 유무, 401 응답의 만료/무효 구분 errorCode                                          | 확인 필요 |
