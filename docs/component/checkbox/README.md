# Checkbox 컴포넌트 설계

단일 항목을 켜고 끄는 체크박스 컴포넌트 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 단계별 PR로 진행한다.

## 개요

Figma `components` 페이지 `icons` 섹션(`71:70901`)에 두 체크박스가 있다. 둘 다 `state`(inactive/active) 1축, 크기는 `18×18` 고정이고 사이즈 variant는 없다.

| 컴포넌트 | Figma 노드 |
| --- | --- |
| checkbox-01 | [`71:70903`](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-70903) |
| checkbox-02 | [`71:71081`](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-71081) |

두 노드를 잇는 부모 그룹이나 "언제 어느 걸 쓰는지"에 대한 설명은 Figma에 없다. 시각적으로 대비가 뚜렷이 달라 **하나의 `Checkbox` 컴포넌트의 두 variant**로 다뤘다(아래 "설계 결정 요약" 참고).

### Figma 원본 데이터 (SVG export 기준)

**checkbox-01** — 테두리가 있고 체크 시 배경이 채워지는, 대비가 높은 스타일.

```svg
<!-- inactive -->
<rect x="0.5" y="0.5" width="17" height="17" rx="5.5" fill="#FFFFFE" stroke="#CCCCCC" />

<!-- active -->
<rect width="18" height="18" rx="6" fill="#FFD98A" />
<path d="M5.44 9.22L7.74 11.51C7.89 11.66 8.12 11.66 8.27 11.51L12.56 7.22" stroke="#FFFFFE" stroke-width="2" stroke-linecap="round" />
```

- 모서리 반경 `rx 6`(inactive는 1px 스트로크를 감안해 `rx 5.5`인 17×17 rect — 시각 결과는 동일).
- inactive: 배경 `white/50`(`#fffffe`), 테두리 `1px #cccccc`.
- active: 배경 `primary/500`(`#ffd98a`), 테두리 없음, 체크마크 `white/50` 스트로크 `2px`.

**checkbox-02** — 테두리가 없고 배경색이 상태와 무관하게 고정된, 대비가 낮은 스타일.

```svg
<!-- inactive -->
<rect width="18" height="18" rx="6" fill="#FFF6E2" />

<!-- active -->
<rect width="18" height="18" rx="6" fill="#FFF6E2" />
<path d="M5.44 9.22L7.74 11.51C7.89 11.66 8.12 11.66 8.27 11.51L12.56 7.22" stroke="#EBDDB9" stroke-width="2" stroke-linecap="round" />
```

- 모서리 반경 `rx 6`, 테두리 없음.
- 배경은 inactive·active 모두 동일하게 `#FFF6E2` — **체크 여부는 체크마크 등장으로만** 드러난다.
- 체크마크 색 `secondary/600`(`#ebddb9`).
- `#FFF6E2`는 Figma 변수 조회 결과인 `primary/200`(`#fff5e2`)와 마지막 자리 하나가 다르다(SVG export 반올림 오차로 보인다). 이 문서는 변수 조회값(`primary/200`)을 기준값으로 채택한다 — Button 문서에서 있었던 "생성된 계산값보다 메타데이터를 신뢰" 판단과 같은 이유다.
- 체크마크 path는 두 variant 모두 동일한 좌표(`M5.44 9.22L7.74 11.51...L12.56 7.22`)를 쓴다 — variant가 달라도 체크 아이콘 자체는 하나다.

## 설계 결정 요약

