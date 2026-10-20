# 로그인 페이지 설계

## 개요

이메일·비밀번호로 로그인하고, 사이드바에서 로그아웃한다. 라우트는 `/login`이다. 인증 흐름(쿠키·BFF·refresh)은 [auth.md](../../architecture/auth.md), API 명세는 [README](./README.md#api-명세)가 기준이다.

## 화면 구성

| 영역        | 구성                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| 로그인 폼   | 이메일, 비밀번호, 자동 로그인 체크박스, 로그인 실패 문구, 로그인 버튼 (`LoginForm`)                                       |
| 가입 이동   | 회원가입 링크 (`AuthSwitchLink`)                                                                                          |
| 소셜 로그인 | `AuthSocialLogin` — 카카오·구글 버튼, 소셜 로그인 실패 문구. 흐름은 [auth.md](../../architecture/auth.md)의 "소셜 로그인" |
| 로그아웃    | 사이드바 로그아웃 버튼 (`AppSidebar`의 `onLogoutClick`)                                                                   |

## 상태·데이터

| 상태          | 범위        | 도구                                | 근거                                                              |
| ------------- | ----------- | ----------------------------------- | ----------------------------------------------------------------- |
| 입력값        | `LoginForm` | React Hook Form (`rules`)           | 폼 상태 규칙. BE가 입력값을 검증하지 않아 형식 검사는 폼에서 한다 |
| 로그인 요청   | `LoginForm` | `useMutation` (`useLoginMutation`)  | 변경 요청                                                         |
| 로그아웃 요청 | 사이드바    | `useMutation` (`useLogoutMutation`) | 변경 요청                                                         |

- 로그인·로그아웃은 mutation이라 `throwOnError`를 쓰지 않고 `onError`에서 처리한다([error-handling.md](../../architecture/error-handling.md)).
- 로그인 실패(401 `INVALID_CREDENTIALS`)는 폼 인라인 문구로 보여준다. 문구는 [README](./README.md#api-명세) 참고.
- 5xx·네트워크 오류도 같은 자리에 공통 문구(`formatCommonError`)로 보여준다.
- 로그인에 성공하면 `queryClient.clear()`로 이전 사용자 캐시를 지운 뒤 `/dashboard`로 이동한다.
- 로그아웃에 성공하면 `queryClient.clear()` 후 전체 새로고침(`window.location.assign`)으로 `/login`에 간다. 클라이언트 이동은 라우터 캐시를 남겨, 뒤로가기로 로그아웃 전 화면이 보일 수 있다.
- 로그아웃이 5xx·네트워크 오류로 실패하면 확인 모달(`openConfirmModal`)로 다시 시도할지 묻는다. 제목 "로그아웃하지 못했어요", 설명은 `formatAuthError` 문구, 확인 버튼 "다시 시도"다.

### 입력 검사

| 필드     | 규칙                                  | 문구                           |
| -------- | ------------------------------------- | ------------------------------ |
| 이메일   | 필수                                  | 이메일을 입력해주세요.         |
| 이메일   | `이름@도메인.최상위` 형식 (공백 불가) | 올바른 이메일 형식이 아닙니다. |
| 비밀번호 | 필수                                  | 비밀번호를 입력해주세요.       |

- 문구는 각 입력칸 아래(`AuthField`의 `errorMessage`)에 보여준다.

### 소셜 로그인

- 카카오·구글 버튼은 BFF 인가 시작 경로(`/api/oauth/{provider}/authorize`)로 가는 링크다. 브라우저가 페이지를 이동해야 제공자 로그인 화면으로 갈 수 있어 `fetch`로 부르지 않는다.
- `SocialButton`의 `render`로 `<a href>`를 그리고 `nativeButton={false}`를 넘긴다. Base UI가 붙이는 `role="button"`은 `role="link"`로 덮어쓴다. 페이지를 이동하는 링크이기 때문이다. `next/link`는 쓰지 않는다. 시작 경로는 페이지가 아닌 Route Handler라 prefetch·클라이언트 이동 대상이 아니고, prefetch가 일어나면 인가 요청 없이 임시 쿠키만 바뀐다.
- 회원가입 화면의 소셜 버튼도 같은 경로다. 가입 여부는 BE가 판단한다.
- 소셜 로그인에는 자동 로그인 선택을 적용하지 않는다. 체크박스는 이메일 로그인에만 쓴다.

### 소셜 로그인 실패 안내

콜백·온보딩에서 소셜 로그인부터 다시 해야 하는 실패는 `/login?socialError={errorCode}`로 돌아온다. `page.tsx`가 쿼리를 문구로 바꿔 `AuthSocialLogin`에 넘기고, 소셜 버튼 위에 한 줄로 보여준다.

| `socialError`                       | 조건                  | 문구                                                               |
| ----------------------------------- | --------------------- | ------------------------------------------------------------------ |
| `SOCIAL_EMAIL_CONFLICT`             | `joinType=EMAIL`      | 이메일로 가입된 계정입니다. 이메일 로그인을 이용해주세요.          |
| `SOCIAL_EMAIL_CONFLICT`             | `joinType=KAKAO`      | 카카오로 가입된 계정입니다. 카카오 로그인을 이용해주세요.          |
| `SOCIAL_EMAIL_CONFLICT`             | `joinType=GOOGLE`     | 구글로 가입된 계정입니다. 구글 로그인을 이용해주세요.              |
| `SOCIAL_EMAIL_CONFLICT`             | `joinType` 없음·그 외 | 이미 가입된 이메일입니다. 가입한 방법으로 로그인해주세요.          |
| `OAUTH_EMAIL_REQUIRED`              |                       | 이메일 제공에 동의해야 가입할 수 있어요. 다시 시도해 동의해주세요. |
| `INVALID_TEMP_TOKEN`                |                       | 가입 시간이 지났어요. 소셜 로그인을 다시 진행해주세요.             |
| `SOCIAL_ACCOUNT_ALREADY_REGISTERED` |                       | 이미 가입이 완료됐어요. 소셜 로그인을 다시 눌러주세요.             |
| `BFF_INVALID_OAUTH_STATE`           |                       | 소셜 로그인에 실패했어요. 다시 시도해주세요.                       |
| 그 외 값                            |                       | 소셜 로그인에 실패했어요. 다시 시도해주세요.                       |

- 쿼리 값은 정해진 값만 문구로 바꾸고 화면에 그대로 출력하지 않는다.
- 동의 화면에서 취소하고 돌아오면 `socialError` 없이 `/login`으로 온다. 사용자가 직접 취소한 경우라 문구를 보여주지 않는다.
- 이메일 로그인 실패 문구와 자리를 나눈다. 소셜 실패는 다시 눌러야 할 버튼 바로 위에 보인다.

## 렌더링 경계

- `page.tsx`는 Server Component로 레이아웃, 메타데이터, `socialError` 쿼리의 문구 변환을 담당한다.
- `AuthSocialLogin`은 링크와 문구만 그려 Server Component로 둔다.
- `LoginForm`은 트리거 4(React Hook Form, `useMutation`) 때문에 Client Component다.
- 로그아웃은 Server Component인 `(main)/layout.tsx`에서 `onLogoutClick` 함수를 넘길 수 없으므로, `useLogoutMutation`을 쓰는 클라이언트 래퍼(`AppSidebarContainer`)가 `AppSidebar`를 감싼다. `AppSidebar`는 수정하지 않는다.

## 설계 결정

| 결정                           | 선택                                 | 근거                                                                                                                                                           |
| ------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 공통 인프라 구현 범위          | 로그인·로그아웃에 필요한 만큼만      | 쓰는 곳이 없는 인프라를 미리 만들지 않는다                                                                                                                     |
| 로그인 실패 문구               | FE 매핑, 소셜 로그인 안내 포함       | 소셜 가입 계정도 같은 401을 받는다                                                                                                                             |
| 로그아웃과 refresh             | 같은 단계에서 구현                   | BE 로그아웃이 401을 주면 refresh 후 다시 호출해야 해서 refresh에 의존한다                                                                                      |
| 자동 로그인·실패 문구 배치     | 기존 `AuthField`·`Checkbox`로 구성   | 로그인 화면에 해당 영역 디자인이 없다                                                                                                                          |
| 자동 로그인 기본값             | 꺼짐                                 | 사용자가 직접 선택해야 공용 기기에서 로그인이 오래 남지 않는다                                                                                                 |
| 5xx·네트워크 오류 표시         | 폼 인라인 공통 문구                  | 공통 토스트 컴포넌트가 없다. 토스트가 생기면 토스트로 바꾼다                                                                                                   |
| 로그아웃 5xx·네트워크 실패     | 로그인 유지, 확인 모달로 재시도 안내 | 쿠키만 지우면 BE의 refresh 토큰이 남는다. 공통 토스트가 없고 사이드바에 문구 자리가 없어 기존 Confirm 모달 프리셋을 쓴다                                       |
| 로그아웃 후 이동               | 전체 새로고침                        | 라우터 캐시까지 지워 뒤로가기로 이전 사용자 화면이 보이지 않게 한다                                                                                            |
| 소셜 로그인 실패 표시          | `/login` 쿼리 + 소셜 버튼 위 인라인  | 콜백은 페이지 이동으로 끝나 결과를 쿼리로 넘긴다. 어떤 방법으로 다시 로그인할지 안내라 사라지지 않고 버튼 곁에 남아야 한다                                     |
| 소셜 동의 취소                 | 문구 없이 `/login`                   | 사용자가 직접 취소한 경우라 오류가 아니다                                                                                                                      |
| 소셜 로그인 실패 문구          | FE 매핑                              | BE 안내 예시를 따른다. 디자인 확정 시 교체한다                                                                                                                 |
| `BFF_INVALID_OAUTH_STATE` 문구 | 공통 실패 문구                       | 만료·다른 탭에서 다시 시작·쿠키 차단·인앱 브라우저 등 원인을 구분할 수 없고, 어느 경우든 다시 시도하면 된다. 원인을 추측한 문구는 일부 경우에 틀린 안내가 된다 |

## 단계별 PR 계획

| 단계 | 브랜치                     | 범위                                                                                                                                                                       | 분기  | 상태 |
| ---- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---- |
| 1    | `docs/auth-bff-convention` | 인증·BFF·Fetcher·에러 처리 문서                                                                                                                                            | `dev` | 병합 |
| 2    | `docs/auth-login-plan`     | 로그인 페이지 설계, 단계별 PR 계획 (이 문서)                                                                                                                               | `dev` |      |
| 3    | `feat/api-fetcher-core`    | `server-only` 설치, `apiError.ts`, `customFetcher.ts`(4xx → `ApiError`, 5xx → `Error`, 빈 body, timeout·signal 병합, 서버 `BE_BASE_URL`), `getAuthHeaders.ts`, 단위 테스트 | `dev` |      |
| 4    | `feat/auth-bff-utils`      | `lib/api/bff/` — 쿠키 3종 읽기·쓰기, Origin 검사, BFF 에러 응답 변환(`BFF_` 코드), 단위 테스트                                                                             | 3단계 |      |
| 5    | `feat/auth-login`          | 로그인 Route Handler, `entities/auth`(`postLogin`, `toLoginUser`), `useLoginMutation`, `LoginForm`(자동 로그인, 실패 문구, `rules` 검증)                                   | 4단계 |      |
| 6    | `feat/auth-refresh-logout` | refresh·logout·session Route Handler, `customFetcher` 브라우저 401 refresh(탭 안 single-flight, 1회 재시도, 세션 정리), `postLogout`, `useLogoutMutation`, 사이드바 연결   | 5단계 |      |
| 7    | `feat/auth-route-guard`    | `proxy.ts` — refresh 쿠키가 없으면 보호 페이지에서 `/login`으로, 있으면 `/login`·`/signup`에서 `/dashboard`로 리다이렉트                                                   | 6단계 |      |

- 3단계는 문서에 의존하지 않으므로 `dev`에서 분기한다. 4단계부터는 바로 앞 단계 브랜치에서 분기한 stacked PR이고, 앞 단계가 머지되면 base를 `dev`로 바꾼다.
- 5단계는 생성된 `login1`이 body 타입을 반환하고 생성물이 커밋된 상태(orval `includeHttpResponseReturnType: false`)에서 진행한다.
- 7단계는 6단계 이후에 진행한다. `proxy.ts`는 refresh 쿠키 유무만 보므로, 무효한 refresh 쿠키를 지우는 세션 정리가 없으면 `/login`과 `/dashboard` 사이를 왕복한다.
- 범용 통과(catch-all)는 이 계획에 포함하지 않는다.
