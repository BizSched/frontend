# 안티패턴 레퍼런스

리뷰에서 찾을 패턴 모음. 각 항목은 **이 프로젝트에서 문제인 이유**와 **허용 가능한 예외**를 함께 적는다.
예외에 해당하면 finding이 아니다.

---

# 1부. 프로젝트 안티패턴

프로젝트 문서로 확정된 규칙에서 나온 것들이다. 근거 문서를 finding에 함께 적는다.

## 1. Client Component가 Server Component를 직접 import

```tsx
'use client';
import { TaskSummary } from '@components/task/TaskSummary'; // Server Component

export function TaskPanel() {
  const [open, setOpen] = useState(false);
  return <aside>{open && <TaskSummary />}</aside>;
}
```

**왜 문제인가** — import된 Server Component가 클라이언트 컴포넌트로 취급된다. 그 안의 서버 전용 코드
(`cookies()`, 서버 fetch, 서버 전용 모듈)가 클라이언트 번들로 끌려가면서 깨지거나 노출된다.
근거: `docs/architecture/rendering.md` 규칙 3.

**해결** — Server 부모가 `children` 또는 `ReactNode` prop으로 주입한다.

**허용 가능한 예외** — import 대상이 원래 Client Component이거나, `components/ui/`의 UI primitive인 경우.
UI primitive의 클라이언트 경계는 전염되지 않는다 (같은 문서 규칙 4).

---

## 2. Server → Client 경계로 직렬화 불가능한 값 전달

```tsx
// page.tsx — Server Component
<TaskCard
  createdAt={new Date(dto.createdAt)}   // Date 인스턴스
  onFormat={(v) => format(v)}           // 함수
  index={new Map(entries)}              // Map
/>
```

**왜 문제인가** — 경계를 넘는 값은 직렬화 가능해야 한다. 함수·class instance·`Map`/`Set`·`Symbol`은
넘어가지 않고, `Date`는 넘어가더라도 프로젝트 계약상 **ISO string으로 유지**해야 한다.
근거: `docs/architecture/rendering.md` 직렬화 계약.

**해결** — Formatter가 plain object / primitive / 배열 / ISO string만 반환하게 한다. 표시용 포맷 변환은
클라이언트(또는 표현 레이어)에서 한다.

**허용 가능한 예외** — 받는 컴포넌트가 Server Component라 경계를 넘지 않는 경우.
`children`으로 전달되는 이미 렌더된 JSX.

---

## 3. 서버 QueryClient의 모듈 전역 싱글턴

```ts
// ❌ 모듈 최상단에서 한 번 생성 → 모든 요청이 공유
export const queryClient = new QueryClient();
```

**왜 문제인가** — 서버에서 요청 간 캐시가 공유되면 **다른 사용자의 데이터가 그대로 응답에 섞인다.**
데이터 유출이므로 P0다. 근거: `docs/architecture/rendering.md` QueryClient 인스턴스.

**해결** — 요청 단위로 생성한다 (`getServerQueryClient()` 같은 팩토리).

**허용 가능한 예외** — 브라우저에서만 생성되는 클라이언트 QueryClient. Provider 안에서 `useState`로
한 번 생성하는 패턴은 정상이다.

---

## 4. 서버 props와 Client query의 중복 캐시

```tsx
// page.tsx — 서버에서 직접 조회해 props로 내림
const tasks = await getTaskList();
return <TaskList initialTasks={tasks} />;

// TaskList.tsx — 클라이언트에서 별도 key로 다시 조회
const { data } = useQuery({ queryKey: ['tasks', 'client'], queryFn: getTaskList });
```

**왜 문제인가** — 같은 데이터가 캐시 키 두 벌로 존재한다. 갱신·무효화 시점이 어긋나 화면마다 다른 값이
보이고, 원인을 추적하기 어려운 회귀가 된다. 근거: `docs/architecture/rendering.md` "금지 — 서버 props와
클라이언트 query를 분리하는 방식".

**해결** — prefetch → `dehydrate` → `HydrationBoundary` → 동일 `queryOptions`를 `useQuery`에서 재사용.

**허용 가능한 예외** — 상호작용·갱신·캐시 동기화가 **전혀 없는 읽기 전용 데이터**. 이 경우 TanStack Query를
거치지 않고 Server Component에서 직접 조회해 props/JSX로 구성한다 (같은 문서 "예외 — 읽기 전용 데이터").

---

## 5. DTO를 Formatter 없이 Component/Hook으로 전달

```ts
// ❌ 응답을 그대로 반환
export const getNewsList = async () => {
  const res = await fetcher.get('/news');
  return res.data; // DTO 그대로
};
```

