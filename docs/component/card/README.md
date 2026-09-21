# Card 컴포넌트 설계

여러 화면에서 반복되는 흰색 카드 표면을 하나의 공통 UI 컴포넌트로 통일하기 위한 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 진행한다.

## 개요

Figma에는 별도의 Card 컴포넌트가 없지만, 실제 화면에서는 같은 카드 표면이 여러 도메인에 반복된다. 이름은 `sales_card`, `sales_chart_card`, `sales_category_card`, `post_card`, `TodayList`, `NoteCard`처럼 흩어져 있으나, 공통 구조는 **배경·radius·padding을 가진 컨테이너 + Header / Content / Footer 슬롯**으로 수렴한다.

이번 설계의 목적은 도메인별 카드를 모두 공통 컴포넌트로 합치는 것이 아니라, 여러 화면이 공유하는 **surface primitive**를 먼저 정의하는 것이다. 매출 요약 카드, 아르바이트생 카드, 테이블 카드 같은 도메인 조합은 feature 컴포넌트에서 이 primitive를 사용해 만든다.

## 설계 결정 요약

| 결정        | 선택                                                                                            | 근거                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 범위        | Card primitive + compound 슬롯                                                                  | 화면별 카드 내용은 다르지만 외곽 표면과 슬롯 구조는 반복된다            |
| 배치        | `src/components/_common/Card/`                                                                  | 프로젝트 공통 컴포넌트는 `_common/` 하위 컴포넌트 폴더에서 관리한다     |
| API         | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction` | shadcn Card와 유사한 구조라 학습 비용이 낮고, 도메인 조합을 막지 않는다 |
| variant     | `cva`로 `radius`, `padding`, `tone`, `interactive`만 정의                                       | 도메인별 의미를 primitive에 넣지 않고 반복되는 시각 차이만 축으로 둔다  |
| 도메인 카드 | 별도 구현                                                                                       | `SummaryCard`, `EmployeeCard`, `TableCard` 등은 각 feature 책임이다     |

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
└── Card.tsx
```

`Card.tsx`는 compound 서브컴포넌트를 같은 파일에서 named export한다. 파일 수를 늘릴 만큼 각 슬롯의 로직이 크지 않아 한 파일에서 시작하고, 구현이 커지면 같은 폴더 안에서 슬롯 파일로 분리한다.

## API

```tsx
<Card>
  <CardHeader>
    <CardTitle>입력한 매출</CardTitle>
    <CardAction>{/* 더보기 버튼 */}</CardAction>
  </CardHeader>
  <CardContent>{/* table, chart, list, empty state */}</CardContent>
  <CardFooter>{/* 최근 8일 / 합계 */}</CardFooter>
</Card>
```

```tsx
<Card radius="xl" padding="lg">
  <CardHeader>
    <CardTitle>오늘의 업무</CardTitle>
    <CardDescription>86%</CardDescription>
  </CardHeader>
  <CardContent>{/* todo / done section */}</CardContent>
</Card>
```

### 슬롯 책임

| 슬롯              | 책임                                          | 비고                                               |
| ----------------- | --------------------------------------------- | -------------------------------------------------- |
| `Card`            | 외곽 surface, radius, padding, 배경, overflow | 도메인 무지                                        |
| `CardHeader`      | 제목·설명·액션 배치                           | 기본은 좌우 정렬                                   |
| `CardTitle`       | 카드 제목                                     | `h2`/`h3`는 호출부 문맥에 따라 `asChild` 검토 가능 |
| `CardDescription` | 보조 텍스트·진행률 등                         | 색상은 muted 계열                                  |
| `CardAction`      | 더보기, 메뉴, 탭, 드롭다운 같은 우측 액션     | 버튼 자체의 동작은 호출부 책임                     |
| `CardContent`     | 본문 자유 슬롯                                | chart, table, list, empty 모두 수용                |
| `CardFooter`      | 하단 보조 정보·합계                           | 선택 슬롯                                          |

## variant (cva)

[ui-component.md](../../convention/ui-component.md)에 따라 반복되는 디자인 차이만 `cva`로 정의한다.

| 축            | 값          | 매핑                    | Figma 근거                     |
| ------------- | ----------- | ----------------------- | ------------------------------ |
| `radius`      | `lg`        | `rounded-[24px]`        | 아르바이트생 목록 카드         |
|               | `xl`        | `rounded-[28px]`        | 대시보드 패널 카드             |
| `padding`     | `none`      | `p-0`                   | 직접 내부 레이아웃을 잡는 경우 |
|               | `sm`        | `p-4`                   | 중첩 섹션 카드                 |
|               | `md`        | `p-6`                   | 오늘의 업무 카드               |
|               | `lg`        | `p-8`                   | 차트·테이블 카드 내부          |
|               | `employee`  | `px-[38px] pb-8 pt-7`   | 아르바이트생 목록 카드         |
| `tone`        | `default`   | `bg-white-50`           | 대부분의 카드                  |
|               | `muted`     | `bg-slate-50`           | 필요 시 보조 표면              |
|               | `highlight` | `bg-primary-100`        | TO DO 섹션                     |
| `interactive` | `false`     | 기본                    | 정적 패널                      |
|               | `true`      | hover/focus 스타일 추가 | 클릭 가능한 목록 카드          |

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
| `px-[38px]`      | 아르바이트생 목록 카드 | Figma 카드의 좌우 padding이 토큰 스케일과 맞지 않는다 |

