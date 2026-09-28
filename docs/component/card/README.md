# Card 컴포넌트 설계

여러 화면에서 반복되는 흰색 카드 표면을 하나의 공통 UI 컴포넌트로 통일하기 위한 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 진행한다.

## 개요

Figma에는 별도의 Card 컴포넌트가 없지만, 실제 화면에서는 같은 카드 표면이 여러 도메인에 반복된다. 이름은 `sales_card`, `sales_chart_card`, `sales_category_card`, `post_card`, `TodayList`, `NoteCard`처럼 흩어져 있으나, 공통 구조는 **배경·radius·padding을 가진 컨테이너 + Header / Content / Footer 슬롯**으로 수렴한다.

이번 설계의 목적은 도메인별 카드를 모두 공통 컴포넌트로 합치는 것이 아니라, 여러 화면이 공유하는 **surface primitive**를 먼저 정의하는 것이다. 매출 요약 카드, 아르바이트생 카드, 테이블 카드 같은 도메인 조합은 feature 컴포넌트에서 이 primitive를 사용해 만든다.

## 설계 결정 요약

| 결정        | 선택                                                                                                  | 근거                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 범위        | Card primitive + compound 슬롯                                                                        | 화면별 카드 내용은 다르지만 외곽 표면과 슬롯 구조는 반복된다                       |
| 배치        | `src/components/_common/Card/`                                                                        | 프로젝트 공통 컴포넌트는 `_common/` 하위 컴포넌트 폴더에서 관리한다                |
| API         | `Card`, `Card.Header`, `Card.Title`, `Card.Description`, `Card.Content`, `Card.Footer`, `Card.Action` | shadcn Card와 유사한 구조라 학습 비용이 낮고, 도메인 조합을 막지 않는다            |
| variant     | `cva`로 `radius`, `padding`, `tone`, `interactive`만 정의                                             | 도메인별 의미를 primitive에 넣지 않고 반복되는 시각 차이만 축으로 둔다             |
| 루트 변경   | `asChild` 지원 (`@radix-ui/react-slot`)                                                               | 링크 카드, 시맨틱 태그 변경 등 다양한 사용처에 유연하게 대응하고 범용성을 확보한다 |
| 도메인 카드 | 별도 구현                                                                                             | `SummaryCard`, `EmployeeCard`, `TableCard` 등은 각 feature 책임이다                |

## 레이어 구조

```
① Primitive  src/components/_common/Card/             도메인 무지 · surface/slot 제공
② Service    src/components/{domain}/...              SummaryCard, EmployeeCard 등 조합
③ Page       app/**/page.tsx 또는 도메인 컨테이너      데이터 주입 · 레이아웃 배치
```

공통 Card는 API·비즈니스 로직을 알지 않는다. [ui-component.md](../../convention/ui-component.md)의 규칙처럼 특정 페이지의 데이터 조회, mutation, 상태 관리는 hooks 또는 도메인 컴포넌트에서 처리한다.

### 파일 구성

```
src/components/_common/Card/
├── Card.tsx
├── CardPanel.tsx
├── CardHeader.tsx
├── CardTitle.tsx
├── CardDescription.tsx
├── CardAction.tsx
├── CardContent.tsx
└── CardFooter.tsx
```

`Card.tsx`는 compound API를 조립하는 진입점이다. 실제 슬롯 구현은 같은 폴더의 개별 파일에 둔다. 호출부는 `Card.Header`처럼 `Card` 네임스페이스 아래의 슬롯을 사용한다.

## API

```tsx
<Card>
  <Card.Header>
    <Card.Title>입력한 매출</Card.Title>
    <Card.Action>{/* 더보기 버튼 */}</Card.Action>
  </Card.Header>
  <Card.Content>{/* table, chart, list, empty state */}</Card.Content>
  <Card.Footer>{/* 최근 8일 / 합계 */}</Card.Footer>
</Card>
```

```tsx
<Card radius="xl" padding="lg">
  <Card.Header>
    <Card.Title>오늘의 업무</Card.Title>
    <Card.Description>86%</Card.Description>
  </Card.Header>
  <Card.Content>{/* todo / done section */}</Card.Content>
</Card>
```

### 루트 요소 변경 (`asChild`)

카드 컴포넌트 구현에서 범용성을 위해 `asChild`를 사용했다. 기본 `div`나 `h2`뿐만 아니라 링크 카드(`<a>`), 버튼(`button`), 시맨틱 컨테이너(`<article>`, `<section>`) 등 호출부의 다양한 태그 및 마크업 요구에 유연하게 대응할 수 있도록 `@radix-ui/react-slot`의 `Slot`을 적용했다.