**왜 문제인가** — BE 응답 형태가 UI까지 그대로 전파된다. BE 스키마가 바뀌면 컴포넌트·훅까지 함께 고쳐야
하고, 직렬화 계약도 보장되지 않는다. 근거: `docs/architecture/data-flow.md` DTO/DAO 분리.

**해결** — API 호출 함수 내부에서 응답 직후 Formatter를 호출해 FE DAO로 변환한 뒤 반환한다.
Hook·Component는 변환된 DAO만 쓴다.

**허용 가능한 예외** — DTO와 FE DAO가 실제로 동일한 구조라도 변환 지점은 유지한다. 다만 변환 함수가
항등에 가깝다는 이유만으로 finding을 올리지는 않는다.

---

## 6. Component 내부의 HTTP 요청 또는 응답 변환

```tsx
export function TaskList() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then((d) => setTasks(d.items.map((i) => ({ id: i.task_id, title: i.task_name }))));
  }, []);
}
```

**왜 문제인가** — Component는 UI 표현과 이벤트 처리 책임만 가진다. HTTP 요청은 API 레이어, 변환은
Formatter, 서버 상태 관리는 Hook의 책임이다. 한 파일에 섞이면 재사용·테스트가 막히고 회귀 범위가 넓어진다.
근거: `docs/architecture/data-flow.md` 레이어별 책임.

**해결** — API 함수 + Formatter + `xxxQueryOptions` + `useQuery`로 분리한다.

**허용 가능한 예외** — Server Component에서 읽기 전용 데이터를 직접 조회하는 경우 (4번 예외와 동일).
표시 직전의 순수 포맷팅(날짜 문자열 → 표시 문자열)은 표현 레이어에서 해도 된다.

---

## 7. ts-pattern 없이 분산된 API 오류 분기

```tsx
if (error.status === 404) return <NotFound />;
else if (error.status === 401) redirect('/login');
else if (error.errorCode === 'TASK_LOCKED') return <Locked />;
else return <Fallback />;
```

**왜 문제인가** — 분기 조건이 여러 파일에 흩어지면 새 `errorCode`가 추가될 때 어디를 고쳐야 하는지
드러나지 않고, 누락돼도 조용히 fallback으로 빠진다. 근거: `docs/architecture/data-flow.md` API 에러 처리
(분기 처리 자체는 `ts-pattern`을 활용한다).

**해결** — 도메인별 `format{도메인}Error`에서 `ts-pattern`으로 `errorCode`를 매핑하고, Component는 반환된
메시지를 표시한다.

**허용 가능한 예외** — 분기가 실제로 두 갈래이고 한 곳에만 존재하는 단순 조건.
`error.tsx` / `not-found.tsx` 배치 단위와 `throwOnError` 판정 기준은 **아직 미확정**이므로 위반으로 판단하지 않는다.

---

## 8. 인증·사용자별 데이터를 캐시

```ts
// ❌ 쿠키를 실어 보내면서 캐시를 켠다
const res = await fetch(url, {
  headers: { cookie: (await cookies()).toString() },
  next: { revalidate: 60 },
});
```

```tsx
// ❌ 사용자별 데이터 구간에 use cache
'use cache';
export async function MyTaskList() { ... }
```

**왜 문제인가** — 요청 간 캐시가 공유되면 **다른 사용자의 데이터가 노출된다.** P0다.
근거: `docs/architecture/data-flow.md` 캐시 정책("인증 쿠키가 실린 요청은 절대 캐시하지 않는다"),
`docs/architecture/rendering.md` 캐싱 지시어 적용 금지 목록.

**해결** — 기본값은 SSR(`cache: 'no-store'`). 정적으로 돌릴 구간만 선언적으로 예외 처리한다.

**허용 가능한 예외** — 모든 사용자에게 동일한 결과가 나가는 공개 데이터(공지, 공개 목록, 정적 메타).
단 TanStack Query가 무효화를 담당하는 데이터에는 프레임워크 캐시를 중복으로 걸지 않는다.

---

## 9. page/layout 전체의 불필요한 `"use client"`

```tsx
// app/task/page.tsx
'use client';

export default function TaskPage() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <TaskSummary />            {/* 상태와 무관한데 클라이언트 번들에 포함 */}
      <button onClick={() => setOpen(true)}>필터</button>
    </section>
  );
}
```

**왜 문제인가** — 라우트 진입점이 클라이언트가 되면 그 라우트 전체 트리가 클라이언트 번들로 넘어가고,
서버 데이터 접근·metadata·prefetch 경로를 모두 잃는다. 근거: `docs/architecture/rendering.md`
경계 위치 규칙 2(원칙적으로 금지).