| 결정 | 선택 | 근거 |
| --- | --- | --- |
| 구조 | **단일 `Checkbox` 원자만** — `CheckboxGroup` 컨테이너를 두지 않는다 | 사용자 확인. Radio와 달리 체크박스는 항목마다 독립적으로 on/off되는 게 일반적이라 그룹 없이도 문제없다. 여러 개를 배열로 묶어 관리하는 화면이 생기면 그때 재논의 |
| variant 구성 | checkbox-01 → `variant="solid"`(기본값), checkbox-02 → `variant="subtle"` | 이 문서의 제안이다. Figma에 두 스타일의 용도 차이가 적혀있지 않아 이름·기본값 확정은 "확인 필요"에 남긴다 |
| 체크 아이콘 | 커스텀 path 대신 **lucide `Check`** 재사용 | Figma 체크마크가 단순한 2px 스트로크 tick이라 lucide 기본 `Check` 아이콘과 형태가 유사하다. Pagination이 화살표·생략 아이콘에 lucide를 쓴 것과 같은 이유 — Figma 벡터를 그대로 자산화하지 않아도 된다 |
| 기반 primitive | Base UI `Checkbox`(`@base-ui/react`) | `role="checkbox"`, `aria-checked`, 키보드(Space) 토글을 직접 구현하지 않기 위함 |
| 시작점 | `shadcn add checkbox`(style: `base-nova`) 생성 후 재구성 | 레지스트리 확인 결과 Base UI `Checkbox`를 그대로 감싼 구조라 별도 교체 없이 유지 |
| `indeterminate` 지원 여부 | **지원하지 않음 — 타입에서 `Omit`** | Figma에 이 상태가 없고 Indicator도 `Check`만 렌더한다. Base UI `Checkbox.Root.Props`를 그대로 확장하면 `indeterminate`가 함께 노출돼 `aria-checked="mixed"`인데 화면엔 대응 시각이 없는 불일치가 생긴다. `Omit<CheckboxPrimitive.Root.Props, 'indeterminate'>`로 타입 레벨에서 차단한다. "전체 선택" 같은 부분 선택 요구가 생기면 그때 `minus` 아이콘·스타일·테스트까지 포함해 별도로 설계한다 |

## `shadcn add checkbox` 적용 시 주의

레지스트리(`base-nova/checkbox.json`) 확인 결과는 다음과 같다.

```json
{
  "name": "checkbox",
  "dependencies": ["cn"],
  "files": [{ "path": "registry/base-nova/ui/checkbox.tsx", "type": "registry:ui" }]
}
```

Button 의존성은 없다. 다만 Modal 때와 같은 문제가 있다 — 생성물 원본이 `import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"`를 쓴다. 이 경로는 이 프로젝트에 없고 `@/*` bare alias 자체도 없다. `components.json`의 `iconLibrary: "lucide"` 설정으로 CLI가 `lucide-react`의 `CheckIcon` 직접 import로 치환해주는지 생성 직후 반드시 확인한다(Modal 문서의 같은 주의사항 참고).

스타일은 대부분 교체 대상이다.

| shadcn 기본값 | Figma | 조치 |
| --- | --- | --- |
| `size-4`(16px), `rounded-[4px]` | `18×18`, `radius 6px` | 사이즈·radius 교체(사이즈 variant는 없음 — 고정값) |
| `border-input` | `solid`: `#cccccc` / `subtle`: 테두리 없음 | variant별 override. `#cccccc`는 기존 토큰(`slate-300`은 `#999797`)과 값이 달라 Button의 tertiary 보더와 동일하게 하드코딩 — "디자인 토큰 매핑" 참고 |
| `data-checked:bg-primary` | `solid`는 배경이 `primary-500`으로 바뀌지만, `subtle`은 배경이 **상태와 무관하게 고정** | variant별로 분기 필요 — `subtle`은 `data-checked:bg-*`를 주지 않는다 |
| Indicator 아이콘 `text-current`(부모 텍스트색 상속) `size-3.5`(14px) | 체크마크 색이 배경색과 별개로 지정됨(`solid`: `white-50`, `subtle`: `secondary-600`) | `text-current` 상속 대신 variant별 아이콘 색을 명시 |
| `group-has-[:focus-visible]/field-label:*`, `aria-invalid:*` | 해당 없음 | Radio와 동일하게 단순화 — `focus-visible:ring-3 focus-visible:ring-ring/50`로 교체, `aria-invalid`는 폼 검증 연동 시점에 재검토 |
| `disabled:*`(CSS 의사 클래스) | Base UI `Checkbox.Root`는 기본적으로 `<span>`을 렌더링해 네이티브 `disabled` 속성이 없다 | `disabled:*` → `data-disabled:*`로 전부 교체(생성물 원본도 이 문제를 그대로 갖고 있다) — "variant (cva)" 참고 |
| `dark:` 변형 다수 | 다크모드 요구 없음 | 기존 문서들과 동일하게 라이트 값만 사용 |

