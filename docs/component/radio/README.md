# Radio 컴포넌트 설계

여러 옵션 중 하나를 고르는 라디오 그룹 컴포넌트 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 단계별 PR로 진행한다.

## 개요

Figma `components` 페이지 `buttons` 섹션(`71:70664`)의 `radio`([`170:148708`](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=170-148708)) 노드다. `size`(default/small) × `state`(default/checked) 2축 4개 인스턴스로 구성되고, hover·disabled·focus 변형은 정의되어 있지 않다.

| size | state | 노드 | 크기 |
| --- | --- | --- | --- |
| default | default | `166:148118` | 20×20 |
| default | checked | `170:148709` | 20×20 |
| small | default | `313:55903` | 18×18 |
| small | checked | `313:55905` | 18×18 |

- 바깥 원: `border 1.6px`, 반경은 리터럴 `10px`(20px 기준)이지만 두 크기 모두 반지름이 한 변의 절반 이상이라 완전한 원으로 렌더된다.
- 안쪽 dot(체크 시에만 존재): default `10×10`, small `8×8`. 부모 안에서 정중앙에 위치(20px 부모에서 5px 인셋 = 정중앙과 동일한 결과).
- 배경은 체크 여부와 무관하게 항상 `white/50` — **체크 표시는 테두리 색 전환 + dot 등장으로만** 이뤄지고 배경은 채워지지 않는다.
- 컬러: `white/50`(#fffffe, 배경) · `slate/300`(#999797, 기본 테두리) · `primary/500`(#ffd98a, 체크 테두리) · `secondary/600`(#ebddb9, dot 채움).
- 텍스트·아이콘 레이어 없음 — 라벨은 호출부가 구성해야 한다.
- Figma는 낱개 컨트롤 노드만 정의한다. 여러 항목을 묶은 그룹(`RadioGroup`)은 Figma에 없다.

## 설계 결정 요약

| 결정 | 선택 | 근거 |
| --- | --- | --- |
| 그룹 구조 | **`RadioGroup` 컴포넌트 추가** — 단일 `Radio` atom이 아니라 다중 아이템 단일 선택을 관리하는 컨테이너를 둔다 | 사용자 확인. Figma는 낱개 노드만 정의하지만, 실제 "여러 옵션 중 하나 선택" 용도에는 그룹 컨테이너가 필요 |
| API 형태 | **compound**(`RadioGroup` + `RadioGroupItem`) — 호출부가 항목 수·라벨을 구성 | 옵션 수·라벨이 화면마다 다르다. Modal의 compound 구조와 같은 이유 |
| 기반 primitive | Base UI `Radio`/`RadioGroup`(`@base-ui/react`) | roving tabindex, `role="radiogroup"`/`role="radio"`, 키보드 화살표 이동을 직접 구현하지 않기 위함 |
| 시작점 | `shadcn add radio-group`(style: `base-nova`) 생성 후 재구성 | 레지스트리 확인 결과 Base UI `Radio`/`RadioGroup`을 그대로 감싼 구조라 별도 교체 없이 유지 |
| `disabled` 지원 여부 | **지원하지 않음 — 타입에서 `Omit`** | Figma에 disabled 변형이 없고 지금 화면에도 Radio를 비활성화해야 하는 요구가 없다. Checkbox의 `indeterminate`와 같은 이유로 `Omit<RadioPrimitive.Root.Props, 'disabled'>`로 막아둔다. 필요해지면 그때 시각 스타일까지 포함해 설계한다 |

## `shadcn add radio-group` 적용 시 주의

레지스트리(`base-nova/radio-group.json`) 확인 결과는 다음과 같다.

```json
{
  "name": "radio-group",
  "dependencies": ["cn"],
  "files": [{ "path": "registry/base-nova/ui/radio-group.tsx", "type": "registry:ui" }]
}
```

Modal·Pagination과 달리 `registryDependencies`에 `button`이 없다 — Button 생성물이 함께 딸려오지 않으므로 삭제할 대상이 없다. 생성물은 `RadioGroup`(`@base-ui/react/radio-group`)과 `RadioGroupItem`(`@base-ui/react/radio`의 `Radio.Root` + `Radio.Indicator`)을 한 파일에 함께 내보낸다.

스타일은 대부분 교체 대상이다.

| shadcn 기본값 | Figma | 조치 |
| --- | --- | --- |
| `size-4`(16px) 고정, `border-input` | `20px`/`18px` 2단계 size, `slate-300`/`primary-500` | size variant 추가, 컬러 override |
| `data-checked:bg-primary` — 체크 시 배경을 채움 | 배경은 항상 `white-50`, 체크 시 **테두리만** `primary-500`로 전환 | 배경 채움 클래스 제거 |
| Indicator 내부 dot `bg-primary-foreground`, `size-2`(8px) 고정 | dot `secondary-600`, `10px`(default)/`8px`(small) | 컬러·사이즈 variant 반영 |
| `group-has-[:focus-visible]/field-label:*` — `FieldLabel` 컴포넌트 존재를 전제한 포커스 클래스 | 해당 없음(`FieldLabel` 미도입) | 단순화 — Button과 동일한 `focus-visible:ring-3 focus-visible:ring-ring/50`로 교체 |
| `aria-invalid:*` (폼 검증 스타일) | Figma에 해당 상태 없음 | 우선 제거. 폼 검증(React Hook Form) 연동 시점에 재검토 — "확인 필요" 참고 |
| `dark:` 변형 다수 | 이 프로젝트는 다크모드 토큰만 정의돼 있고 별도 다크모드 요구 없음 | 기존 Modal·Pagination과 동일하게 라이트 값만 사용, `dark:` 클래스는 가져오지 않음 |

파일명도 생성물은 `radio-group.tsx`(lowercase)인데 [naming.md](../../convention/naming.md)는 `Name.tsx`를 요구하므로 재구성 단계(`_common/Radio/`)에서 `RadioGroup.tsx`·`RadioGroupItem.tsx`로 분리해 재작성한다.

## 레이어 구조

```
① 생성물   src/components/_common/ui/radio-group.tsx      shadcn 원본 (base-nova) — import만 정리
② 구현     src/components/_common/Radio/
              ├── RadioGroup.tsx        # Base UI RadioGroup 래핑 + 레이아웃(gap)
              └── RadioGroupItem.tsx    # Radio.Root + Radio.Indicator, cva: size
```

[ui-component.md](../../convention/ui-component.md)·[folder-structure.md](../../architecture/folder-structure.md)의 배치 기준과 기존 Modal(`_common/ui/dialog.tsx` + `_common/Modal/`)·Pagination(`_common/ui/pagination.tsx` + `_common/Pagination/`) 구조를 그대로 따른다. 각 파일은 named export를 유지하고 배럴 `index.ts`는 두지 않는다([code-style.md](../../convention/code-style.md)).

## API

```tsx
import { RadioGroup } from '@components/_common/Radio/RadioGroup';
import { RadioGroupItem } from '@components/_common/Radio/RadioGroupItem';

const [period, setPeriod] = useState('monthly');

<RadioGroup value={period} onValueChange={setPeriod} aria-label="정산 주기">
  <label className="flex items-center gap-2">
    <RadioGroupItem value="monthly" />월간
  </label>
  <label className="flex items-center gap-2">
    <RadioGroupItem value="weekly" size="small" />주간
  </label>
</RadioGroup>;
```

`RadioGroupItem`은 Figma와 동일하게 아이콘/텍스트 레이어가 없는 원형 컨트롤만 렌더한다. **라벨 텍스트는 이 컴포넌트가 갖지 않고 호출부가 `<label>`로 감싸 구성한다** — Figma에 라벨 타이포그래피 자체가 정의되어 있지 않기 때문이다.

`RadioGroupItemProps`는 `Omit<RadioPrimitive.Root.Props, 'disabled'>`를 확장한다 — `disabled`는 제외한다(위 "설계 결정 요약" 참고).

| prop | 대상 | 설명 |
| --- | --- | --- |
| `value` / `onValueChange` | `RadioGroup` | Base UI `RadioGroup.Props` 그대로 확장 |
| `aria-label` / `aria-labelledby` | `RadioGroup` | 그룹을 설명하는 접근 가능한 이름 — 필수 (아래 "접근성" 참고) |
| `value` | `RadioGroupItem` | 그룹 내에서 이 항목을 식별하는 값 |
| `size` | `RadioGroupItem` | `default`(20px, 기본값) \| `small`(18px) |

## variant (cva)

| 축 | 값 | 매핑 |
| --- | --- | --- |
| `size` | `default` | `size-5`(20px) 바깥 원, dot `size-2.5`(10px) |
| | `small` | `size-4.5`(18px) 바깥 원, dot `size-2`(8px) |

공통 base 클래스: `relative flex items-center justify-center shrink-0 rounded-full border-[1.6px] bg-white-50 border-slate-300 outline-none transition-colors data-checked:border-primary-500 focus-visible:ring-3 focus-visible:ring-ring/50`. dot(Indicator 내부)은 `rounded-full bg-secondary-600`.

`border-[1.6px]`는 Tailwind 기본 보더 스케일(0/1/2/4/8px)에 없는 Figma 리터럴 값이라 임의값으로 둔다. 반경은 20px·18px 모두 리터럴 `10px`이 이미 한 변의 절반을 넘어 `rounded-full`만으로 Figma와 동일한 원이 나온다(별도 임의값 불필요).

dot 중앙 배치는 `flex items-center justify-center`로 구현한다. Figma Dev Mode에서 실제 노드를 확인한 결과, Figma 원본도 `display: flex; padding: 0.5rem(5px); justify-content: center; align-items: center;`로 구성돼 있다 — 즉 이 구현은 근사치가 아니라 **Figma 원본과 동일한 구조**다(패딩 5px가 두 크기 모두 동일하고, `20px 바깥 − 5px×2 = 10px dot`, `18px 바깥 − 5px×2 = 8px dot`으로 정확히 맞아떨어진다). Base UI `Radio.Indicator`의 기본 패턴과도 맞는다.

## 디자인 토큰 매핑

전부 기존 토큰과 값이 정확히 일치해 신설·불일치 항목이 없다.

| Figma 변수 | 값 | 코드 토큰 |
| --- | --- | --- |
| `white/50` | `#fffffe` | `--color-white-50` (배경) |
| `slate/300` | `#999797` | `--color-slate-300` (기본 테두리) |
| `primary/500` | `#ffd98a` | `--color-primary-500` (체크 테두리) |
| `secondary/600` | `#ebddb9` | `--color-secondary-600` (dot 채움) |

Button·Pagination에서 있었던 "같은 이름인데 값이 다른" 불일치가 Radio에는 없다.

## 접근성

Base UI `RadioGroup`/`Radio`가 `role="radiogroup"`/`role="radio"`, `aria-checked`, 키보드 화살표 이동(roving tabindex)을 담당한다. [accessibility.md](../../convention/accessibility.md) 기준으로 아래를 추가로 지킨다.

- `RadioGroup`은 **`aria-label` 또는 `aria-labelledby`가 필수**다. 원형 컨트롤만 렌더하고 자체 제목 텍스트가 없어, 없으면 스크린리더가 그룹의 의미를 설명할 방법이 없다.
- `focus-visible:ring-3 focus-visible:ring-ring/50`으로 포커스 스타일을 제공한다(Button과 동일 패턴, `--ring`은 `--color-primary-500`에 매핑).

## 렌더링 경계

`"use client"`는 상태·이벤트가 실제로 필요한 말단 파일에만 둔다([rendering.md](../../architecture/rendering.md)).

| 파일 | `"use client"` | 트리거 |
| --- | --- | --- |
| `_common/ui/radio-group.tsx` | ○ | 1·3 — Base UI가 내부적으로 상태·이벤트를 다룸(생성물 자체가 `"use client"`) |
| `RadioGroup.tsx` | ○ | 1·3 |
| `RadioGroupItem.tsx` | ○ | 1·3 |

Server Component인 `page.tsx`가 `<RadioGroup>`을 렌더해도 부모는 클라이언트가 되지 않는다([rendering.md 4항](../../architecture/rendering.md#4-ui-primitive의-클라이언트-경계는-전염되지-않는다)).

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다.

```
test/components/_common/Radio/radioGroup.test.tsx
```

| 대상 | 검증 |
| --- | --- |
| 선택 | 클릭·키보드(화살표)로 `onValueChange` 호출, 그룹 내 단일 선택 유지 |
| variant | `size` `default`/`small` 클래스 적용, 체크 시 배경이 아닌 테두리만 전환되는지 |
| 접근성 | `role="radiogroup"`/`role="radio"`, `aria-checked`, `aria-label` 누락 시 실패하는지(타입 레벨에서 필수화 여부는 "확인 필요") |

## 단계별 PR 계획

Modal·Pagination과 동일하게 [stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)로 진행하고, `git worktree`로 브랜치별 독립 디렉터리에서 작업한다.

| 순서 | 브랜치 | base | 내용 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | `design/common-selector` | `dev` | **이 설계 문서** + [checkbox/README.md](../checkbox/README.md) + `docs/component/README.md`·`docs/README.md` 인덱스 갱신 | 작성 중(현재 브랜치) |
| 2 | `feat/common-radio-ui` | `design/common-selector` | `shadcn add radio-group` + `RadioGroup`·`RadioGroupItem` 구현 | 예정 |
| 3 | `feat/common-radio-test` | `feat/common-radio-ui` | Vitest 테스트 | 예정 |

## 확인 필요

아래 항목은 **임의로 확정하지 않는다.** 확인 후 이 문서에 반영한다.

`RadioGroup` 컨테이너 추가 여부와 `disabled` 미지원(Omit) 결정은 사용자 확인을 거쳐 위 "설계 결정 요약"에 반영했다. 아래는 그 과정에서 새로 발견된, 아직 결정되지 않은 항목이다.

### 1. React Hook Form 연동 시 `aria-invalid` 처리

shadcn 생성물의 `aria-invalid:*` 클래스를 이번 구현에서는 제거했다. 이 컴포넌트가 폼 검증과 함께 쓰이는 시점에 다시 필요할 수 있어, 그때 재검토한다.

### 2. `RadioGroup` 레이아웃 방향

생성물 기본값(`grid w-full gap-2`, 세로 나열)을 그대로 가져왔다. Figma에 실제 그룹 레이아웃이 없어 가로 배치가 필요한 화면이 나오면 `orientation` 같은 축이 필요할 수 있다 — 실사용례가 생기는 시점에 검토한다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 목표: [convention/accessibility.md](../../convention/accessibility.md)
- 유사 사례: [component/modal/README.md](../modal/README.md), [component/pagination/README.md](../pagination/README.md)
- 같이 설계된 문서: [component/checkbox/README.md](../checkbox/README.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
