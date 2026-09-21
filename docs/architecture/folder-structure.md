# 폴더 구조 / 컴포넌트 분리 기준

`src/`는 `components`, `apps`, `hooks`, `lib`, `stores`, `providers`로 구성한다.

- 컴포넌트 폴더·파일명: `PascalCase` (예: `ModalHeader.tsx`)
- 기타 utility·핸들러 파일명: `camelCase`
- export는 `index.ts` 네임드 export 방식 사용

## 컴포넌트 분리 기준

다음 중 하나에 해당하면 분리를 고려한다. 코드 줄 수만으로는 분리하지 않는다.

- 다른 페이지에서 재사용되는 경우
- 하나의 컴포넌트가 여러 책임을 가지는 경우
- JSX가 지나치게 복잡해지는 경우
- 특정 UI 영역의 변경 가능성이 높은 경우

레이어별 책임은 [data-flow.md](./data-flow.md), 컴포넌트 배치 기준은 [ui-component.md](../convention/ui-component.md) 참고.

## 타입 정의 파일 위치

`interface`는 각 레이어 폴더(`hooks`, `lib`, `provider`, `store`) 하위의 `types/`에 분리해서 선언한다. (`components`는 내부에서 관리)

## src/ 상세 구조

도메인(기능)별로 하위 폴더를 둔다.

- `apps/`: `login/`, `signup/`, `partTime/`(`schedule/`, `staff/`), `sales/`(`dashboard/`, `details/`), `task/`(`calendar/`, `form/`, `detail/`), `dashboard/`, `layout.tsx`, `page.tsx`
- `components/`: `_common/`, `auth/`(`form/`), `dashboard/`, `landing/`, `partTime/`(`schedule/`, `staff/`), `sales/`(`chart/`, `table/`, `form/`, `category/`), `task/`(`calendar/`, `form/`, `detail/`)
- `hooks/`: `types/`, `api/`
- `lib/`: `utility/`, `api/`, `types/`
- `providers/`: `auth/`, `partTime/`, `sales/`, `task/`
- `stores/`: `auth/`, `partTime/`, `sales/`, `task/`
- `test/`: `fixtures/`, 나머지는 `src/` 구조를 미러링