- `Card`와 `Card.Title`에 `asChild`를 지원한다.
- `asChild`에는 정확히 하나의 React 요소를 단일 자식으로 전달하며, 스타일·DOM 속성·ref가 해당 자식 요소로 위임된다.
- variant와 충돌하는 스타일을 변경할 때는 자식 요소가 아닌 `Card` 컴포넌트의 `className`에 전달한다 (`Slot`은 양쪽 className을 병합하지만 Tailwind 충돌까지 정리하지 않으므로, 컴포넌트 내부의 `cn` 유틸을 통해 우선순위가 관리되도록 한다).
- Base UI primitive 자체를 합성할 때는 해당 라이브러리의 `render` prop을 사용하며, 프로젝트에서 직접 작성한 컴포넌트에 한해 `asChild` 패턴을 사용한다.

```tsx
<Card asChild radius="2xl" padding="lg" interactive>
  <a href="/sales">
    <Card.Header>
      <Card.Title asChild>
        <h3>매출 현황</h3>
      </Card.Title>
    </Card.Header>
    <Card.Content>매출 상세 보기</Card.Content>
  </a>
</Card>
```

### 슬롯 책임

| 슬롯               | 책임                                          | 비고                                |
| ------------------ | --------------------------------------------- | ----------------------------------- |
| `Card`             | 외곽 surface, radius, padding, 배경, overflow | 도메인 무지                         |
| `Card.Header`      | 제목·설명·액션 배치                           | 기본은 좌우 정렬                    |
| `Card.Title`       | 카드 제목                                     | 기본 태그는 `h2`                    |
| `Card.Description` | 보조 텍스트·진행률 등                         | 색상은 muted 계열                   |
| `Card.Action`      | 더보기, 메뉴, 탭, 드롭다운 같은 우측 액션     | 버튼 자체의 동작은 호출부 책임      |
| `Card.Content`     | 본문 자유 슬롯                                | chart, table, list, empty 모두 수용 |
| `Card.Footer`      | 하단 보조 정보·합계                           | 선택 슬롯                           |

## variant (cva)

[ui-component.md](../../convention/ui-component.md)에 따라 반복되는 디자인 차이만 `cva`로 정의한다.

| 축            | 값          | 매핑                                     | Figma 근거                     |
| ------------- | ----------- | ---------------------------------------- | ------------------------------ |
| `radius`      | `lg`        | `rounded-[24px]`                         | 아르바이트생 목록 카드         |
|               | `xl`        | `rounded-[28px]`                         | 대시보드 패널 카드             |
|               | `2xl`       | `rounded-[32px]`                         | 매출 요약·차트 카드            |
| `padding`     | `none`      | `p-0`                                    | 직접 내부 레이아웃을 잡는 경우 |
|               | `sm`        | `p-4`                                    | 중첩 섹션 카드                 |
|               | `md`        | `p-6`                                    | 오늘의 업무 카드               |
|               | `lg`        | `p-8`                                    | 차트·테이블 카드 내부          |
|               | `employee`  | `px-[38px] pb-8 pt-7`                    | 아르바이트생 목록 카드         |
| `tone`        | `default`   | `bg-white-50`                            | 대부분의 카드                  |
|               | `muted`     | `bg-slate-50`                            | 필요 시 보조 표면              |
|               | `highlight` | `bg-primary-100`                         | TO DO 섹션                     |
| `interactive` | `false`     | 기본                                     | 정적 패널                      |
|               | `true`      | hover 그림자 / focus-visible 스타일 추가 | 클릭 가능한 목록 카드          |

`radius`와 `padding`은 별도 축으로 둔다. 같은 radius라도 카드 목적에 따라 padding이 달라지고, 같은 padding이라도 중첩 카드와 외곽 카드의 radius가 다르기 때문이다.

## 디자인 토큰 매핑

### 일치

| Figma                          | 코드                    |
| ------------------------------ | ----------------------- |
| 배경 `#FFFFFE`                 | `bg-white-50`           |
| 페이지 배경 `#F2F2F2`          | `bg-slate-100`          |
| 제목 20/30 SemiBold            | `text-xl font-semibold` |
| 본문 14/20 Medium 또는 Regular | `text-sm` + weight      |
| 보조 텍스트 12/16              | `text-xs`               |

### 임의값 사용