파일명도 생성물은 `checkbox.tsx`(lowercase)인데 [naming.md](../../convention/naming.md)는 `Name.tsx`를 요구하므로 재구성 단계에서 `Checkbox.tsx`로 재작성한다.

## 레이어 구조

```
① 생성물   src/components/_common/ui/checkbox.tsx      shadcn 원본 (base-nova) — import·아이콘만 정리
② 구현     src/components/_common/Checkbox/
              └── Checkbox.tsx    # Checkbox.Root + Checkbox.Indicator, cva: variant
```

[ui-component.md](../../convention/ui-component.md)·[folder-structure.md](../../architecture/folder-structure.md)의 배치 기준과 기존 Modal·Pagination·Radio 구조를 그대로 따른다. named export를 유지하고 배럴 `index.ts`는 두지 않는다([code-style.md](../../convention/code-style.md)).

## API

```tsx
import { Checkbox } from '@components/_common/Checkbox/Checkbox';

const [agreed, setAgreed] = useState(false);

<label className="flex items-center gap-2">
  <Checkbox checked={agreed} onCheckedChange={setAgreed} />
  이용약관에 동의합니다
</label>;
```

```tsx
<Checkbox checked={agreed} onCheckedChange={setAgreed} variant="subtle" />
```

Radio와 마찬가지로 **라벨 텍스트는 컴포넌트가 갖지 않는다** — Figma에 텍스트 레이어가 없어 호출부가 `<label>`로 감싸 구성한다.

`CheckboxProps`는 `Omit<CheckboxPrimitive.Root.Props, 'indeterminate'>`를 확장한다 — `indeterminate`만 제외하고 Base UI가 제공하는 나머지 props(폼 관련 포함)를 그대로 연다.

| prop | 기본값 | 설명 |
| --- | --- | --- |
| `checked` / `onCheckedChange` | — | 제어(controlled) 사용 시 |
| `defaultChecked` | `false` | 비제어(uncontrolled) 사용 시 초기값 |
| `variant` | `solid` | `solid`(checkbox-01) \| `subtle`(checkbox-02) — 이름은 "확인 필요" |
| `disabled` | — | Base UI `disabled` — DOM에는 `data-disabled` 속성으로 노출된다(아래 "variant (cva)" 참고) |
| `name` / `value` | — | 폼 제출 시 필드명·체크 시 제출값 |
| `uncheckedValue` | 없음(미제출) | 미체크 시 제출값. 지정하지 않으면 네이티브 체크박스와 동일하게 **그 필드 자체가 폼 제출에서 빠진다** — 서버가 미체크도 값을 받아야 하는 필드는 반드시 지정 |
| `required` / `readOnly` / `form` | — | Base UI 네이티브 폼 속성 그대로 노출 |
| `aria-label` / `aria-labelledby` | — | 주변에 보이는 텍스트로 라벨이 연결되지 않는 경우 필수 (아래 "접근성" 참고) |

## variant (cva)

| 축 | 값 | 매핑 |
| --- | --- | --- |
| `variant` | `solid` | `bg-white-50 border border-[#cccccc] data-checked:border-transparent data-checked:bg-primary-500`, 아이콘 `text-white-50` |
| | `subtle` | `bg-primary-200`(체크 여부 무관 고정), 아이콘 `text-secondary-600` |

공통 base 클래스: `relative flex size-[18px] shrink-0 items-center justify-center rounded-[6px] outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-40`. 아이콘(Indicator 내부, lucide `Check`)은 `size-3.5`.

`rounded-[6px]`·`size-[18px]`는 Tailwind 기본 스케일에 없는 Figma 리터럴 값이라 임의값으로 둔다(Pagination의 `rounded-[1rem]`과 같은 상황). `border-[#cccccc]`도 기존 토큰과 값이 달라 하드코딩한다 — 아래 "디자인 토큰 매핑" 참고.