**해결** — 트리거가 실제로 필요한 **가장 말단 컴포넌트**로 경계를 내린다.

**허용 가능한 예외** — 라우트 전체가 클라이언트 인터랙션에 종속돼 서버 렌더 가능한 영역이 없는 경우.
이때는 지시어 **바로 위**에 `NOTE:` 주석으로 이유를 남긴다. NOTE 근거가 있으면 근거의 타당성만 본다.

---

## 10. Tailwind `min-*`와 `max-*` 변형 혼용

```tsx
// ❌ 두 방향이 섞여 중첩 구간의 우선순위를 추적할 수 없다
<div className="flex flex-col md:flex-row max-tablet:gap-4" />
```

```tsx
// ✅ desktop-first — 기본이 데스크톱, max-*로 좁혀 나간다
<div className="flex flex-row gap-8 max-desktop:gap-6 max-tablet:flex-col max-tablet:gap-4" />
```

**왜 문제인가** — 프로젝트 원칙은 desktop-first다. 접두사 없는 클래스가 데스크톱을 정의하고 `max-*`로
좁혀 나간다. 두 방향을 섞으면 중첩 구간에서 어떤 규칙이 이기는지 추적하기 어렵다.
근거: `docs/convention/style.md` 반응형.

**해결** — `max-desktop:` / `max-tablet:` 커스텀 변형만 사용한다.

**허용 가능한 예외** — 없음. 다만 `desktop` breakpoint 값(1920px)의 적정성은 문서에서 **"확인 필요"** 이므로
값 자체를 위반으로 다루지 않는다.

---

# 2부. 일반 안티패턴

프로젝트 문서와 무관하게 버그·취약점이 되는 것들이다.

## TypeScript

### `any`로 타입 검사 무력화
```ts
const data = response as any;
const value = (thing as any).nested.field;
```
`any` 캐스팅은 이후 모든 타입 검사를 없앤다. `unknown` + 타입 가드나 정확한 타입을 쓴다.
**예외** — 외부 라이브러리 타입 정의가 잘못돼 우회가 필요한 경우. 이유를 주석으로 남긴다.

### 검증 없는 non-null assertion
```ts
const name = user!.profile!.name;
```
가정이 깨지면 런타임 크래시다. 옵셔널 체이닝 + 가드로 바꾼다.
**예외** — 바로 위에서 존재를 보장한 경우(가드 직후, 배열 길이 확인 직후 등).

## React

### `useEffect` stale closure
```ts
useEffect(() => {
  setInterval(() => console.log(count), 1000);
}, []); // count 누락
```
초기값을 캡처한 채 갱신되지 않는다.

### cleanup 누락
```ts
useEffect(() => {
  const id = setInterval(fn, 1000);
  // return () => clearInterval(id) 없음
}, []);
```
메모리 누수 + Strict Mode의 이중 마운트에서 중복 실행된다.

### 배열 인덱스를 `key`로 사용
```tsx
{items.map((item, i) => <Card key={i} {...item} />)}
```
순서가 바뀌거나 필터링되면 재조정이 어긋나 상태와 DOM이 어긋난다.
**예외** — 절대 재정렬·삽입·삭제되지 않는 정적 리스트.

### `useEffect` 콜백이 async 함수
```ts
useEffect(async () => { ... }, []);
```
async 함수는 Promise를 반환하므로 cleanup 계약이 깨진다. 내부 async 함수를 정의해 호출한다.

## Security

### 셸 명령 문자열 보간
```ts
exec(`git log --author=${name}`);
```
입력에 셸 메타문자가 있으면 명령 주입이다. 인자 배열로 넘긴다.

### 검증 없는 리다이렉트
```ts
redirect(searchParams.get('next'));
```
외부 도메인으로 열린 리다이렉트가 된다. 상대 경로 또는 허용 목록으로 제한한다.

### sanitize 없는 HTML 주입
```tsx
element.innerHTML = userInput;
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```
입력에 포함된 스크립트·이벤트 핸들러가 사용자 브라우저에서 실행된다.

## Docker / CI

### `RUN` 레이어에 남는 secret
```dockerfile
RUN echo "API_KEY=abc123" > .env && npm run build && rm .env
```
레이어가 이미지 히스토리에 남아 삭제해도 추출된다. BuildKit `--secret` 마운트를 쓴다.

### 이벤트 페이로드를 `run:`에 직접 보간
```yaml
- run: echo "${{ github.event.issue.body }}"
```
이슈 본문으로 셸 명령을 주입할 수 있다. `env:`로 넘겨 `$ENV_VAR`로 읽는다.

### 와일드카드 권한
```yaml
permissions: write-all
```
잡에 필요한 최소 권한만 부여한다.