| 값               | 사용처                 | 이유                                                  |
| ---------------- | ---------------------- | ----------------------------------------------------- |
| `rounded-[24px]` | 목록 카드              | 현재 radius scale로 정확히 표현되지 않는다            |
| `rounded-[28px]` | 대시보드 패널          | 현재 radius scale로 정확히 표현되지 않는다            |
| `rounded-[32px]` | 매출 요약·차트 카드    | 현재 radius scale로 정확히 표현되지 않는다            |
| `px-[38px]`      | 아르바이트생 목록 카드 | Figma 카드의 좌우 padding이 토큰 스케일과 맞지 않는다 |

radius 임의값이 Modal, Pagination에서도 반복되고 있다. 컴포넌트마다 임의값이 계속 늘어나면 전역 radius scale 재정의를 별도로 검토한다.

Figma의 [`sales_card`](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=147-233738)와 [`sales_chart_card`](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=180-163366)는 외곽 radius가 32px이며, 이를 `radius="2xl"`로 제공한다.

### 그림자

Figma의 `sales_card`와 `sales_chart_card`에는 `0 0 30px rgba(0,0,0,0.05)` 그림자가 있다. Card primitive의 기본값에는 shadow를 넣지 않는다. 현재 구현의 `interactive=true` hover 그림자는 `0 0 20px rgba(0,0,0,0.1)`로, Figma의 정적 그림자와 다르다. 이 두 카드의 정적 상태를 그대로 재현하려면 도메인 조합에서 그림자를 별도로 적용해야 한다.

Figma에서 확인된 shadow의 적용 범위는 다음과 같다.

| 사용처                 | 값                          | 방침                                    |
| ---------------------- | --------------------------- | --------------------------------------- |
| 매출 요약·차트 카드    | `0 0 30px rgba(0,0,0,0.05)` | 기본값에서는 제외, 도메인 조합에서 적용 |
| Card interactive hover | `0 0 20px rgba(0,0,0,0.1)`  | Card의 hover 피드백                     |
| 사이드바               | `0 0 30px rgba(0,0,0,0.05)` | Card primitive 범위 아님                |
| Pagination 활성 셀     | orange shadow               | Pagination 문서에서 관리                |
| 스케줄 칩              | 작은 drop shadow            | 도메인 컴포넌트에서 관리                |

## 도메인 조합 기준

공통 Card 위에 얹을 수 있는 조합은 아래처럼 분리한다. 아래 이름은 구현 예시이며, 실제 파일명은 도메인 문서와 작업 범위에 맞춰 정한다.

| 조합                 | 예시 화면                           | 공통 Card 사용 방식                      |
| -------------------- | ----------------------------------- | ---------------------------------------- |
| `DashboardPanelCard` | 오늘의 업무, 매출 차트, 입력한 매출 | `Card` + header/content/footer           |
| `SummaryCard`        | 매출 대시보드 상단 수치 카드        | `Card` + 간결한 metric layout            |
| `EmployeeCard`       | 아르바이트생 관리 목록              | `Card` + 아이콘, title, chip, date, menu |
| `TableCard`          | 입력한 매출                         | `Card` + table/empty/footer              |
| `SectionCard`        | TO DO / DONE 내부 박스              | `Card`의 중첩 사용 또는 별도 `div`       |

`Card`는 `EmployeeCard`의 `phone`, `date`, `menu` 같은 필드를 props로 받지 않는다. 그런 값은 도메인 컴포넌트가 소유하고, 필요한 영역에 `Card.Content` 또는 `Card.Action`으로 조합한다.

## 반응형

[style.md](../../convention/style.md)에 따라 desktop-first + `max-*` 변형만 쓴다.

- Card 자체는 기본적으로 `width: 100%`를 따른다.
- grid column, 카드 높이, 화면별 배치는 Card가 아니라 호출부 레이아웃이 담당한다.
- 모바일에서 padding을 줄여야 하는 경우 `padding` variant를 바꾸거나 호출부에서 `className`으로 보정한다.
- `min-*` breakpoint와 `max-*` breakpoint를 섞지 않는다.

Figma에서 확인한 화면별 배치는 다음과 같다.

| 화면    | 관찰                                               |
| ------- | -------------------------------------------------- |
| Desktop | 1320px 컨텐츠 안에서 2열/3열 카드 배치             |
| Tablet  | 635~636px 폭에서 카드가 1열 또는 2열로 재배치      |
| Mobile  | 351px 폭 카드, 내부 padding은 유지되거나 일부 축소 |

## 접근성