**`disabled:`가 아니라 `data-disabled:`를 쓴다.** Base UI `Checkbox.Root`는 기본값(`nativeButton` 미지정)에서 `<span>`을 렌더링한다 — 네이티브 `disabled` HTML 속성이 실리는 요소가 아니라서 Tailwind `disabled:`(`:disabled` CSS 의사 클래스)는 매칭되지 않는다. 대신 `data-disabled` 속성으로 상태를 노출하므로 스타일은 전부 `data-disabled:*`로 건다. (참고로 shadcn `base-nova/checkbox.json` 생성물 원본은 `disabled:*`를 그대로 쓰고 있어, 그대로 가져오면 같은 문제가 재현된다 — 재구성 단계에서 반드시 고친다.)

## 디자인 토큰 매핑

### 일치

| Figma 변수 | 값 | 코드 토큰 | 용도 |
| --- | --- | --- | --- |
| `white/50` | `#fffffe` | `--color-white-50` | `solid` 배경(inactive)·체크마크(active) |
| `primary/500` | `#ffd98a` | `--color-primary-500` | `solid` 배경(active) |
| `primary/200` | `#fff5e2` | `--color-primary-200` | `subtle` 배경(고정) |
| `secondary/600` | `#ebddb9` | `--color-secondary-600` | `subtle` 체크마크 |

### 불일치 — 토큰 없이 하드코딩

| 용도 | Figma 값 | 코드 | 비고 |
| --- | --- | --- | --- |
| `solid` 기본 테두리 | `#CCCCCC` | `border-[#cccccc]` | 이름이 같은 `--color-slate-300`은 `#999797`이라 재사용 불가. Button의 tertiary 보더에서 겪은 것과 같은 불일치 — Button 문서의 "확인 필요"(신규 토큰화 여부)가 아직 결론 나지 않은 상태라 이 문서도 동일하게 하드코딩으로 둔다 |

## 접근성

Base UI `Checkbox`가 `role="checkbox"`, `aria-checked`, 키보드(Space) 토글을 담당한다. [accessibility.md](../../convention/accessibility.md) 기준으로 아래를 추가로 지킨다.

- 주변 텍스트와 `<label>`로 연결되지 않는 단독 사용(아이콘만 있는 경우 등)에는 `aria-label`이 필수다.
- `focus-visible:ring-3 focus-visible:ring-ring/50`으로 포커스 스타일을 제공한다(Button·Radio와 동일 패턴).
- `subtle` variant는 미체크 상태에서 테두리도 배경 변화도 없어 **체크마크 유무만으로 상태를 구분**한다. 저시력 사용자에게는 대비가 약할 수 있다 — Figma 원본을 그대로 따르되, Pagination의 "알려진 예외"처럼 이 문서에도 명시해 둔다.
- `disabled` 시 `pointer-events-none`은 넣지 않는다 — `<span>` 기반이라 네이티브 `disabled` 속성은 아니지만, Base UI가 내부적으로 클릭·키보드 핸들러를 막아 상호작용을 이미 차단한다(Radio와 같은 이유). 시각 스타일은 `data-disabled:*`로 적용한다(위 "variant (cva)" 참고).

## 렌더링 경계

`"use client"`는 상태·이벤트가 실제로 필요한 말단 파일에만 둔다([rendering.md](../../architecture/rendering.md)).

| 파일 | `"use client"` | 트리거 |
| --- | --- | --- |
| `_common/ui/checkbox.tsx` | ○ | 1·3 — 생성물 자체가 Base UI 기반이라 `"use client"` |
| `Checkbox.tsx` | ○ | 1·3 |

