# 스타일/반응형 규칙

## 클래스 정렬

Tailwind 클래스 순서는 `prettier-plugin-tailwindcss`로 자동 정렬한다.

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