- 기본 `Card`는 `<div>`이며 landmark나 interactive role을 갖지 않는다.
- 클릭 가능한 카드는 `Card asChild`에 의미에 맞는 `<a>` 또는 `<button>`을 단일 자식으로 전달한다. 링크 카드 안에 다른 버튼·링크를 중첩하지 않는다.
- `interactive=true`인 경우 `focus-visible` 스타일을 반드시 제공한다.
- 제목 계층은 페이지 문맥에 맞춰 `Card.Title asChild`로 적절한 제목 태그를 전달한다. 기본 태그는 `h2`다.
- `Card.Action` 내부 버튼은 명확한 접근성 이름을 가져야 한다. 아이콘 버튼은 `aria-label`을 호출부에서 제공한다.

`interactive=true`는 hover/focus 스타일만 제공하며 클릭·키보드 동작을 추가하지 않는다. `Card asChild`로 전달한 `<a>` 또는 `<button>` 자체에 스타일이 적용되므로 해당 요소가 포커스를 받을 때 `focus-visible` 링도 표시된다.

### Header/Footer 랜드마크 범위

`Card.Header`와 `Card.Footer`는 각각 `<header>`, `<footer>`를 렌더한다. 카드가 `<main>`, `<section>`, `<article>`, `<aside>`, `<nav>` 밖에 놓이면 보조 기술에서 페이지의 `banner`/`contentinfo` 랜드마크로 인식될 수 있다. 카드를 사용할 때는 페이지 본문 `<main>` 안에 배치하고, 본문 밖의 독립 섹션이라면 적절한 `<section>` 또는 `<article>`로 감싼다. `<main>`이 페이지 어딘가에 존재하는 것만으로는 충분하지 않고 카드가 그 안에 있어야 한다.

현재 `app/layout.tsx`에는 `<main>`이 없다. 추후 TanStack Query Provider를 배치하며 레이아웃을 수정할 때 공통 `<main>{children}</main>` 구조를 검토한다. 이 방식을 채택하면 페이지의 기존 `<main>`은 제거해 문서당 main 랜드마크가 하나만 남도록 한다. 그전에는 각 페이지에서 카드를 자신의 `<main>` 안에 배치한다.

## 렌더링 경계

Card primitive는 상태·이벤트·브라우저 API가 없다. 따라서 기본 구현은 Server Component로 유지한다.

| 파일                   | `"use client"` | 이유                            |
| ---------------------- | -------------- | ------------------------------- |
| `Card.tsx`와 슬롯 파일 | ✕              | 순수 마크업, 스타일 합성만 수행 |

이벤트가 필요한 메뉴, 탭, 드롭다운, 차트는 `Card.Action` 또는 `Card.Content`에 들어오는 자식 컴포넌트가 클라이언트 경계를 가진다. Card가 그 경계를 대신 소유하지 않는다.

## 테스트 전략

Card는 로직보다 스타일 조합이 중심이므로 구현 PR에서는 최소 렌더 테스트만 둔다.

```
test/components/_common/Card/Card.test.tsx
```

| 대상           | 검증                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| 슬롯 렌더      | Header/Title/Description/Action/Content/Footer가 children을 렌더한다                               |
| variant        | `radius`, `padding`, `tone`, `interactive` 클래스가 적용된다                                       |
| className 병합 | Card와 모든 compound 슬롯에서 호출부 className이 `cn`으로 병합되며 충돌하는 기본 클래스는 대체된다 |
| `asChild`      | Card와 Card.Title이 단일 자식 요소에 스타일과 DOM 속성을 전달한다                                  |

시각 회귀 테스트는 아직 프로젝트 표준이 없으므로 추가하지 않는다.

## 단계별 PR 계획

원칙대로라면 PR을 여러 개로 나눠야 하지만, 구현 범위가 작아 1개 브랜치/PR로 진행했다.

| 순서 | 브랜치                       | base                         | 내용                                       |
| ---- | ---------------------------- | ---------------------------- | ------------------------------------------ |
| 1    | `feat/common-card-component` | `dev`                        | 이 설계 문서 + docs 인덱스 갱신            |
| 2    | `feat/common-card-ui`        | `feat/common-card-component` | `_common/Card/Card.tsx` 구현 + 최소 테스트 |

팀에서 PR 수를 줄이기로 하면 같은 브랜치에서 문서와 구현을 함께 올려도 된다. 이 경우 커밋은 문서와 구현을 분리한다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 스타일·반응형 규칙: [convention/style.md](../../convention/style.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
