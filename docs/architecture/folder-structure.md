# 폴더 구조 / 컴포넌트 분리 기준

프로젝트 최상위에는 `app/`(Next.js App Router 라우트 진입점), `src/`, `test/`, `proxy.ts`를 나란히 둔다. `proxy.ts`는 Next 16이 `app/`과 같은 위치에서 찾는다. `src/`는 `components`, `hooks`, `lib`, `stores`, `providers`, `assets`로 구성한다.

각 폴더에 대응하는 절대경로 alias는 [naming.md](../convention/naming.md#import-순서--절대경로-alias) 참고.

- 컴포넌트 폴더·파일명: `PascalCase` (예: `ModalHeader.tsx`)
- 기타 utility·핸들러 파일명: `camelCase`
- 타입 선언·export 방식은 [code-style.md](../convention/code-style.md) 참고

## 컴포넌트 분리 기준

다음 중 하나에 해당하면 분리를 고려한다. 코드 줄 수만으로는 분리하지 않는다.

- 다른 페이지에서 재사용되는 경우
- 하나의 컴포넌트가 여러 책임을 가지는 경우
- JSX가 지나치게 복잡해지는 경우
- 특정 UI 영역의 변경 가능성이 높은 경우

레이어별 책임은 [data-flow.md](./data-flow.md), 컴포넌트 배치 기준은 [ui-component.md](../convention/ui-component.md) 참고.

## 타입 정의 파일 위치

`interface`는 각 레이어 폴더(`hooks`, `lib`, `providers`, `stores`) 하위의 `types/`에 분리해서 선언한다. (`components`는 내부에서 관리)

## app/ 구조

`layout.tsx`, `page.tsx`, `globals.css`가 여기 위치한다.

- `app/`: `api/`, `login/`, `signup/`, `onboarding/`, `(main)/`, `layout.tsx`, `page.tsx`
- `api/`: BFF Route Handler. 인증 전용 경로(`auth/login/`, `auth/logout/` 등)와 범용 통과 경로(`[...path]/`)를 둔다 ([auth.md](./auth.md)의 "BFF 경로")
- `(main)/`: `dashboard/`, `partTime/`(`schedule/`, `staff/`), `sales/`(`dashboard/`, `details/`), `task/`(`calendar/`, `form/`, `detail/`), `layout.tsx`

### 라우트 그룹 `(main)`

**로그인이 필요한 페이지(사이드바 있음)와 로그인이 필요 없는 페이지를 구분하기 위해** `(main)` 라우트 그룹으로 묶는다.

- `(main)/` 안: 로그인 후 접근하는 페이지. `(main)/layout.tsx`가 사이드바(`AppSidebar`) 레이아웃을 공통으로 적용한다.
- `(main)/` 밖: 로그인 없이 접근하는 페이지(`login/`, `signup/`, 랜딩 `page.tsx`)와, 로그인 후라도 가입이 끝나지 않은 단계의 페이지(`onboarding/`). 사이드바를 적용하지 않는다.
- 괄호 폴더는 URL에 포함되지 않는다. (`app/(main)/sales/dashboard/page.tsx` → `/sales/dashboard`)
- 새 페이지를 추가할 때는 로그인 필요 여부로 `(main)/` 안·밖을 먼저 결정한다.

`app/**/page.tsx`·`app/**/layout.tsx`의 렌더링 경계 규칙은 [rendering.md](./rendering.md) 참고.

## src/ 상세 구조

도메인(기능)별로 하위 폴더를 둔다.

- `components/`: `_common/`(Shadcn/ui 기반으로 재구성한 컴포넌트를 `<Component>/<Component>.tsx`에 둔다 — [ui-component.md](../convention/ui-component.md) 참고), `auth/`(`form/`), `dashboard/`, `landing/`, `partTime/`(`schedule/`, `staff/`), `sales/`(`chart/`, `table/`, `form/`, `category/`), `task/`(`calendar/`, `form/`, `detail/`)
- `hooks/`: `types/`, `api/`
  - `api/{도메인}/`: 도메인별 하위 폴더. `lib/api/entities/{도메인}/`와 폴더명을 맞춘다 — CRUD 도메인은 훅이 여러 개(목록/생성/수정/삭제) 생겨 파일이 금방 늘어나므로, 도메인별로 묶어 `hooks/api/` 바로 아래가 평평해지지 않게 한다
    - `{도메인}QueryOptions.ts`: `xxxKeys`와 `xxxQueryOptions`. 서버 prefetch와 클라이언트 `useQuery`가 같은 `queryOptions`를 쓰므로 `'use client'`를 붙이지 않는다. 폴더 안이라도 파일명의 `{도메인}` 접두사는 유지한다 — import한 곳에서 파일명만 보고 바로 알아볼 수 있어야 한다
    - `use{도메인}.ts`: `queryOptions`를 쓰는 `useQuery`·`useMutation` 훅
- `lib/`: `utility/`, `api/`, `types/`
  - `api/customFetcher.ts`: 공통 Fetcher. orval 생성 함수의 mutator
  - `api/apiError.ts`: `ApiError`·`NetworkError`. 서버·클라이언트 공용
  - `api/getAuthHeaders.ts`: 쿠키의 access 토큰으로 `Authorization` 헤더를 만드는 헬퍼. `server-only`. 서버 prefetch와 BFF Route Handler가 함께 써서 `bff/` 밖에 둔다
  - `api/generated/`: orval 생성 요청 함수·zod 스키마. 직접 수정하지 않고, 생성 결과를 커밋한다
  - `api/entities/{도메인}/`: 생성 함수 호출 → zod 검증 → DAO 변환까지 끝낸 API 함수(`api.ts`)와 DTO → DAO 변환 함수(`to{DAO명}.ts`). Hook·Component는 `api.ts`의 함수만 쓴다
  - `api/bff/`: BFF Route Handler 유틸 (쿠키 읽기·쓰기, Origin 검사, 에러 응답 변환 등). 모두 `server-only`
- `providers/`: `auth/`, `partTime/`, `sales/`, `task/`
- `stores/`: `auth/`, `partTime/`, `sales/`, `task/`
- `assets/`: `styles/` (전역 CSS 토큰: `breakpoints`, `colors`, `theme`, `typography`)

## test/ 구조

- `test/`: `fixtures/`, 나머지는 `src/` 구조를 미러링

파일명·러너 규칙은 [test.md](../convention/test.md) 참고.
