# 스타일/반응형 규칙

## 클래스 정렬

Tailwind 클래스 순서는 `prettier-plugin-tailwindcss`로 자동 정렬한다.

## 폰트 스케일

2026-10-23 사용자 확인: 역할별 공통 스케일을 구축하고 매출 내역 화면부터 적용한다.
후속 사용자 요청으로 전체 페이지와 공통 UI까지 적용 범위를 확대한다.
공통 유틸리티·컴포넌트를 먼저 분리해 적용하며 페이지·앱 레이아웃 적용은 후속 PR에서 진행한다.

기본 크기 토큰은 `src/assets/styles/typography.css`, 역할별 조합은
`src/lib/utilities/typography.ts`의 `typographyVariants`를 단일 출처로 사용한다.
기존 `text-xs` ~ `text-3xl` 토큰을 재사용하며 별도 폰트나 의존성을 추가하지 않는다.

| role           | 역할                     | 크기 / 줄높이 / 굵기 | 744px 미만    |
| -------------- | ------------------------ | -------------------- | ------------- |
| `pageTitle`    | 페이지 제목              | 24 / 32 / 700        | 20 / 28 / 700 |
| `appBarTitle`  | 모바일 탑 앱 바 제목     | 20 / 28 / 700        | 동일          |
| `sectionTitle` | 섹션·모달 제목           | 20 / 28 / 700        | 18 / 28 / 700 |
| `subtitle`     | 소제목·강조 본문         | 16 / 24 / 600        | 동일          |
| `body`         | 본문·일반 입력값         | 16 / 24 / 400        | 동일          |
| `data`         | 테이블 금액·숫자 입력값  | 16 / 24 / 500        | 동일          |
| `label`        | 버튼·폼 라벨·테이블 헤더 | 14 / 20 / 600        | 동일          |
| `supporting`   | 설명·오류 메시지         | 14 / 20 / 400        | 동일          |
| `caption`      | 짧은 배지·요일           | 12 / 16 / 500        | 동일          |
| `metric`       | 핵심 합계                | 20 / 28 / 700        | 18 / 28 / 700 |

단위는 기본 루트 폰트 16px일 때의 px 환산값이다. 실제 크기는 rem 토큰을 사용한다.
자간은 기본 0이며 `data`·`metric`은 `tabular-nums`를 포함한다.
일 합계처럼 같은 크기에서 강조가 필요하면 `font-semibold`를 `cn`의 뒤쪽 인자로 전달한다.

```tsx
import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

<h2
  className={cn(typographyVariants({ role: 'sectionTitle' }), 'text-slate-950')}
>
  매출
</h2>;
```

- 같은 역할은 같은 스케일을 사용한다. 제목만 모바일에서 한 단계 축소하고 본문·입력은 16px를 유지한다.
- 12px는 짧은 부가 정보에만 사용한다. 버튼·오류·핵심 금액에는 사용하지 않는다.
- 공통 Button·TextButton·Pagination은 모든 크기에서 `label`을 사용한다. `size`는 클릭 영역과 간격을 결정한다.
- 공통 Input은 모든 크기에서 `body`를 사용한다. Card.Title 기본은 `subtitle`이며 페이지의 주요 섹션에서는 `sectionTitle`로 지정한다.
- 차트 축·캘린더 요일·짧은 일정 칩은 밀도가 높은 부가 정보로 `caption`을 사용한다. 차트 범례·툴팁은 `supporting`, 날짜 선택 버튼은 `label`이다.
- 랜딩의 마케팅용 큰 제목과 브랜드 로고는 서비스 페이지 제목과 역할이 달라 기존 display 크기를 유지한다. 일반 본문·설명·액션은 공통 역할을 사용한다.
- 제목 크기가 HTML 계층을 결정하지 않는다. `h1`·`h2`·`label` 등 의미에 맞는 태그를 유지한다.
- 모바일 탑 앱 바에 페이지 제목을 표시하면 본문 제목은 `sr-only`로 유지해 중복 표시를 피한다.
- 긴 라벨은 줄바꿈을 허용하고 숫자는 오른쪽 정렬한다. 폭 부족을 글자 축소로 해결하지 않는다.
- 입력의 줄높이를 높일 때 내부 높이도 확인한다. 42~44px 입력에 24px 줄높이를 쓰면 세로 패딩을 8px 수준으로 맞춘다.
- 이 스케일은 일관성·위계·가독성을 위한 프로젝트 결정이며 WCAG가 요구하는 고정 폰트 크기는 아니다.
- 접근성 검증에서는 200% 확대, 사용자 줄 간격 변경, 실제 배경과의 대비를 별도로 확인한다.
  기본 줄높이 1.5배가 모든 요소의 WCAG 필수값인 것은 아니다.

근거: [Tailwind 글자 크기 토큰](https://tailwindcss.com/docs/font-size),
[W3C 텍스트 확대](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html),
[W3C 텍스트 간격](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).

## 반응형 — desktop-first

**기본 원칙은 desktop-first다.** 디자인이 데스크톱 기준으로 내려오므로, 구현도 같은 방향으로 맞춘다.

- 접두사 없는 기본 클래스는 **데스크톱 레이아웃**을 정의한다.
- `max-*` 변형(max-width)으로 **작은 화면을 좁혀 나간다.**
- `min-*` 변형(`md:`, `lg:` 등 기본 Tailwind 접두사)과 **혼용하지 않는다.** 두 방향을 섞으면 중첩 구간에서 우선순위를 추적하기 어렵다.

```tsx
// ✅ 기본은 데스크톱, 작은 화면에서 좁힌다
<div className="flex flex-row gap-8 max-desktop:gap-6 max-tablet:flex-col max-tablet:gap-4" />
```

```tsx
// ❌ min-*와 max-*를 섞는다
<div className="md:flex-row flex flex-col max-tablet:gap-4" />
```

## Breakpoint

Tailwind 기본 breakpoint(`sm`/`md`/`lg`/`xl`/`2xl`)를 쓰지 않고, **디자인 기준 viewport로 커스텀 토큰을 정의해 사용한다.** 기본값은 디자인 기준(744px 등)과 어긋나기 때문이다.

| 이름      | 값     | 대상    |
| --------- | ------ | ------- |
| `desktop` | 1920px | Desktop |
| `laptop`  | 1024px | Laptop  |
| `tablet`  | 744px  | Tablet  |
| `mobile`  | 480px  | Mobile  |

Tailwind v4에서는 `app/globals.css`의 `@theme`에 선언한다.

```css
@theme {
  --breakpoint-mobile: 480px;
  --breakpoint-tablet: 744px;
  --breakpoint-laptop: 1024px;
  --breakpoint-desktop: 1920px;
}
```

desktop-first이므로 실제로 사용하는 변형은 `max-desktop:`(1920px 미만), `max-laptop:`(1024px 미만), `max-tablet:`(744px 미만)이다. 기본 클래스가 1920px 이상 구간을 담당한다.

`mobile`(375px)은 그보다 좁은 화면을 따로 다루지 않는 한 변형으로 쓸 일이 없다. 최소 지원 폭의 기준값으로만 둔다.
