# 폴더 구조 / 컴포넌트 분리 기준

프로젝트 최상위에는 `app/`(Next.js App Router 라우트 진입점), `src/`, `test/`를 나란히 둔다. `src/`는 `components`, `hooks`, `lib`, `stores`, `providers`, `assets`로 구성한다.

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

`interface`는 각 레이어 폴더(`hooks`, `lib`, `provider`, `store`) 하위의 `types/`에 분리해서 선언한다. (`components`는 내부에서 관리)

## app/ 구조

`layout.tsx`, `page.tsx`, `globals.css`가 여기 위치한다.

- `app/`: `login/`, `signup/`, `partTime/`(`schedule/`, `staff/`), `sales/`(`dashboard/`, `details/`), `task/`(`calendar/`, `form/`, `detail/`), `dashboard/`, `layout.tsx`, `page.tsx`

`app/**/page.tsx`·`app/**/layout.tsx`의 렌더링 경계 규칙은 [rendering.md](./rendering.md) 참고.

## src/ 상세 구조

도메인(기능)별로 하위 폴더를 둔다.

- `components/`: `_common/`(하위 `ui/`는 Shadcn/ui 기본 UI 전용 — [ui-component.md](../convention/ui-component.md) 참고), `auth/`(`form/`), `dashboard/`, `landing/`, `partTime/`(`schedule/`, `staff/`), `sales/`(`chart/`, `table/`, `form/`, `category/`), `task/`(`calendar/`, `form/`, `detail/`)
- `hooks/`: `types/`, `api/`
- `lib/`: `utility/`, `api/`, `types/`
- `providers/`: `auth/`, `partTime/`, `sales/`, `task/`
- `stores/`: `auth/`, `partTime/`, `sales/`, `task/`
- `assets/`: `styles/` (전역 CSS 토큰: `breakpoints`, `colors`, `theme`, `typography`)

## test/ 구조

- `test/`: `fixtures/`, 나머지는 `src/` 구조를 미러링

파일명·러너 규칙은 [test.md](../convention/test.md) 참고.
