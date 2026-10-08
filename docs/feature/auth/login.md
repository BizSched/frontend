# 로그인 페이지 설계

## 개요

이메일·비밀번호로 로그인하고, 사이드바에서 로그아웃한다. 라우트는 `/login`이다. 인증 흐름(쿠키·BFF·refresh)은 [auth.md](../../architecture/auth.md), API 명세는 [README](./README.md#api-명세)가 기준이다.

## 화면 구성

| 영역        | 구성                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------- |
| 로그인 폼   | 이메일, 비밀번호, 자동 로그인 체크박스, 로그인 실패 문구, 로그인 버튼 (`LoginForm`)      |
| 가입 이동   | 회원가입 링크 (`AuthSwitchLink`)                                                         |
| 소셜 로그인 | `AuthSocialLogin` — 이후 흐름은 [auth.md](../../architecture/auth.md)의 "결정 대기 항목" |
| 로그아웃    | 사이드바 로그아웃 버튼 (`AppSidebar`의 `onLogoutClick`)                                  |

## 상태·데이터

| 상태          | 범위        | 도구                                | 근거                                                              |
| ------------- | ----------- | ----------------------------------- | ----------------------------------------------------------------- |
| 입력값        | `LoginForm` | React Hook Form (`rules`)           | 폼 상태 규칙. BE가 입력값을 검증하지 않아 형식 검사는 폼에서 한다 |
| 로그인 요청   | `LoginForm` | `useMutation` (`useLoginMutation`)  | 변경 요청                                                         |
| 로그아웃 요청 | 사이드바    | `useMutation` (`useLogoutMutation`) | 변경 요청                                                         |

- 로그인·로그아웃은 mutation이라 `throwOnError`를 쓰지 않고 `onError`에서 처리한다([error-handling.md](../../architecture/error-handling.md)).
- 로그인 실패(401 `INVALID_CREDENTIALS`)는 폼 인라인 문구로 보여준다. 문구는 [README](./README.md#api-명세) 참고.
- 로그인에 성공하면 `/dashboard`로 이동한다. 로그아웃은 `queryClient.clear()` 후 `/login`으로 이동한다.

## 렌더링 경계

- `page.tsx`는 Server Component로 레이아웃과 메타데이터만 담당한다.
- `LoginForm`은 트리거 4(React Hook Form, `useMutation`) 때문에 Client Component다.
- 로그아웃은 Server Component인 `(main)/layout.tsx`에서 `onLogoutClick` 함수를 넘길 수 없으므로, `useLogoutMutation`을 쓰는 클라이언트 래퍼가 `AppSidebar`를 감싼다. `AppSidebar`는 수정하지 않는다.

## 설계 결정

| 결정                       | 선택                               | 근거                                                                      |
| -------------------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| 공통 인프라 구현 범위      | 로그인·로그아웃에 필요한 만큼만    | 쓰는 곳이 없는 인프라를 미리 만들지 않는다                                |
| 로그인 실패 문구           | FE 매핑, 소셜 로그인 안내 포함     | 소셜 가입 계정도 같은 401을 받는다                                        |
| 로그아웃과 refresh         | 같은 단계에서 구현                 | BE 로그아웃이 401을 주면 refresh 후 다시 호출해야 해서 refresh에 의존한다 |
| 자동 로그인·실패 문구 배치 | 기존 `AuthField`·`Checkbox`로 구성 | 로그인 화면에 해당 영역 디자인이 없다                                     |
| 자동 로그인 기본값         | 꺼짐                               | 사용자가 직접 선택해야 공용 기기에서 로그인이 오래 남지 않는다            |

## 단계별 PR 계획

| 단계 | 브랜치                     | 범위                                                                                                                                                                       | 분기  | 상태 |
| ---- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---- |
| 1    | `docs/auth-bff-convention` | 인증·BFF·Fetcher·에러 처리 문서                                                                                                                                            | `dev` | 병합 |
| 2    | `docs/auth-login-plan`     | 로그인 페이지 설계, 단계별 PR 계획 (이 문서)                                                                                                                               | `dev` |      |
| 3    | `feat/api-fetcher-core`    | `server-only` 설치, `apiError.ts`, `customFetcher.ts`(4xx → `ApiError`, 5xx → `Error`, 빈 body, timeout·signal 병합, 서버 `BE_BASE_URL`), `getAuthHeaders.ts`, 단위 테스트 | `dev` |      |
| 4    | `feat/auth-bff-utils`      | `lib/api/bff/` — 쿠키 3종 읽기·쓰기, Origin 검사, BFF 에러 응답 변환(`BFF_` 코드), 단위 테스트                                                                             | 3단계 |      |
| 5    | `feat/auth-login`          | 로그인 Route Handler, `entities/auth`(`postLogin`, `toLoginUser`), `useLoginMutation`, `LoginForm`(자동 로그인, 실패 문구, `rules` 검증)                                   | 4단계 |      |
| 6    | `feat/auth-refresh-logout` | refresh·logout·session Route Handler, `customFetcher` 브라우저 401 refresh(탭 안 single-flight, 1회 재시도, 세션 정리), `postLogout`, `useLogoutMutation`, 사이드바 연결   | 5단계 |      |

- 3단계는 문서에 의존하지 않으므로 `dev`에서 분기한다. 4단계부터는 바로 앞 단계 브랜치에서 분기한 stacked PR이고, 앞 단계가 머지되면 base를 `dev`로 바꾼다.
- 5단계는 생성된 `login1`이 body 타입을 반환하고 생성물이 커밋된 상태(orval `includeHttpResponseReturnType: false`)에서 진행한다.
- 라우트 보호(`proxy.ts`)와 범용 통과(catch-all)는 이 계획에 포함하지 않는다.

## 확인 필요

1. **5xx·네트워크 오류 표시** — error-handling.md는 mutation 실패를 토스트로 보여주지만, 공통 토스트 컴포넌트가 아직 없다. 그전까지 폼 인라인 공통 문구로 대신할지.
