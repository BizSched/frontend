# 렌더링 경계 (Server / Client Component)

## 기본 규칙

> 모든 컴포넌트는 **Server Component를 기본값**으로 한다.
> `"use client"`는 아래 [허용 트리거](#use-client-허용-트리거) 중 하나에 해당할 때만 추가한다.

App Router에서 `"use client"`가 없는 컴포넌트는 Server Component다. 따라서 "Server Component로 만들기 위해" 별도로 할 일은 없고, **클라이언트로 넘길 이유가 생겼을 때만** 경계를 만든다.

## `"use client"` 허용 트리거

다음 네 가지 중 **하나 이상**이 필요한 경우에만 `"use client"`를 추가한다.

| 번호 | 트리거                 | 예시                                                                              |
| ---- | ---------------------- | --------------------------------------------------------------------------------- |
| 1    | 상태·생명주기 훅       | `useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useRef`                 |
| 2    | 브라우저 전용 API      | `window`, `document`, `localStorage`, `sessionStorage`, `IntersectionObserver`     |
| 3    | DOM 이벤트 핸들러      | `onClick`, `onChange`, `onSubmit`, `onKeyDown`                                     |
| 4    | 클라이언트 런타임 의존 | Zustand store, `useQuery`/`useMutation`, React Hook Form, 애니메이션 라이브러리 등 |

**어느 트리거에도 해당하지 않으면 `"use client"`를 추가하지 않는다.**
"클라이언트 컴포넌트가 익숙해서", "부모가 클라이언트라서", "일단 붙여두면 안전해서"는 트리거가 아니다.

리뷰·PR에서는 트리거 번호로 근거를 밝힌다. (예: "이 컴포넌트는 트리거 3(onSubmit) 때문에 클라이언트 경계가 필요합니다.")

## 경계 위치 규칙

### 1. 경계는 가장 말단에 둔다

`"use client"`는 **해당 트리거가 실제로 필요한 가장 말단 컴포넌트**에 둔다. 부모에 붙이면 그 아래 서브트리 전체가 클라이언트 번들에 포함된다.

```tsx
// ❌ 페이지 전체가 클라이언트가 된다
'use client';

export default function TaskPage() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <TaskSummary /> {/* 상태와 무관한데 클라이언트 번들에 포함됨 */}
      <button onClick={() => setOpen(true)}>필터</button>
    </section>
  );
}
```

```tsx
// ✅ 상태가 필요한 버튼만 클라이언트 경계로 분리
// app/task/page.tsx — Server Component
export default function TaskPage() {
  return (
    <section>
      <TaskSummary />
      <TaskFilterButton />
    </section>
  );
}
```

클라이언트 경계는 `"use client"` 지시어로만 드러내며, 파일명에 `.client.tsx` 같은 접미사를 **붙이지 않는다.** 접미사를 쓰면 경계가 바뀔 때마다 파일명과 import 경로를 함께 고쳐야 하고, [naming.md](../convention/naming.md)의 파일 네이밍 규칙과도 충돌한다.

### 2. `page.tsx` / `layout.tsx`에는 붙이지 않는다

`app/**/page.tsx`, `app/**/layout.tsx`에 `"use client"`를 붙이는 것은 **원칙적으로 금지**한다. 라우트 진입점이 클라이언트가 되면 그 라우트의 전체 트리가 클라이언트 번들로 넘어가고, 서버 데이터 접근·metadata·prefetch 경로를 모두 잃는다.

예외가 불가피한 경우, 지시어 **바로 위**에 `NOTE:` 주석으로 이유를 남긴다.

```tsx
// NOTE: 이 라우트는 전체가 캔버스 드래그 인터랙션에 종속되어 서버 렌더 가능한 영역이 없음
'use client';
```

`NOTE` 주석 규칙은 [comment.md](../convention/comment.md) 참고.

### 3. Server Component를 Client Component 안에서 import하지 않는다

Client Component가 서버에서 렌더링된 콘텐츠를 감싸야 할 때는, **Server 부모가 `children` 또는 `ReactNode` prop으로 주입**한다. Client Component가 Server Component를 직접 import하면 그 Server Component는 클라이언트 컴포넌트로 취급되어 서버 전용 코드가 깨진다.

```tsx
// ❌ Client가 Server를 직접 import
'use client';
import { TaskSummary } from '@components/task/TaskSummary'; // 서버 전용 코드가 클라이언트로 끌려간다

export function TaskPanel() {
  const [open, setOpen] = useState(false);
  return <aside>{open && <TaskSummary />}</aside>;
}
```

```tsx
// ✅ Server 부모가 children으로 주입
// TaskPanel.tsx — Client Component
'use client';

export function TaskPanel({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <aside>{open && children}</aside>;
}

// page.tsx — Server Component
export default function TaskPage() {
  return (
    <TaskPanel>
      <TaskSummary />
    </TaskPanel>
  );
}
```

### 4. UI primitive의 클라이언트 경계는 전염되지 않는다

`components/ui/`의 UI primitive는 인터랙션 때문에 자체적으로 클라이언트 경계를 가질 수 있다. **Server Component가 이를 import해도 부모가 Client Component가 되는 것은 아니다.** 경계는 import 방향이 아니라 `"use client"`가 선언된 지점에서 시작한다.

즉, Server Component인 `page.tsx`에서 `<Button>`을 렌더링하는 것은 정상이며, 이를 이유로 페이지에 `"use client"`를 붙이지 않는다. (배치 기준은 [ui-component.md](../convention/ui-component.md) 참고)

## 하이브리드 데이터 패칭 (TanStack Query + RSC)

TanStack Query를 사용하는 화면은 다음 규칙을 따른다.

### prefetch → dehydrate → HydrationBoundary → useQuery

1. 첫 화면에 즉시 보이거나 SEO가 필요한 서버 데이터는 **Server Component에서 `queryClient.prefetchQuery(queryOptions)`** 로 prefetch한다.
2. `dehydrate(queryClient)` 결과를 `HydrationBoundary`로 클라이언트에 전달한다.
3. Client Component는 **같은 `queryOptions`** 를 `useQuery`에서 재사용한다.
4. query key와 query function 정의는 **서버·클라이언트가 공유하는 한 곳**에만 둔다. (`xxxQueryOptions` — [state-management.md](./state-management.md) 참고)

```tsx
// app/task/page.tsx — Server Component
export default async function TaskPage() {
  const queryClient = getServerQueryClient(); // 요청 단위 생성
  await queryClient.prefetchQuery(taskListQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskList />
    </HydrationBoundary>
  );
}
```

```tsx
// TaskList.tsx — Client Component
'use client';

export function TaskList() {
  const { data } = useQuery(taskListQueryOptions()); // 동일한 queryOptions 재사용
  // ...
}
```

### 금지 — 서버 props와 클라이언트 query를 분리하는 방식

서버에서 API를 직접 호출해 props로 내리고, 클라이언트에서 **별도 query key로 다시 조회**하는 방식은 금지한다. 캐시 키가 분리되어 같은 데이터가 두 벌로 존재하고, 갱신·무효화 시점이 어긋난다.

### 예외 — 읽기 전용 데이터

상호작용·갱신·캐시 동기화가 **전혀 필요 없는 읽기 전용 데이터**는 Server Component에서 직접 조회해 props/JSX로 구성할 수 있다. 이 경우 TanStack Query를 거치지 않는다.

판단 기준: 이 데이터를 클라이언트에서 다시 조회하거나 무효화할 일이 있는가? 있다면 prefetch + hydration, 없다면 RSC 직접 조회.

### QueryClient 인스턴스

서버 QueryClient는 **요청 단위로 생성**한다. 모듈 전역 싱글턴은 요청 간 캐시가 공유되어 **다른 사용자의 데이터가 노출될 수 있으므로 금지**한다.

### prefetch 대상 한정

prefetch 대상은 **첫 화면 데이터와 SEO가 필요한 데이터**로 한정한다. 다음은 사전 패칭 기본 대상에서 제외한다.

- 모달 내부 데이터
- 탭 전환 뒤에 보이는 데이터
- 무한 스크롤의 다음 페이지

### 캐싱 지시어 (`use cache`) — 부분 도입

Next 16의 `use cache`는 **정적 성격이 강한 구간에만 부분 도입**한다. 기본 렌더링 전략은 SSR이며([data-flow.md](./data-flow.md) 캐시 정책), 캐시는 예외적으로 선언한다.

**적용 대상**

- 모든 사용자에게 동일한 결과가 나가는 데이터 (공개 목록, 공지, 정적 메타 정보)
- 갱신 주기가 길고 실시간성이 필요 없는 구간

**적용 금지**

- 인증된 사용자별 데이터 — 요청 간 캐시가 공유되면 다른 사용자의 데이터가 노출된다
- 쿠키·헤더에 따라 결과가 달라지는 구간
- TanStack Query가 무효화를 담당하는 데이터 — 프레임워크 캐시와 클라이언트 캐시가 이중으로 걸리면 무효화 시점이 어긋난다

캐시 무효화 책임은 **한 곳에만** 둔다. `use cache`를 건 구간은 TanStack Query로 다시 관리하지 않는다.

> **확인 필요**: `use cache`는 `next.config.ts`의 `cacheComponents`(구 `dynamicIO`) 플래그를 켜야 동작하며, 이 플래그는 부분 도입이라도 **프로젝트 전역에 켜진다.** 켜는 순간 캐시되지 않은 동적 데이터에 Suspense 경계가 요구되는 등 기본 동작이 달라진다. 첫 적용 시점에 실제 동작을 확인하고 이 문서에 반영한다.

## 직렬화 계약

Server → Client 경계를 넘는 값은 **직렬화 가능해야** 한다.

- API formatter가 반환하는 프론트엔드 모델은 **plain object, primitive, 배열, ISO 문자열**처럼 직렬화 가능한 값만 포함한다.
- **날짜는 `Date` 객체가 아니라 ISO string으로 유지**한다. 표시용 포맷 변환은 클라이언트(또는 표현 레이어)에서 수행한다.
- 함수, class instance, `Map`/`Set`, `Symbol`은 경계를 넘기지 않는다.

변환 레이어 규칙은 [data-flow.md](./data-flow.md) 참고.

## 금지 목록 (리뷰 체크리스트)

렌더링 경계 점검 항목의 단일 출처다. `AGENTS.md`와 [code-review.md](../collaboration/code-review.md)는 이 목록을 참조만 한다.

- [ ] `page.tsx`, `layout.tsx`의 무분별한 `"use client"`
- [ ] Server Component → Client Component로 함수, class instance 등 **직렬화 불가능한 값** 전달
- [ ] Client Component에 **`Date` 객체** 전달 (ISO string으로 전달할 것)
- [ ] `NEXT_PUBLIC_` 접두사가 없는 환경변수를 Client Component에서 참조 ([env.md](./env.md))
- [ ] 서버 전용 모듈에 `server-only` 적용 없이 클라이언트에서 import 가능한 상태로 방치
- [ ] 서버 QueryClient의 모듈 전역 싱글턴
- [ ] Client Component가 Server Component를 **직접 import**하는 구조
