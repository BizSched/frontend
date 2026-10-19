# 인증 기능 문서

## 개요

로그인, 회원가입, 소셜 로그인 후 추가 정보 입력을 다룬다. 서비스 이용에 필요한 **업종**과 **약관 동의**는 가입 경로와 무관하게 모든 회원에게서 받는다.

## 주요 화면 / 플로우

| 경로          | 화면                | 문서                             |
| ------------- | ------------------- | -------------------------------- |
| `/login`      | 로그인              | [login.md](./login.md)           |
| `/signup`     | 일반 회원가입       | [signup.md](./signup.md)         |
| `/onboarding` | 소셜 가입 추가 정보 | [onboarding.md](./onboarding.md) |

```
로그인:       /login → /dashboard
일반 가입:    /signup (계정 정보 + 업종 + 약관) → /login
소셜 로그인:  카카오·구글 → /dashboard (가입된 소셜 계정)
소셜 가입:    카카오·구글 → /onboarding (업종 + 약관) → /dashboard (처음 보는 소셜 계정)
```

일반 가입은 회원가입 화면에서 업종과 약관을 함께 받는다. 소셜 가입은 회원가입 화면을 거치지 않으므로 같은 항목을 `/onboarding`에서 받는다.

일반 가입은 가입 응답에 토큰이 없어 로그인 페이지로 보낸다. 소셜 가입은 추가 정보 제출 응답으로 토큰을 받으므로 바로 `/dashboard`로 간다.

로그인·회원가입 화면의 소셜 버튼은 같은 흐름이다. 가입 여부는 BE가 판단한다. 처음 보는 소셜 계정인데 이메일이 이미 다른 방법으로 가입되어 있으면 연결하지 않고 기존 로그인 방법을 안내한다. 흐름·쿠키·에러는 [auth.md](../../architecture/auth.md)의 "소셜 로그인" 참고.

## API 명세