Server Component인 `page.tsx`가 `<Checkbox>`를 렌더해도 부모는 클라이언트가 되지 않는다([rendering.md 4항](../../architecture/rendering.md#4-ui-primitive의-클라이언트-경계는-전염되지-않는다)).

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다.

```
test/components/_common/Checkbox/checkbox.test.tsx
```

클래스 문자열 검증은 리팩터링에 취약하다. **사용자가 관찰 가능한 결과(접근성 상태·상호작용 결과) 위주로 검증**하고, 스타일 클래스는 Figma 회귀를 막는 데 꼭 필요한 것만 제한적으로 확인한다.

| 대상 | 검증 |
| --- | --- |
| 토글(제어) | 클릭·키보드(Space)로 `onCheckedChange` 호출, `aria-checked`가 `true`/`false`로 반영되는지 |
| 토글(비제어) | `defaultChecked`만 준 경우에도 정상 토글되는지 |
| Indicator | `checked`일 때만 체크 아이콘이 렌더되는지 |
| disabled | 클릭·Space에 반응하지 않는지, `data-disabled` 속성이 붙는지(`disabled:` 클래스가 아니라 `data-disabled` 기준으로 확인) |
| 라벨 | `<label>`로 감싼 경우 accessible name이 라벨 텍스트로 연결되는지 |
| variant(제한적) | `solid` 체크 시 배경 전환, `subtle` 배경 고정 여부만 핵심 클래스로 확인 |

## 단계별 PR 계획

Modal·Pagination·Radio와 동일하게 [stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)로 진행하고, `git worktree`로 브랜치별 독립 디렉터리에서 작업한다.

| 순서 | 브랜치 | base | 내용 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | `design/common-selector` | `dev` | **이 설계 문서** + [radio/README.md](../radio/README.md) + `docs/component/README.md`·`docs/README.md` 인덱스 갱신 | 작성 중(현재 브랜치) |
| 2 | `feat/common-checkbox-ui` | `design/common-selector` | `shadcn add checkbox` + `Checkbox` 구현(variant 2종) | 예정 |
| 3 | `feat/common-checkbox-test` | `feat/common-checkbox-ui` | Vitest 테스트 | 예정 |

## 확인 필요

아래 항목은 **임의로 확정하지 않는다.** 확인 후 이 문서에 반영한다.

`CheckboxGroup`을 두지 않는다는 구조 결정은 사용자 확인을 거쳐 위 "설계 결정 요약"에 반영했다. 아래는 아직 결정되지 않은 항목이다.

### 1. `solid`/`subtle` 이름과 기본값

Figma에 두 스타일의 용도 구분이 없어 이 문서가 임의로 이름·기본값(`solid`)을 제안했다. 실제로 어느 화면에 어떤 variant를 쓰는지(예: 강조 폼 vs 목록 내 보조 선택) 기획·디자인 확인이 필요하다.

### 2. `#cccccc` 하드코딩 값의 토큰화 여부

Button 문서의 "확인 필요 1번"(`#bbbbbb`/`#cccccc` 토큰화 여부)과 같은 사안이다. 그 결정이 내려지면 이 문서의 `solid` 테두리 값도 함께 갱신한다.

### 3. `subtle` variant의 낮은 대비

"접근성" 절 참고. Figma 원본을 그대로 따랐으나 WCAG 관점에서 보강이 필요한지 디자이너 확인이 필요하다.

### 4. React Hook Form 연동 시 `aria-invalid` 처리

Radio 문서와 동일한 사안 — 폼 검증과 함께 쓰이는 시점에 재검토한다.

### 5. lucide `Check` 채택의 시각 검수

"체크마크가 단순한 tick이라 lucide `Check`와 유사하다"는 판단이 18px 크기에서도 실제로 맞는지는 검증되지 않았다. 선 길이·위치·끝단이 Figma와 다르게 보일 수 있다. 구현 PR(`feat/common-checkbox-ui`)의 완료 조건에 `solid`·`subtle` 두 상태의 Figma 스크린샷과 실제 렌더 결과 비교를 추가하고, 차이가 크면 커스텀 path로 전환한다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 목표: [convention/accessibility.md](../../convention/accessibility.md)
- 유사 사례: [component/radio/README.md](../radio/README.md), [component/modal/README.md](../modal/README.md), [component/pagination/README.md](../pagination/README.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
