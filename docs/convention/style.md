# 스타일/반응형 규칙

## 클래스 정렬

Tailwind 클래스 순서는 `prettier-plugin-tailwindcss`로 자동 정렬한다.

> **도입 예정**: `.prettierrc`의 `plugins`에 해당 플러그인이 등록되어 있으나 아직 `package.json` 의존성에 없다. 의존성이 추가되기 전까지 Prettier 실행이 실패하므로, 이 규칙은 수동 정렬로 지킨다.

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
<div className="flex flex-col md:flex-row max-tablet:gap-4" />
```

## Breakpoint

Tailwind 기본 breakpoint(`sm`/`md`/`lg`/`xl`/`2xl`)를 쓰지 않고, **디자인 기준 viewport로 커스텀 토큰을 정의해 사용한다.** 기본값은 디자인 기준(744px 등)과 어긋나기 때문이다.

| 이름      | 값     | 대상    |
| --------- | ------ | ------- |
| `desktop` | 1920px | Desktop |
| `tablet`  | 744px  | Tablet  |
| `mobile`  | 375px  | Mobile  |

Tailwind v4에서는 `app/globals.css`의 `@theme`에 선언한다.

```css
@theme {
  --breakpoint-mobile: 375px;
  --breakpoint-tablet: 744px;
  --breakpoint-desktop: 1920px;
}
```

desktop-first이므로 실제로 사용하는 변형은 `max-desktop:`(1920px 미만), `max-tablet:`(744px 미만)이다. 기본 클래스가 1920px 이상 구간을 담당한다.

> **확인 필요**: `desktop` 경계를 1920px로 두면 **1440px·1512px 노트북에서도 `max-desktop:` 레이아웃(= 태블릿 스타일)이 적용된다.** 1920px는 디자인 검수용 최대 폭이고, 실제 데스크톱 사용자 대부분은 1280~1512px 구간에 있다. 검수 viewport 값을 그대로 breakpoint로 쓸지, 아니면 데스크톱 경계를 별도 값(예: 1280px)으로 둘지 확정이 필요하다.

`mobile`(375px)은 그보다 좁은 화면을 따로 다루지 않는 한 변형으로 쓸 일이 없다. 최소 지원 폭의 기준값으로만 둔다.