BE 명세는 Swagger(`/v3/api-docs`)가 기준이다. 토큰 규칙과 BFF 경로는 [auth.md](../../architecture/auth.md), 가입 API는 [signup.md](./signup.md#api) 참고.

| 동작             | BE API                                    | BFF 경로                                                             | 요청                                                                       | 응답                                                                                |
| ---------------- | ----------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 로그인           | `POST /api/auth/login`                    | `POST /api/auth/login`                                               | `email`, `password`, `autoLogin`                                           | BFF는 토큰을 쿠키로 저장하고 `user`(`id`, `email`, `name`)만 돌려준다               |
| 로그아웃         | `POST /api/auth/logout`                   | `POST /api/auth/logout`                                              | 없음 (access 토큰 필요)                                                    | 200 + 빈 body. BFF는 쿠키를 삭제하고 204                                            |
| 소셜 로그인      | `POST /api/oauth/{provider}`              | `GET /api/oauth/{provider}/authorize` → 콜백 `GET /oauth/{provider}` | 브라우저는 이동만 한다. BFF가 `authorizationCode`, `codeVerifier`를 보낸다 | BFF가 토큰 또는 `tempToken`을 쿠키로 저장하고 리다이렉트한다                        |
| 소셜 가입 마무리 | `PATCH /api/users/signup/additional-info` | 같은 경로                                                            | `industry`, `industryDetail`, `termsAgreed` (`tempToken` 필요)             | BFF는 토큰을 쿠키로 저장하고 `id`, `email`, `industry`, `industryDetail`만 돌려준다 |

- 로그인 실패는 없는 이메일·틀린 비밀번호·소셜 가입 계정 모두 401 `INVALID_CREDENTIALS`다. 화면에는 FE 매핑 문구 "이메일 또는 비밀번호가 일치하지 않습니다. 카카오·구글로 가입하셨다면 소셜 로그인을 이용해 주세요."를 보여준다. 소셜 가입 계정도 같은 응답이라 소셜 로그인을 함께 안내한다.
- BE는 로그인 입력값을 검증하지 않는다. 빈 값·잘못된 이메일 형식도 401 `INVALID_CREDENTIALS`로 응답하므로 형식 검사는 로그인 폼에서 한다.
- 로그아웃 시 access 토큰이 만료되었으면 401 `TOKEN_EXPIRED`, 없거나 잘못되었으면 401 `UNAUTHORIZED`로 응답한다. 처리는 [auth.md](../../architecture/auth.md)의 "로그인 · 로그아웃" 참고.

### 업종

| 값                  | 표시     |
| ------------------- | -------- |
| `RESTAURANT`        | 음식점   |
| `CAFE`              | 카페     |
| `BAKERY`            | 베이커리 |
| `PUB`               | 주점     |
| `CONVENIENCE_STORE` | 편의점   |
| `CUSTOM`            | 직접입력 |

`CUSTOM`을 고르면 직접 입력한 업종명을 `businessTypeCustom` 필드로 받는다. 서버 필드명은 `industryDetail`이다.

## 상태 관리 포인트

| 상태                          | 도구            | 근거                                                      |
| ----------------------------- | --------------- | --------------------------------------------------------- |
| 로그인·회원가입·온보딩 입력값 | React Hook Form | 폼 상태 규칙. 제출 시 필수 약관·업종 검증을 한곳에서 처리 |
| 약관 목록                     | TanStack Query  | 서버 데이터. 서버에서 prefetch해 첫 화면에 바로 보인다    |
| 약관 체크 상태                | React Hook Form | 약관 id별 동의 여부를 `terms` 필드 하나에 객체로 둔다     |
| 약관 전문 모달 열림 상태      | overlay-kit     | 모달 결과(동의 여부)를 `await`로 받아 체크에 반영         |

`TermsAgreement`와 `AuthBusinessTypeField`는 값을 갖지 않는 controlled 컴포넌트다. 두 화면이 같은 컴포넌트를 쓰고, 각 폼이 `Controller`로 값을 연결한다.

## 주요 컴포넌트

| 컴포넌트                | 책임                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `LoginForm`             | 로그인 폼 상태(이메일·비밀번호·자동 로그인), 로그인 실패 인라인 표시, 성공 후 대시보드 이동 |
| `SignupForm`            | 회원가입 폼 상태와 입력 검사, 가입 실패 인라인 표시, 성공 후 로그인 이동                    |
| `OnboardingForm`        | 온보딩 폼 상태와 입력 검사, 가입 마무리 요청, 성공 후 대시보드 이동                         |
| `AuthSocialLogin`       | 카카오·구글 버튼. BFF 인가 시작 경로로 이동하는 링크, 소셜 로그인 실패 문구 표시            |
| `AuthBusinessTypeField` | 업종 드롭다운, `CUSTOM` 선택 시 직접 입력 칸 노출                                           |
| `TermsAgreement`        | 전체 동의와 약관 목록(`GET /api/terms`) 체크, 전문 보기, 조회 실패 시 다시 불러오기         |
| `TermsModal`            | 약관 전문(`content`) 표시. `동의하기`를 누르면 해당 항목을 체크한다                         |

### 약관 체크 규칙

| 동작                 | 결과                                       |
| -------------------- | ------------------------------------------ |
| 전체 동의            | 목록의 모든 약관(필수·선택)을 켜고 끈다    |
| 전문 보기 → 동의하기 | 해당 약관을 체크한다. 닫기·ESC는 변화 없음 |

- 약관 목록·문구·필수 여부·본문은 `GET /api/terms` 응답(`title`, `required`, `content`)을 따른다. 화면에 약관을 하드코딩하지 않는다.
- 마케팅 수신 동의는 체크 하나(선택 약관)다. BE 약관이 수신 수단을 나누지 않는다.

약관 전문은 Form 계열 모달([Modal 설계](../../component/modal/README.md))을 쓴다. 본문이 길어 페이지에 펼치면 가입 폼이 밀려나기 때문이다.

### 필수 항목 검증

- 회원가입·온보딩 모두 제출 버튼은 항상 누를 수 있다. 제출하면 빠지거나 틀린 항목 아래에 문구를 보여준다.
- 업종을 고르지 않으면 업종 필드 아래, 필수 약관에 동의하지 않으면 약관 영역 아래 한 줄로 보여준다.
- 문구는 [signup.md](./signup.md#입력-검사)의 "입력 검사"를 따른다.

## 소셜 로그인 단계별 PR 계획

흐름·쿠키·에러 규칙은 [auth.md](../../architecture/auth.md)의 "소셜 로그인"이 기준이다.

| 단계 | 브랜치                        | 범위                                                                                                                                                                                                                   | 분기  | 상태           |
| ---- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------- |
| 1    | `docs/social-login-design`    | 소셜 로그인 설계(auth.md "소셜 로그인"), 온보딩·로그인 화면 문서, 단계별 PR 계획 (이 섹션)                                                                                                                             | `dev` | PR 대기        |
| 2    | `feat/social-login-bff-utils` | `state`·PKCE(`code_verifier`, S256 `code_challenge`) 생성, 임시 쿠키(`oauth_state`·`oauth_code_verifier`·`temp_token`) 읽기·쓰기·삭제, 정식 토큰 쿠키 저장·삭제 시 `temp_token` 삭제, 공통 쿠키 옵션 분리, 단위 테스트 | 1단계 | 로컬 구현 완료 |
| 3    | `feat/social-login-callback`  | 인가 시작 `GET /api/oauth/{provider}/authorize`, 콜백 `app/oauth/[provider]/route.ts`와 결과별 분기, `/oauth/*` 공개 처리, `AuthSocialLogin` 링크 연결, 로그인 화면 `socialError` 문구, 환경 변수 3종                  | 2단계 |                |
| 4    | `feat/social-onboarding-api`  | 2단계 BFF `PATCH /api/users/signup/additional-info`, `useCompleteSocialSignupMutation`, `OnboardingForm` 연결·실패 처리, `temp_token` 없는 `/onboarding` 진입 차단                                                     | 3단계 |                |

- 2단계부터는 바로 앞 단계 브랜치에서 분기한 stacked PR이고, 앞 단계가 머지되면 base를 `dev`로 바꾼다.
- 4단계는 Swagger의 2단계 요청 업종 enum이 수정된 뒤 진행한다([auth.md](../../architecture/auth.md#결정-대기-항목)의 "소셜 가입 업종 값").

### 3단계에서 할 일

**provider**

- 외부에서 받은 `provider`(경로 파라미터)는 `kakao`·`google` 허용 목록으로 검증한 뒤 쓴다. `as OAuthProvider`로 검증을 대신하지 않는다. 쿠키 `Path`에 그대로 들어가고, Next는 `Path`를 인코딩하지 않는다.
- 검증에 실패하면 인가 시작·콜백 모두 404다.
- `OAuthProvider` 타입과 런타임 검증을 `lib/api/bff/oauthProvider.ts`로 옮긴다. 허용 목록은 생성 zod `LoginParams.shape.provider`에서 가져와 출처를 하나로 둔다. 쿠키 함수 안의 추가 검증은 선택이다.

**인가 시작**

- `createOAuthState`·`createCodeVerifier`·`createCodeChallenge`로 값을 만들고 `setOAuthRequestCookies(provider, …)`로 저장한 뒤 리다이렉트한다.

**콜백**

- 아래를 모두 통과해야 BE를 부른다. 하나라도 실패하면 BE를 부르지 않고 `/login?socialError=BFF_INVALID_OAUTH_STATE`로 보낸다.
  - `getOAuthRequestCookies()`가 `null`이 아니다. 빈 값·반쪽 쿠키는 이미 `null`이다.
  - 쿼리 `state`와 `code`가 비어 있지 않다.
  - 쿼리 `state`가 저장된 `state`와 같다. 비교 방식(`===` 또는 `timingSafeEqual`)은 이 단계에서 정한다. `timingSafeEqual`은 길이가 다르면 예외를 던지므로 길이를 먼저 비교한다.
- 쿼리 `error`(동의 취소)는 검증보다 먼저 보고 문구 없이 `/login`으로 보낸다.
- 성공·실패와 관계없이 `clearOAuthRequestCookies(provider)`를 부른다. 삭제는 저장 때와 같은 `Path`여야 한다.
- `isNewUser: false`의 `temp_token` 삭제는 `setAuthCookies`가 맡으므로 콜백에서 따로 부르지 않는다. `isNewUser: true`는 `setTempToken`으로 저장한다.
- 같은 제공자로 동시에 시작하면 마지막 시도의 쿠키만 남아 앞선 시도는 state 불일치로 실패한다. 이 구조를 유지하고, 실패 안내 후 다시 시작하게 한다. auth.md "임시 쿠키"에 명시하고 테스트로 고정한다.
- BE를 부른 뒤 실패하면(409 `SOCIAL_EMAIL_CONFLICT`, 그 밖의 BE 에러·BFF 실패) `clearTempToken()`을 부른다. 쿼리 `error`·검증 실패에서는 부르지 않는다. 외부에서 만든 링크로 진행 중인 온보딩이 지워지지 않게 하기 위해서다([auth.md](../../architecture/auth.md)의 "콜백").
- `BFF_INVALID_OAUTH_STATE`는 공통 실패 문구로 보여준다. `socialError` 매핑에 명시적으로 넣는다([login.md](./login.md)의 "소셜 로그인 실패 안내").

**리다이렉트**

- `NextResponse.redirect(url, 303)`으로 한다. `next/navigation`의 `redirect()`는 Route Handler에서 307이다.
- Next는 Route Handler가 반환한 `Response`에 `cookies()` 변경분을 합친다. 실제 응답에서 아래 "검증"으로 확인한다.

**검증**

- Route Handler 단위 테스트(쿠키 유틸 mock)로 분기를 검증한다. 확인 항목은 다음과 같다.
  - provider 404
  - 검증 실패 시 BE 미호출
  - 모든 결과에서 인가 요청 쿠키 삭제
  - BE 호출 후 실패에서 `temp_token` 삭제, 쿼리 `error`·검증 실패에서 유지
  - 결과별 리다이렉트 경로
- 실제 응답은 `next build && next start` 후 curl(cookie jar)로 확인한다. 확인 항목은 다음과 같다.
  - 인가 시작의 303·`Location`·`Set-Cookie`가 함께 오는지
  - 콜백 실패 분기(취소, state 불일치, 쿠키 없음)의 쿠키 삭제
  - 제공자 간 쿠키 분리
  - 같은 제공자로 동시에 시작할 때의 결과
- 성공 분기(`isNewUser` true·false)는 `http://localhost:3000`에서 실제 카카오·구글로 확인한다. 확인 결과는 PR에 적는다.

### 4단계에서 할 일

- 2단계 BFF는 `getTempToken`으로 읽고, `if (!tempToken)`이면 BE를 부르지 않고 401 `INVALID_TEMP_TOKEN`을 돌려준다. `getTempToken`은 빈 값을 `undefined`로 돌려주지만 호출부에서도 검사해 빈 `Bearer` 요청을 막는다.
- 성공 시 `setAuthCookies`가 `temp_token`을 지우므로 따로 부르지 않는다.
- 401 `INVALID_TEMP_TOKEN`, 409 `SOCIAL_ACCOUNT_ALREADY_REGISTERED`·`SOCIAL_EMAIL_CONFLICT`는 `clearTempToken`을 부른다. 400(입력 오류)은 유지한다.
- `proxy.ts`의 `/onboarding` 판단은 `OAUTH_COOKIE_NAMES.tempToken`을 쓴다. 지금 `/onboarding`은 공개 목록에 있어 쿠키 없이도 열린다.
- 테스트로 아래를 확인한다.
  - 임시 토큰이 없으면 BE를 부르지 않는다
  - 성공·지정된 401·409에서 `temp_token`을 지운다
  - 400에서는 유지한다

### 적용하지 않는 것

- 로그인 시도별 쿠키 이름(`oauth_req_{state}` 등): 여러 탭을 지원하지만 쿠키가 쌓이고 정리가 복잡해진다. 실패해도 다시 시작하면 된다.
- `__Host-` 접두사: 이번 단계에서는 도입하지 않는다. `vercel.app`의 public suffix 등록은 다른 Vercel 프로젝트가 `Domain=vercel.app`으로 쿠키를 공유하는 것을 막는다. 프로젝트 자체의 하위 도메인이나 커스텀 도메인까지 같은 방식으로 보호하는 것은 아니다.
- 난수 생성 mock 테스트: 호출 인자만 확인할 뿐 엔트로피를 증명하지 않는다. 길이·문자셋 검사와 RFC 7636 벡터로 검증한다.

## 확인 필요

### 1. 개인정보 수집 항목과 실제 입력 항목 불일치

약관 본문은 BE가 관리한다(`GET /api/terms`). 개인정보 처리방침 제1조의 수집 항목이 실제 입력과 다르다.

| 구분                  | 항목                                                          |
| --------------------- | ------------------------------------------------------------- |
| 문구에만 있음         | 휴대전화번호, 사업장명, 사업자등록번호, 대표자명, 사업장 주소 |
| 입력에만 있음         | 이름, 업종                                                    |
| 소셜 가입에 해당 없음 | 비밀번호                                                      |

수집 항목을 실제 입력에 맞출지, 입력 항목을 늘릴지 결정이 필요하다. 본문 수정은 BE 약관 데이터에서 한다.

### 2. `components/auth/` 하위 폴더

[folder-structure.md](../../architecture/folder-structure.md)는 `auth/form/` 하위 폴더를 두지만 현재 auth 컴포넌트는 모두 `auth/` 바로 아래에 있다.

## 참고

- 공통 규칙은 [docs/README.md](../../README.md) 참고