radius 임의값이 Modal, Pagination에서도 반복되고 있다. 컴포넌트마다 임의값이 계속 늘어나면 전역 radius scale 재정의를 별도로 검토한다.

### 그림자

대부분의 카드에는 명확한 shadow가 없고 흰색 표면과 배경 대비로 구분된다. 카드 primitive의 기본값에는 shadow를 넣지 않는다.

Figma에서 확인된 shadow는 다음처럼 특수 목적에 가깝다.

| 사용처             | 값                          | 방침                     |
| ------------------ | --------------------------- | ------------------------ |
| 사이드바           | `0 0 30px rgba(0,0,0,0.05)` | Card primitive 범위 아님 |
| Pagination 활성 셀 | orange shadow               | Pagination 문서에서 관리 |
| 스케줄 칩          | 작은 drop shadow            | 도메인 컴포넌트에서 관리 |

## 도메인 조합 기준

공통 Card 위에 얹을 수 있는 조합은 아래처럼 분리한다. 아래 이름은 구현 예시이며, 실제 파일명은 도메인 문서와 작업 범위에 맞춰 정한다.

| 조합                 | 예시 화면                           | 공통 Card 사용 방식                      |
| -------------------- | ----------------------------------- | ---------------------------------------- |
| `DashboardPanelCard` | 오늘의 업무, 매출 차트, 입력한 매출 | `Card` + header/content/footer           |
| `SummaryCard`        | 매출 대시보드 상단 수치 카드        | `Card` + 간결한 metric layout            |
| `EmployeeCard`       | 아르바이트생 관리 목록              | `Card` + 아이콘, title, chip, date, menu |
| `TableCard`          | 입력한 매출                         | `Card` + table/empty/footer              |
| `SectionCard`        | TO DO / DONE 내부 박스              | `Card`의 중첩 사용 또는 별도 `div`       |

`Card`는 `EmployeeCard`의 `phone`, `date`, `menu` 같은 필드를 props로 받지 않는다. 그런 값은 도메인 컴포넌트가 소유한다.

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

- `Card` 자체는 landmark나 interactive role을 갖지 않는다.
- 클릭 가능한 카드가 필요하면 호출부가 `<button>` 또는 `<a>`를 선택한다. `Card`는 `asChild` 지원 여부를 구현 시 검토한다.
- `interactive=true`인 경우 `focus-visible` 스타일을 반드시 제공한다.
- 제목 계층은 페이지 문맥에 따라 달라질 수 있으므로 `CardTitle`은 기본 태그를 제공하되 `asChild` 또는 `as` 확장을 고려한다.
- `CardAction` 내부 버튼은 명확한 접근성 이름을 가져야 한다. 아이콘 버튼은 `aria-label`을 호출부에서 제공한다.

## 렌더링 경계

Card primitive는 상태·이벤트·브라우저 API가 없다. 따라서 기본 구현은 Server Component로 유지한다.

| 파일       | `"use client"` | 이유                            |
| ---------- | -------------- | ------------------------------- |
| `Card.tsx` | ✕              | 순수 마크업, 스타일 합성만 수행 |

이벤트가 필요한 메뉴, 탭, 드롭다운, 차트는 `CardAction` 또는 `CardContent`에 들어오는 자식 컴포넌트가 클라이언트 경계를 가진다. Card가 그 경계를 대신 소유하지 않는다.

## 테스트 전략

Card는 로직보다 스타일 조합이 중심이므로 구현 PR에서는 최소 렌더 테스트만 둔다.

```
test/components/_common/Card/card.test.tsx
```

| 대상           | 검증                                                                 |
| -------------- | -------------------------------------------------------------------- |
| 슬롯 렌더      | Header/Title/Description/Action/Content/Footer가 children을 렌더한다 |
| variant        | `radius`, `padding`, `tone`, `interactive` 클래스가 적용된다         |
| className 병합 | 호출부 className이 `cn`으로 병합된다                                 |

시각 회귀 테스트는 아직 프로젝트 표준이 없으므로 추가하지 않는다.

## 단계별 PR 계획

이 작업은 구현 범위가 작아 stacked PR까지는 필요하지 않다. 단, 문서와 구현을 분리하면 리뷰가 쉬우므로 2단계로 나눈다.

| 순서 | 브랜치                       | base                         | 내용                                       |
| ---- | ---------------------------- | ---------------------------- | ------------------------------------------ |
| 1    | `feat/common-card-component` | `dev`                        | 이 설계 문서 + docs 인덱스 갱신            |
| 2    | `feat/common-card-ui`        | `feat/common-card-component` | `_common/Card/Card.tsx` 구현 + 최소 테스트 |

팀에서 PR 수를 줄이기로 하면 같은 브랜치에서 문서와 구현을 함께 올려도 된다. 이 경우 커밋은 문서와 구현을 분리한다.

## 확인 필요

아래 항목은 임의로 확정하지 않는다. 확인 후 이 문서에 반영한다.

### 1. `asChild` 지원 여부

클릭 가능한 카드나 제목 태그 변경을 위해 `asChild`를 제공할지 확인이 필요하다. 현재 설계에서는 확장 후보로만 둔다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 스타일·반응형 규칙: [convention/style.md](../../convention/style.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
