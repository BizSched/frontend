# IconButton 컴포넌트 설계

`Button`과 형제 관계인 원형 아이콘 버튼들을 모아두는 폴더다. `Button`과 겹치는 내용(shadcn 검증 근거, `cva`/`cn` 공통 규칙, 렌더링 경계 원칙 등)은 반복하지 않고 [button/README.md](../button/README.md)를 참조한다. 이 문서는 IconButton 계열에서 **새로 결정한 것·결정해야 하는 것**만 다룬다.

`IconButton`은 단일 컴포넌트가 아니다. [button/README.md의 "버튼 계열 컴포넌트 분리"](../button/README.md#버튼-계열-컴포넌트-분리)에서는 4개 Figma 노드가 "원형 단일 아이콘"으로 구조가 같다고 보고 `IconButton` 하나로 묶기로 했었지만, `get_design_context`로 실제 구조를 조회한 결과 공통점은 원형 shape뿐이고 노드마다 variant 축이 완전히 달랐다. 그래서 `IconButton`은 컴포넌트 이름이 아니라 **그룹 폴더명**이고, 그 아래 `SocialButton`·`NotificationButton`·`ReadMoreButton`·`DeleteButton` 4개 독립 컴포넌트를 둔다.

## 개요

| 컴포넌트             | Figma 프레임       | 노드 ID    | 지름      | variant 축                    | 구조적 특이사항                                                                |
| -------------------- | ------------------ | ---------- | --------- | ----------------------------- | ------------------------------------------------------------------------------ |
| `SocialButton`       | `btn_social`       | `71:70829` | 56px      | `social`: `Google` \| `Kakao` | 아이콘별로 배경색이 다름(아래 "variant" 참고)                                  |
| `NotificationButton` | `btn_notification` | `71:70836` | 64px      | `unread`: `boolean`           | `unread`일 때 우상단에 배지 dot이 별도 오버레이 엘리먼트로 추가됨              |
| `ReadMoreButton`     | `btn_read_more`    | `71:70824` | 40px      | `state`: `default` \| `open`  | 상태에 따라 아이콘 자체가 교체됨(`chevron-down` ↔ `chevron-up`)                |
| `DeleteButton`       | `btn_delete`       | `71:70849` | 18px/24px | `size`: `small` \| `large`    | 아이콘이 컨테이너 크기에 비례 스케일 — `Button`의 고정 24px 아이콘 규칙과 다름 |

Figma: [BizSched / design 캔버스](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-70829&m=dev)

`btn_action-매출 카테고리, 오늘 매출 추가 액션`(가칭 `ActionButton`)은 이 4개 중 일부를 내부에서 재사용하지만 shape 자체가 다른 별도 컴포넌트라 범위에서 제외한다. 브랜치 전략상 `ActionButton`은 이 그룹이 `dev`에 머지된 뒤 그 시점을 기준으로 분기한다([button/README.md의 "버튼 계열 브랜치 전략"](../button/README.md#버튼-계열-브랜치-전략) 참고).

## 설계 결정 요약

| 결정                   | 선택                                                                                                             | 근거                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 컴포넌트 구조          | `IconButton` 하나가 아니라 `SocialButton`·`NotificationButton`·`ReadMoreButton`·`DeleteButton` 4개 독립 컴포넌트 | 4개 노드의 variant 축이 서로 겹치지 않아(아이콘 교체/불리언+오버레이/토글/사이즈) 한 컴포넌트에 모으면 `unread`가 `DeleteButton`에도 노출되는 식의 prop 오염이 생긴다                                                                                                                                                                                                                                   |
| 파일 구조              | `_common/IconButton/` 폴더 아래 4개 파일이 형제로 위치. `IconButton.tsx` 집합 파일은 두지 않음                   | Modal처럼 폴더는 공유하되(`_common/Modal/ModalHeader.tsx`류 패턴), Modal과 달리 4개 컴포넌트가 컨텍스트·합성 관계를 공유하지 않아 `Modal.tsx` 같은 dot-notation 집합 파일은 두지 않는다. 아래 "레이어 구조" 참고                                                                                                                                                                                        |
| 공유 shape             | 비-export 내부 유틸(`iconButtonBase.ts`)로 분리. **보더는 포함하지 않는다**                                      | 원형·focus·disabled 등 4개가 실제로 공유하는 값만 단일 출처로 관리. `size`는 컴포넌트마다 달라 공유 대상이 아니다. 보더는 색이 컴포넌트마다 다르고 `SocialButton`의 `Kakao` variant는 보더가 아예 없어, base에 `border`만 넣으면 색을 지정하지 않은 기본 보더(브라우저 기본값)가 `Kakao`에도 새어 나간다 — 그래서 보더는 색과 함께 각 컴포넌트의 `cva`가 개별적으로 추가한다                            |
| 공유 shape 구현 방식   | `cva`가 아닌 `cn`으로 합칠 고정 클래스 상수(`ICON_BUTTON_BASE_CLASSNAME`)                                        | `cva`는 한 컴포넌트 안에서 여러 축을 조합하는 도구인데, base는 변형 축이 없는 고정값이라 과한 도구다. [naming.md](../../convention/naming.md)의 상수 규칙(`CONST_VALUE`)을 따른다                                                                                                                                                                                                                       |
| 기반 primitive         | Base UI `Button` 직접 래핑 (`_common/Button/Button.tsx` 합성 아님)                                               | `Button`은 고정 너비·`px-[18px]`·`truncate` 텍스트 슬롯처럼 알약형 버튼 전용 클래스가 기본값이라 원형 아이콘 버튼엔 override 비용만 크다. Modal이 `shadcn add dialog` 생성물을 검증하며 낸 결론([modal/README.md](../modal/README.md#2-경유해도-업스트림-개선이-따라오지-않는다) "경유해도 업스트림 개선이 따라오지 않는다")과 같은 논리. `Button` 자체도 Base UI `Button`을 직접 감싼 것과 일관된 층위 |
| hover 상호작용         | 컴포넌트 prop이 아니라 `hover:` CSS pseudo-class로 처리                                                          | `Button`의 기존 결정(`state`는 prop이 아니라 `disabled` + `hover:`로 처리)을 그대로 승계. Figma에서도 `btn_notification`만 명시적 hover 프레임이 있고 나머지 3개는 상호작용 상태를 별도로 정의하지 않는다                                                                                                                                                                                               |
| `aria-label` 강제 방식 | 타입 레벨 필수화(`Required<Pick<ButtonPrimitive.Props, 'aria-label'>>`)                                          | 4개 모두 `children`이 없어 컴파일 타임으로 강제할 수 있다. 런타임 경고·ESLint 규칙보다 비용 대비 효과가 크다. 라벨 문구는 컴포넌트가 자동 합성하지 않고 호출부가 완성된 문자열을 전달한다                                                                                                                                                                                                               |
| 아이콘 자산 형식       | Figma 원본을 SVG(카카오만 PNG)로 다운로드해 `src/assets/icons/`에 저장, `next/image`로 렌더                      | 문서에 없던 항목이라 구현 전 사용자에게 확인 후 결정. 인라인 React SVG(path 재작성)는 옮겨 그리는 과정에서 Figma 원본과 미세하게 달라질 위험이 있어 제외. 자세한 내용은 아래 "레이어 구조 → 아이콘 자산" 참고                                                                                                                                                                                           |
| 보더 색 등 토큰 매핑   | 확인 필요 (이슈 #51 — 팀 논의 중)                                                                                | 아래 "확인 필요" 참고                                                                                                                                                                                                                                                                                                                                                                                   |

## 레이어 구조

```
src/components/_common/IconButton/
├── iconButtonBase.ts       # ICON_BUTTON_BASE_CLASSNAME 상수 export. 공유 shape(원형·focus-visible·disabled)만 담당 — 보더는 포함하지 않음(위 "설계 결정 요약" 참고)
├── SocialButton.tsx
├── NotificationButton.tsx
├── ReadMoreButton.tsx
└── DeleteButton.tsx
```

- 컴포넌트 파일명은 [naming.md](../../convention/naming.md)·[folder-structure.md](../../architecture/folder-structure.md)의 `PascalCase` 규칙을 따른다. `iconButtonBase.ts`는 컴포넌트가 아닌 내부 유틸이라 folder-structure.md의 "기타 utility·핸들러 파일명: camelCase" 규칙을 따른다.
- `_common/IconButton/SocialButton/SocialButton.tsx`처럼 컴포넌트마다 폴더를 한 번 더 만드는 구조는 쓰지 않는다. 각 컴포넌트가 파일 하나짜리라 폴더를 추가할 이유가 없고, `_common/<Component>/<Component>.tsx`를 한 단계 더 중첩한 패턴은 Button·Modal·Pagination 어디에도 없다.
- 각 컴포넌트는 Base UI `Button`을 직접 래핑하고, [ui-component.md](../../convention/ui-component.md)의 `cva`·`cn` 규칙에 따라 자신의 variant는 `cva`로 정의한 뒤 `cn(ICON_BUTTON_BASE_CLASSNAME, xxxVariants({...}), className)`처럼 `iconButtonBase`의 공유 클래스와 합친다. base 자체는 변형 축이 없는 고정값이라 `cva`로 만들지 않는다. `NotificationButton`처럼 variant 축이 시각적으로 아무 클래스도 바꾸지 않는 경우(`unread`는 배지 오버레이 JSX만 바꾸고 버튼 자체 클래스는 그대로다) `cva`에 빈 문자열 variant를 만들지 않고 일반 boolean prop으로 받는다 — 빈 variant는 나중에 읽는 사람이 "이 축이 실제로 뭘 바꾸는지" 찾아 헤매게 만든다.
- import는 각자 경로로 한다(`@components/_common/IconButton/SocialButton`). 배럴 `index.ts`를 두지 않는 [code-style.md](../../convention/code-style.md) 규칙과 자연히 맞는다.

### 아이콘 자산

아이콘 자산 위치·형식은 [folder-structure.md](../../architecture/folder-structure.md)에 컨벤션이 없어 구현 전 사용자에게 확인 후 아래로 결정했다.

```
src/assets/icons/
├── ic_google.svg
├── ic_kakao.png          # 유일한 래스터 자산 — 원본이 SVG가 아니라 PNG로 export됨
├── ic_bell.svg
├── ic_chevron-down.svg
├── ic_chevron-up.svg
└── ic_delete.svg
```

- Figma `get_design_context`/`download_assets`가 반환한 원본 파일을 **그대로** 저장한다(패스를 다시 그리거나 색을 치환하지 않음). `NotificationButton`의 배지 dot(`Ellipse795`)만 예외 — 단색 원이라 SVG 파일 대신 `bg-primary-500` 클래스로 대체한다(위 "디자인 토큰 매핑" 참고).
- `import Icon from '@assets/icons/xxx.svg'` 형태의 Next.js 정적 이미지 임포트 + `next/image`로 렌더한다. 새 의존성이 필요 없고, `unread`용 SVG를 인라인 JSX로 옮겨 그리지 않아 Figma 원본과 어긋날 위험이 없다.
- SVG 아이콘(`ic_google`·`ic_bell`·`ic_chevron-*`·`ic_delete`)에는 `unoptimized`를 명시한다. Next 이미지 옵티마이저는 `next.config.ts`에 `images.dangerouslyAllowSVG`를 켜지 않는 한 로컬 SVG도 최적화 서버로 넘기지 않고 차단하기 때문이다. `ic_kakao.png`는 래스터라 기본 최적화를 그대로 둔다.
- `ic_kakao.png`는 Figma에서 24px 정사각 기준 `top: 3.99%`, `height: 92.02%`로 비대칭 크롭되어 있다(스피치버블 모양 때문에 bounding box가 정사각이 아님). 이 비율을 그대로 재현하려면 24px `relative` wrapper 안에 퍼센트로 위치를 고정한 두 번째 wrapper를 두고, 그 안에서 `next/image`의 `fill` prop으로 채운다. `width`/`height` 숫자 prop과 퍼센트 `className`을 동시에 주면(`fill`을 쓰지 않으면) Next가 "Image with src ... has either width or height modified, but not the other" 경고를 띄운다 — `SocialButton.tsx`의 `Kakao` 분기가 이 패턴의 참조 구현이다.

## API

```tsx
import { SocialButton } from '@components/_common/IconButton/SocialButton';
import { NotificationButton } from '@components/_common/IconButton/NotificationButton';
import { ReadMoreButton } from '@components/_common/IconButton/ReadMoreButton';
import { DeleteButton } from '@components/_common/IconButton/DeleteButton';

<SocialButton social="Kakao" aria-label="카카오로 로그인" />
<NotificationButton unread aria-label="읽지 않은 알림" />
<ReadMoreButton state="open" aria-label="접기" />
<DeleteButton size="large" aria-label="삭제" />
```

4개 모두 `children`(텍스트) 슬롯 없이 아이콘만 렌더한다. `aria-label`은 타입 레벨에서 필수 prop이다(`Required<Pick<ButtonPrimitive.Props, 'aria-label'>>`) — `children`이 없어 컴파일 타임에 강제할 수 있다.

```ts
type SocialButtonProps = Omit<ButtonPrimitive.Props, 'children'> &
  Required<Pick<ButtonPrimitive.Props, 'aria-label'>> & {
    social?: 'Google' | 'Kakao';
  };
```

### 컴포넌트별 사용법

- **`SocialButton`** — 소셜 로그인 버튼. `social`(`'Google' | 'Kakao'`, 기본값 `'Google'`)에 따라 배경색과 아이콘이 함께 바뀐다. 로그인 폼에서 provider별로 하나씩 렌더한다.
- **`NotificationButton`** — 알림 벨 버튼. `unread`(기본값 `false`)를 `true`로 주면 우상단에 배지 dot만 추가되고 버튼 자체 스타일은 바뀌지 않는다. 배지는 순수 시각 표시라 "읽지 않음" 정보는 `aria-label`에 직접 담아 전달한다(예: `aria-label="읽지 않은 알림 3건"`). 클릭 시 동작(알림 패널 토글 등)은 `onClick`으로 호출부가 연결한다.
- **`ReadMoreButton`** — 펼치기/접기 토글 버튼. `state`(`'default' | 'open'`, 기본값 `'default'`)가 `'open'`이면 아이콘만 `chevron-up`으로 바뀐다. 내부에 열림 상태를 저장하지 않는 presentational 컴포넌트이므로, 실제 토글 상태(`useState` 등)와 `onClick` 핸들러는 호출부가 관리한다.
- **`DeleteButton`** — 삭제 버튼. `size`(`'small' | 'large'`, 기본값 `'small'`)에 따라 버튼 지름과 아이콘 크기가 함께 스케일되므로 아이콘 크기를 별도로 지정할 필요는 없다. 리스트 아이템·태그 등 조밀한 UI의 삭제 트리거에는 `small`, 단독 삭제 액션에는 `large`를 쓴다.

> `NotificationButton`의 `unread` prop은 [naming.md](../../convention/naming.md)의 "boolean: `is`·`has` 접두사" 규칙과 다르다(의도적 예외). Figma 노드의 variant 이름(`unread`)을 그대로 prop명으로 써서 디자인-코드 매핑을 1:1로 유지하는 쪽을 우선했다.

## variant (cva)

| 컴포넌트             | 축       | 값        | 스타일 (Figma 실측값)                                                                           |
| -------------------- | -------- | --------- | ----------------------------------------------------------------------------------------------- |
| `SocialButton`       | `social` | `Google`  | `bg-white-50 border border-[#ddd]`, `ic_google` 24px                                            |
|                      |          | `Kakao`   | `bg-[#ffee01]`(보더 없음), `ic_kakao` 24px                                                      |
| `NotificationButton` | `unread` | `false`   | `bg-[#fffffe] border border-[#ddd] hover:bg-[#fafafa] hover:border-[#ccc]`, `ic_bell` 24px 중앙 |
|                      |          | `true`    | 위 스타일 + 우상단 12px 배지 dot(`Ellipse795`) 오버레이 추가                                    |
| `ReadMoreButton`     | `state`  | `default` | `bg-[#fffffe] border border-[#c6c5c5]`, `ic_chevron-down` 24px                                  |
|                      |          | `open`    | 위 스타일, `ic_chevron-up` 24px로 아이콘 자체가 교체                                            |
| `DeleteButton`       | `size`   | `small`   | 지름 18px, 아이콘 6.5px(컨테이너 대비 비례)                                                     |
|                      |          | `large`   | 지름 24px, 아이콘 9px(비례), `border-[#ccc]`                                                    |

공통 shape는 `rounded-full`(`ICON_BUTTON_BASE_CLASSNAME`)뿐이다. `border`는 base가 아니라 컴포넌트별 `cva`가 색과 함께 추가한다 — `SocialButton`의 `Kakao`처럼 보더가 아예 없는 variant가 있어서다(위 "레이어 구조" 참고). 보더 색은 컴포넌트마다 `#ddd`(Social·Notification default) / `#ccc`(Notification hover·Delete) / `#c6c5c5`(ReadMore)로 조금씩 다르게 조회됐다 — `Button`에서 이미 겪은 "같은 변수명(`slate/200`·`slate/300` 계열), 다른 값" 패턴이 여기서도 재현된다(아래 "디자인 토큰 매핑" 참고). 이 색들을 토큰으로 통일할지는 색상 토큰 이슈(#51)가 정리된 뒤 결정한다.

## 디자인 토큰 매핑

아래는 Figma에서 `get_design_context`·`get_variable_defs`로 직접 조회한 원시값이다. `colors.css`와의 최종 대조는 색상 토큰 이슈(#51)에서 진행한다.

| 용도        | Figma 조회값                                                                                                                                   | 사용처                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 배경 흰색   | `#fffffe`(`white/50`)                                                                                                                          | Social(Google)·Notification·ReadMore·Delete 공통 배경                                    |
| 기본 보더   | `#ddd`(Social·Notification default) / `#c6c5c5`(ReadMore) / `#ccc`(Notification hover·Delete)                                                  | 노드마다 다른 값 — `Button`의 "디자인 토큰 매핑 — 불일치" 사례와 동일 패턴. #51에서 정리 |
| hover 배경  | `#fafafa`(Notification)                                                                                                                        |                                                                                          |
| Kakao 배경  | `#ffee01`                                                                                                                                      | 디자인 시스템 slate 계열이 아닌 브랜드 컬러로 추정                                       |
| 배지 dot 색 | `primary/500`(`#ffd98a`) — 기존 `--color-primary-500`과 동일한 토큰([button/README.md](../button/README.md#디자인-토큰-매핑)의 "일치" 표 참고) | Notification `unread` 배지. 신규 토큰 불필요, `bg-primary-500` 그대로 사용               |

`slate/400`(`#a4a4a4`)·`slate/500`(`#737373`)도 함께 조회됐지만 어느 요소의 값인지 반환된 클래스명만으로는 특정할 수 없었다(아이콘 SVG 내부 stroke로 추정). 사용처를 단정하지 않고 #51로 남긴다.

### 배지 dot 위치 (확정)

`btn_notification`의 `unread` 배지(`Ellipse795`)는 64px 컨테이너 기준 `top: 4px`, `left: 48px`, 지름 12px로 렌더된다 — 우측 끝(64px)까지 4px, 상단까지 4px로 대칭이다. Tailwind 기본 spacing 스케일(`1` = 4px)과 정확히 맞아 `top-1 right-1`로 표현한다.

## 접근성

- 4개 모두 텍스트 없이 아이콘만 렌더하므로, [button/README.md의 "확인 필요" 2번](../button/README.md#2-아이콘-전용-버튼의-aria-label-규칙)(아이콘 전용 버튼의 `aria-label` 규칙)이 여기서 실제로 막히는 지점이었다. 타입 레벨 필수화로 해소한다(위 "API" 참고).
- `NotificationButton`의 `unread` 배지는 시각적 표시일 뿐이며, "읽지 않음" 정보를 포함한 문구(예: "읽지 않은 알림")는 컴포넌트가 자동 합성하지 않고 호출부가 상황에 맞게 채운다.
- focus 스타일은 `Button`의 `focus-visible:ring-3 focus-visible:ring-ring/50` 패턴 재사용을 우선 검토한다(신규 토큰 없이 [accessibility.md](../../convention/accessibility.md)의 "focus 상태 제거 금지"를 만족한 전례).

## 렌더링 경계

- hover는 CSS `hover:`로 처리하므로 그 자체로 클라이언트 경계가 필요하지 않다.
- `ReadMoreButton`의 `state`(`default`/`open`)는 `Button`의 `disabled`처럼 호출부가 제어하는 prop으로 받는다 — 컴포넌트 내부에 `useState`를 두지 않는 presentational 컴포넌트로 유지하고, 실제 펼침/접힘 토글 로직은 호출부 책임으로 둔다.
- 위 전제대로면 4개 파일 모두 [rendering.md 4항](../../architecture/rendering.md#4-ui-primitive의-클라이언트-경계는-전염되지-않는다) "UI primitive의 클라이언트 경계는 전염되지 않는다"에 따라 `"use client"`가 필요 없다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다.

```
test/components/_common/IconButton/SocialButton.test.tsx
test/components/_common/IconButton/NotificationButton.test.tsx
test/components/_common/IconButton/ReadMoreButton.test.tsx
test/components/_common/IconButton/DeleteButton.test.tsx
```

| 대상                 | 검증                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| variant              | 컴포넌트별 축(`social`/`unread`/`state`/`size`) 조합에 따른 클래스·아이콘 렌더 |
| `NotificationButton` | `unread` 시 배지 dot 렌더 여부                                                 |
| `ReadMoreButton`     | `state` 값에 따라 아이콘이 실제로 교체되는지                                   |
| 접근성               | `aria-label` 존재, `role="button"`, `focus-visible:ring-*` 적용                |
| disabled             | 클릭 이벤트 미발생, `pointer-events-none` 적용                                 |

## 단계별 PR 계획

[button/README.md의 "버튼 계열 브랜치 전략"](../button/README.md#버튼-계열-브랜치-전략)에 따라 `dev`에서 바로 분기해 독립적으로 진행한다(`TextButton`·`SelectButton`·드롭다운 트리거와 병렬, 1차 그룹). `Button` 자체 단계와 동일하게 설계 문서+구현을 한 PR로, 테스트를 별도 PR로 순차 진행한다. 4개 컴포넌트를 한 PR에 묶는 이유는 하나의 그룹 폴더(`_common/IconButton/`)로 함께 착수하는 편이 리뷰 단위로 자연스럽기 때문이고, 이후 컴포넌트가 늘어나 PR이 비대해지면 컴포넌트 단위로 쪼개는 것도 검토한다.

| 단계 | 브랜치                         | 내용                                                                                    | 상태      |
| ---- | ------------------------------ | --------------------------------------------------------------------------------------- | --------- |
| 1/2  | `feat/common-icon-button`      | 이 설계 문서 + `SocialButton`·`NotificationButton`·`ReadMoreButton`·`DeleteButton` 구현 | 구현 완료 |
| 2/2  | `feat/common-icon-button-test` | Vitest 테스트 4종                                                                       | 예정      |

이 그룹이 `dev`에 머지된 뒤에야 `ActionButton`이 그 시점의 `dev`를 기준으로 분기할 수 있다([button/README.md](../button/README.md#버튼-계열-브랜치-전략) 2차 항목).

## 확인 필요

아래 항목은 **임의로 확정하지 않는다.** 확인 후 이 문서에 반영한다.

기반 primitive·공유 shape 구현 방식·`aria-label` 강제 방식·배지 dot 색상/위치는 위 "설계 결정 요약"·"variant"·"디자인 토큰 매핑"·"API"에서 확정했다.

### 보더 색상 등 디자인 토큰의 일치 여부 (이슈 #51)

"디자인 토큰 매핑" 표의 원시값을 `colors.css`와 아직 대조하지 않았다. 특히 보더 색(`#ddd`/`#ccc`/`#c6c5c5`)이 컴포넌트마다 다른 게 의도된 디자인 차이인지, Figma 변수 해석 오차인지(= `Button`에서 겪은 "같은 변수명, 다른 값" 문제) 확인이 필요하다. `slate/400`·`slate/500`의 실제 사용처도 미확인이다. 팀 내 이슈 #51로 별도 논의 중이며, 결론이 나면 이 문서에 반영한다.

## 참고

- 형제 컴포넌트 설계·분리 근거: [button/README.md](../button/README.md)
- 공통 컴포넌트 문서 작성 규칙: [component/README.md](../README.md)
- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 네이밍 규칙: [convention/naming.md](../../convention/naming.md)
- 폴더 구조·컴포넌트 분리 기준: [architecture/folder-structure.md](../../architecture/folder-structure.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 접근성 목표: [convention/accessibility.md](../../convention/accessibility.md)
- 테스트 규칙: [convention/test.md](../../convention/test.md)
- PR 플로우: [collaboration/pr-flow.md](../../collaboration/pr-flow.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
