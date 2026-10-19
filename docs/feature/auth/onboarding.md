# 온보딩 페이지 설계

## 개요

소셜 로그인으로 처음 가입한 사용자에게 업종과 약관 동의를 받는다. 소셜 가입은 회원가입 화면을 거치지 않으므로, 일반 가입과 같은 항목을 이 화면에서 받는다. 라우트는 `/onboarding`이며, 완료 후 `/dashboard`로 이동한다. 소셜 로그인 흐름·쿠키는 [auth.md](../../architecture/auth.md)의 "소셜 로그인"이 기준이다.

## 화면 구성

| 영역      | 구성                             |
| --------- | -------------------------------- |
| 헤더      | 제목 `추가 정보 입력`, 안내 문구 |
| 업종      | `AuthBusinessTypeField`          |
| 약관 동의 | `TermsAgreement`                 |
| 액션      | 가입 실패 문구, 시작하기         |

레이아웃은 `AuthLayout`을 써서 회원가입 화면과 같은 폭·로고를 유지한다. 회원가입과 달리 제목을 화면에 보여준다. 로그인 직후 바뀐 화면이 무엇인지 알려야 하기 때문이다.

## 진입 조건

- 소셜 로그인 콜백이 신규 회원(`isNewUser: true`)일 때 `temp_token` 쿠키를 저장하고 이 화면으로 보낸다.
- `temp_token` 쿠키가 없으면 `proxy.ts`가 막는다. refresh 쿠키가 있으면 `/dashboard`, 없으면 `/login`으로 보낸다.
- 쿠키가 있어도 만료 여부는 제출할 때 BE가 판단한다. 화면에 들어올 때는 확인하지 않는다.

## 상태·데이터

| 상태        | 범위             | 도구                                              | 근거                                               |
| ----------- | ---------------- | ------------------------------------------------- | -------------------------------------------------- |
| 입력값 전체 | `OnboardingForm` | React Hook Form                                   | 폼 상태 규칙                                       |
| 약관 목록   | `TermsAgreement` | `useQuery` (`termsQueryOptions`)                  | 서버 데이터. 회원가입과 같이 서버에서 prefetch한다 |
| 가입 마무리 | `OnboardingForm` | `useMutation` (`useCompleteSocialSignupMutation`) | 변경 요청                                          |

- 요청은 BFF `PATCH /api/users/signup/additional-info`로 보낸다. body는 `industry`, `industryDetail`, `termsAgreed`이고 규칙은 [signup.md](./signup.md#요청-필드)의 같은 필드를 따른다. 이름·이메일은 소셜 프로필에서 받으므로 보내지 않는다.
- 업종·약관 입력 검사와 문구는 회원가입과 같다([signup.md](./signup.md#입력-검사)).
- 성공하면 `queryClient.clear()` 후 `/dashboard`로 이동한다. 로그인 성공과 같은 이유다.
- 요청 중과 성공 후 이동 전에는 업종·약관 조작을 잠근다.
- mutation이라 `throwOnError`를 쓰지 않고 `onError`에서 처리한다([error-handling.md](../../architecture/error-handling.md)).

### 실패

| status         | errorCode                           | 처리                                                                            |
| -------------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| 400            | `REQUIRED_TERMS_NOT_AGREED`         | 약관 영역 인라인. 약관 목록을 다시 조회한다([signup.md](./signup.md#약관-목록)) |
| 400            | `INVALID_INDUSTRY_VALUE`            | 업종 필드 인라인. 문구는 회원가입과 같다                                        |
| 400            | 그 밖의 코드                        | 시작하기 버튼 위에 BE `message`(`formatCommonError`)                            |
| 401            | `INVALID_TEMP_TOKEN`                | `/login?socialError=INVALID_TEMP_TOKEN`으로 이동                                |
| 409            | `SOCIAL_ACCOUNT_ALREADY_REGISTERED` | `/login?socialError=SOCIAL_ACCOUNT_ALREADY_REGISTERED`로 이동                   |
| 409            | `SOCIAL_EMAIL_CONFLICT`             | `/login?socialError=SOCIAL_EMAIL_CONFLICT&joinType={data.joinType}`로 이동      |
| 5xx · 네트워크 | —                                   | 시작하기 버튼 위에 공통 문구(`formatCommonError`)                               |

- 401·409는 BFF가 `temp_token`을 지운 뒤다. 이 화면에서 다시 제출할 수 없으므로 로그인 화면에서 소셜 로그인부터 다시 하도록 안내한다. 문구는 [login.md](./login.md#소셜-로그인-실패-안내) 참고.
- 로그인 화면 이동은 전체 새로고침(`window.location.assign`)으로 한다. 쿠키가 바뀐 상태에서 라우터 캐시를 남기지 않는다.
- `SOCIAL_ACCOUNT_ALREADY_REGISTERED`는 다른 탭의 제출이 먼저 끝난 경우다. 계정은 만들어졌으므로 소셜 로그인을 다시 누르면 바로 로그인된다.

## 렌더링 경계

`page.tsx`는 Server Component로 레이아웃·제목·메타데이터, 약관 목록 prefetch를 담당한다. 폼 상태와 라우터 이동이 필요한 `OnboardingForm`부터 Client Component다.

## 설계 결정

| 결정           | 선택                                      | 근거                                                                      |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| 라우트 위치    | `app/onboarding/` (`(main)` 밖)           | 로그인 후 화면이지만 가입이 끝나지 않은 단계라 사이드바를 보여주지 않는다 |
| 입력 컴포넌트  | 회원가입과 공유                           | 두 경로에서 받는 항목과 규칙이 같다                                       |
| 진입 판단      | `proxy.ts`에서 `temp_token` 쿠키 유무     | 쿠키가 없으면 제출해도 실패한다. 유효성은 BE가 판단한다                   |
| 임시 토큰 실패 | 로그인 화면으로 보내 소셜 로그인부터 다시 | 임시 토큰을 다시 받으려면 소셜 로그인을 처음부터 해야 한다                |

## 확인 필요

- 업종 값은 회원가입과 같다. Swagger의 2단계 요청 enum 수정 여부는 [auth.md](../../architecture/auth.md#결정-대기-항목)의 "소셜 가입 업종 값" 참고.
- 필수 항목 검증은 [README](./README.md#필수-항목-검증)를 따른다. 제목·안내 문구·버튼 문구는 디자인 확정 시 교체한다.
