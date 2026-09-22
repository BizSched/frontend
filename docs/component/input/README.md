# Input 컴포넌트 설계

여러 화면에서 반복되는 입력 필드를 하나의 공통 UI primitive로 통일하기 위한 설계 문서다. 구현은 이 문서를 단일 출처로 삼아 단계별 PR로 진행한다.

## 개요

Figma 컴포넌트 캔버스의 `inputs` 섹션(`71:70540`)에는 일반 텍스트 입력, 파일 업로드 입력, 검색 입력, 이미지 첨부 입력, 일부 도메인 전용 입력이 함께 모여 있다.

| 계열        | 대표 노드                 | 크기                              | 공통 골격                                   |
| ----------- | ------------------------- | --------------------------------- | ------------------------------------------- |
| 일반 Input  | `71:70542`, `71:70557`    | large 400×56, small 327×44        | border/radius/background + text + icon slot |
| 검색        | `71:70619`                | 302×48                            | pill radius + text + search icon            |
| 파일 업로드 | `71:70602`                | large 400×56, small 327×44        | dashed border + upload icon + text          |
| 이미지 첨부 | `71:70628`                | default 424×101, attached 160×101 | dashed surface + upload icon/preview        |
| 도메인 입력 | `105:193298`, `248:54560` | 222×42, 297×44                    | 매출 금액·날짜 선택 등 도메인 조합          |

일반 Input과 검색 입력은 실제 기능이 같은 텍스트 입력이다. 검색은 pill radius와 아이콘 위치만 다르므로 **별도 `SearchInput`을 만들지 않고 `Input variant="search"`로 처리한다.**

파일·이미지 입력은 시각적으로 Input과 비슷하지만 native file input, drag/drop, 파일명 표시, 이미지 preview 같은 동작 책임이 다르다. 따라서 일반 `Input` variant에 넣지 않고 `UploadInput`, `ImageInput` 후보로 분리한다. 단, drag/drop·파일명 표시·이미지 preview는 구현 방향으로 확정하되 **MVP 범위에서는 제외**한다.

### Figma 원본 노드

본문에서는 아래 이름으로 참조한다. 노드 ID는 이 표에서만 관리한다.

| 이름                          | 설명                                  | 노드 ID      |
| ----------------------------- | ------------------------------------- | ------------ |
| inputs 섹션                   | 입력 컴포넌트 모음                    | `71:70540`   |
| 일반 Input large default      | 400px / 56px, placeholder             | `71:70542`   |
| 일반 Input large enabled      | 400px / 56px, 비활성 배경처럼 보임    | `71:70546`   |
| 일반 Input large done         | 400px / 56px, 값 입력 완료            | `71:70585`   |
| 일반 Input large typing       | 400px / 56px, primary border          | `71:70589`   |
| 일반 Input large error        | 400px / 84px, 에러 메시지 포함        | `71:70593`   |
| 일반 Input small default      | 327px / 44px, placeholder             | `71:70557`   |
| UploadInput large placeholder | dashed border + upload icon           | `71:70602`   |
| Search placeholder            | pill radius, search icon              | `71:70619`   |
| ImageInput small default      | 424px / 101px, dashed upload surface  | `71:70628`   |
| 매출 수정 입력창              | 222px / 42px, 도메인 전용 numeric-ish | `105:193298` |
| post list date input          | 297px / 44px, 날짜 선택 도메인 조합   | `248:54560`  |

원본: [Figma — BizSched / inputs](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=71-70540)

## 설계 결정 요약

| 결정        | 선택                                              | 근거                                                                                   |
| ----------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| API 형태    | primitive props + `InputField` 조합               | Input의 핵심은 native `<input>`이다. compound 슬롯을 열 만큼 고정 골격이 복잡하지 않다 |
| 범위        | `Input` primitive + label/error wrapper           | `<input>` 접근성·폼 연동은 공통화하고, 검증 규칙과 submit은 호출부가 소유한다          |
| 시작점      | shadcn Input 구조 참조 후 Figma 스타일로 재구성   | shadcn 기본 구조는 유용하지만 height/radius/padding은 Figma와 다르다                   |
| 검색 입력   | `Input variant="search"`                          | 기능은 텍스트 입력과 같고 디자인 차이만 있다                                           |
| 파일 입력   | `UploadInput`, `ImageInput`은 후속 primitive 후보 | native file input, drag/drop, preview 등 동작 책임이 다르다                            |
| 도메인 입력 | 매출 수정 입력창·날짜 선택 입력은 도메인 조합     | 단위, 포맷, date picker 연결을 primitive에 넣지 않는다                                 |
| 아이콘      | lucide 사용                                       | `lucide-react`가 설치되어 있고, 검색·캘린더·업로드·보기/숨김 계열을 커버한다           |
| 색상        | `colors.css`의 slate 토큰 우선                    | 프로젝트 전역 토큰을 단일 기준으로 삼는다                                              |

## `shadcn add input` 적용 시 판단

Input은 shadcn 생성물을 그대로 두기보다 **구조만 참고하고 직접 재구성**한다.

| shadcn 기본값            | Figma                                      | 조치                        |
| ------------------------ | ------------------------------------------ | --------------------------- |
| 일반적인 `h-9` 계열 높이 | large 56px, small 44px, search 48px        | 교체                        |
| 기본 radius              | large 16px, small 12px, search full radius | 교체                        |
| 단일 input 스타일        | default/done/typing/error/tone 차이 존재   | `cva` 축으로 분리           |
| bare input               | 좌우 icon/action slot 필요                 | `leftSlot`/`rightSlot` 추가 |
| placeholder 중심         | label/error/description 접근성 연결 필요   | `InputField`에서 관리       |

shadcn은 코드 생성기다. 생성된 파일은 그 시점부터 이 저장소의 파일이고, 재실행은 병합이 아니라 덮어쓰기다. 이 컴포넌트에서 필요한 것은 native input 구조와 className 병합 패턴뿐이므로, 프로젝트 규칙에 맞춰 작성한다.

## 레이어 구조

```
① Primitive   src/components/_common/Input/       input surface, icon/action slot
② Field       src/components/_common/Input/       label, description, error 연결
③ Specialized src/components/_common/Input/       UploadInput, ImageInput 후보
④ Domain      src/components/{domain}/...         매출 금액 입력, 날짜 선택 등 조합
⑤ Page        app/**/page.tsx 또는 도메인 컨테이너 데이터 주입 · 폼 연결
```

공통 Input은 API 호출, 검증 규칙, form submit을 알지 않는다. React Hook Form 연결이 필요하면 호출부에서 `register`/`Controller`를 주입한다.

### 파일 구성

```
src/components/_common/Input/
├── Input.tsx          # native input + cva
├── InputField.tsx     # label, description, error message, aria 연결
├── InputIcon.tsx      # icon 크기와 shrink 처리
├── InputAction.tsx    # 우측 액션 버튼
├── UploadInput.tsx    # 후속 파일 입력 PR
└── ImageInput.tsx     # 후속 파일 입력 PR
```

각 파일은 개별 named export를 유지하고 배럴 `index.ts`를 만들지 않는다([code-style.md](../../convention/code-style.md)).

## API

```tsx
<InputField id="email" label="이메일" errorMessage="잘못된 이메일입니다.">
  <Input placeholder="이메일을 입력해주세요" status="error" />
</InputField>
```

```tsx
<InputField id="start-date" label="시작일">
  <Input
    placeholder="날짜를 선택해주세요"
    leftSlot={<CalendarIcon aria-hidden />}
  />
</InputField>
```

```tsx
<Input
  variant="search"
  type="search"
  aria-label="할 일 검색"
  placeholder="할 일을 검색해주세요"
  value={keyword}
  onChange={handleKeywordChange}
/>
```

```tsx
<UploadInput
  label="파일을 선택해주세요"
  inputProps={{ accept: '.pdf,.png,.jpg' }}
/>
```

| prop / slot | 기본값    | 설명                                                     |
| ----------- | --------- | -------------------------------------------------------- |
| `size`      | `large`   | `large` \| `small`                                       |
| `variant`   | `default` | `default` \| `search`                                    |
| `tone`      | `default` | `default` \| `muted`                                     |
| `status`    | `default` | `default` \| `done` \| `typing` \| `error` \| `disabled` |
| `leftSlot`  | —         | 좌측 아이콘 또는 장식 요소                               |
| `rightSlot` | —         | 우측 아이콘 또는 액션 요소                               |
| `className` | —         | `cn`으로 variant class와 병합                            |

### 슬롯 책임

| 슬롯/컴포넌트 | 책임                                        | 비고                                      |
| ------------- | ------------------------------------------- | ----------------------------------------- |
| `Input`       | 실제 `<input>`, size/status/tone 스타일     | value/defaultValue/onChange는 호출부 책임 |
| `InputField`  | label, description, error message 수직 배치 | `htmlFor`, `aria-describedby` 연결 담당   |
| `InputIcon`   | 좌우 아이콘 크기와 shrink 처리              | 아이콘은 lucide 사용                      |
| `InputAction` | 비밀번호 보기, clear 같은 우측 버튼         | 접근성 이름 필수                          |
| `UploadInput` | file input 트리거 surface                   | MVP 이후 drag/drop·파일명 표시 확장       |
| `ImageInput`  | 이미지 첨부 surface 또는 preview container  | MVP 이후 preview 표시 확장                |

## variant (cva)

[ui-component.md](../../convention/ui-component.md)에 따라 반복되는 디자인 차이만 `cva`로 정의한다.

| 축        | 값         | 매핑                                                                      | Figma 근거                  |
| --------- | ---------- | ------------------------------------------------------------------------- | --------------------------- |
| `size`    | `large`    | `h-14 px-4 py-4 text-base`, icon `size-6`, `rounded-[16px]`               | 400px / 56px                |
|           | `small`    | `h-11 px-3 py-3 text-sm`, icon `size-5`, `rounded-[12px]`                 | 327px / 44px                |
| `variant` | `default`  | 기본 직사각형 입력 surface                                                | 일반 입력                   |
|           | `search`   | `h-12 px-5 py-3 rounded-full`, 기본 right icon `Search`                   | 검색 입력                   |
| `tone`    | `default`  | `bg-white-50`                                                             | default/done/typing/error   |
|           | `muted`    | `bg-slate-50`                                                             | enabled/upload/image input  |
| `status`  | `default`  | `border-slate-300 text-slate-500 placeholder:text-slate-500`              | placeholder 상태            |
|           | `done`     | `border-slate-300 text-slate-700`                                         | 값 입력 완료                |
|           | `typing`   | `border-primary-500 text-slate-700`                                       | active typing               |
|           | `error`    | `border-warning-500 text-slate-700`                                       | error                       |
|           | `disabled` | `border-slate-300 bg-slate-50 text-slate-500 disabled:cursor-not-allowed` | enabled 노드가 muted 배경임 |

`state=enabled`는 Figma 이름과 시각 표현이 어긋난다. 배경은 `#FAFAFA`라 비활성/읽기 전용처럼 보이지만 텍스트는 placeholder 스타일이다. 구현에서는 DOM 의미에 맞춰 `disabled` 또는 `readOnly` prop을 우선하고, 단순 배경만 필요하면 `tone="muted"`로 처리한다.

### specialized input

| 컴포넌트      | 축/상태          | 매핑                                                    | Figma 근거    |
| ------------- | ---------------- | ------------------------------------------------------- | ------------- |
| `UploadInput` | `size=large`     | `h-14 px-4 py-4 rounded-[16px] border-dashed`           | 400px / 56px  |
|               | `size=small`     | `h-11 px-3 py-3 rounded-[12px] border-dashed`           | 327px / 44px  |
| `ImageInput`  | `state=default`  | `h-[101px] rounded-[16px] border-dashed justify-center` | 424px / 101px |
|               | `state=attached` | preview 카드. 후속 파일 입력 PR에서 상세화              | 160px / 101px |

## 디자인 토큰 매핑

### 일치

| Figma                          | 코드 토큰/클래스                         |
| ------------------------------ | ---------------------------------------- |
| 배경 `#FFFFFE`                 | `bg-white-50`                            |
| Active border `#FFD98A`        | `border-primary-500`                     |
| Error border/text `#FF4242`    | `border-warning-500`, `text-warning-500` |
| Large height `56px`            | `h-14`                                   |
| Small height `44px`            | `h-11`                                   |
| Search height `48px`           | `h-12`                                   |
| Large text `16px / 24px`       | `text-base`                              |
| Small/error text `14px / 20px` | `text-sm`                                |
| Search radius                  | `rounded-full`                           |

### 방침 — slate 색상은 CSS 토큰 기준 (확정)

`src/assets/styles/colors.css`의 slate 토큰을 우선한다. Figma의 slate 계열은 순수 무채색이고, 코드 토큰의 slate 계열은 더 어두운 따뜻한 색조지만, 구현에서는 프로젝트 토큰을 적용한다.

| 스타일명    | Figma     | colors.css 적용값 |
| ----------- | --------- | ----------------- |
| `slate/50`  | `#FAFAFA` | `#F4F3F3`         |
| `slate/300` | `#CCCCCC` | `#999797`         |
| `slate/400` | `#A4A4A4` | `#6B6A68`         |
| `slate/500` | `#737373` | `#1C1917`         |
| `slate/700` | `#333333` | `#161412`         |

`#FAFAFA`, `#CCCCCC`, `#737373`, `#333333`, `#A4A4A4`를 그대로 하드코딩하지 않고 프로젝트 slate 토큰으로 매핑한다. `#FAFAFA` 배경도 `tone="muted"`에서 `bg-slate-50`으로 처리한다.

### 방침 — letter-spacing은 인라인 (확정)

Figma 입력 텍스트는 16px에서 `-0.32px`, 14px에서 `-0.42px`를 쓴다. 전역 tracking 토큰을 신설하지 않고 다음처럼 인라인 임의값을 적용한다.

| 값                   | 사용처                 | 이유                            |
| -------------------- | ---------------------- | ------------------------------- |
| `tracking-[-0.02em]` | 16px 일반 입력         | Figma `-0.32px` 대응            |
| `tracking-[-0.03em]` | small/error/image text | Figma `-0.42px`, `-0.48px` 대응 |

### 임의값 사용

| 값               | 사용처                   | 이유                                   |
| ---------------- | ------------------------ | -------------------------------------- |
| `rounded-[16px]` | large input/upload/image | 현재 radius scale에 정확한 16px가 없다 |
| `rounded-[12px]` | small input/upload       | 현재 radius scale에 정확한 12px가 없다 |
| `h-[101px]`      | image input              | 고정 포맷 입력 surface                 |

radius 임의값이 Button, Card, Modal에서도 반복된다면 전역 radius scale 재정의를 별도로 검토한다.

## 파일·이미지 입력

`UploadInput`과 `ImageInput`은 시각적으로 Input과 비슷하지만 실제 동작은 `<input type="file">`이다. 접근성상 숨겨진 file input과 visible trigger를 연결해야 하므로 일반 `Input` variant로 넣지 않는다.

- `UploadInput`: placeholder 표시, 후속 단계에서 drag/drop과 첨부 후 파일명 표시 지원
- `ImageInput`: 이미지 첨부 surface, 후속 단계에서 첨부 후 preview 표시 지원
- drag/drop, 파일명 표시, 이미지 preview는 구현 방향으로 확정하되 MVP 범위에서는 제외한다.
- 업로드·검색·캘린더·보기/숨김·닫기 아이콘은 lucide를 사용한다.

## 반응형

[style.md](../../convention/style.md)에 따라 desktop-first + `max-*` 변형만 쓴다.

- Input 자체는 기본적으로 `w-full`을 따른다.
- Figma의 400px, 327px, 302px, 424px 값은 문서상 관찰값이며, 실제 width는 호출부 레이아웃이 정한다.
- size variant는 높이·padding·font·icon 크기만 담당한다.
- 모바일에서 width가 줄어드는 것은 부모 grid/form layout 책임이다.
- `min-*` breakpoint와 `max-*` breakpoint를 섞지 않는다.

## 접근성

- 실제 입력은 반드시 native `<input>`을 사용한다.
- placeholder를 label 대체로 쓰지 않는다. 보이는 label이 없는 경우 호출부가 `aria-label` 또는 `aria-labelledby`를 제공한다.
- 보이지 않는 label이 필요하면 `display: none`이 아니라 `sr-only`를 사용한다.
- 에러 메시지는 `InputField`가 `aria-describedby`로 연결하고, 에러 상태에서는 `aria-invalid`를 설정한다.
- password 보기/숨김, clear 같은 버튼은 명확한 접근성 이름을 가져야 한다.
- file input은 visible trigger와 숨겨진 input을 label 또는 id/htmlFor로 연결한다.
- 검색 입력은 `Input variant="search"`와 `type="search"`로 사용하고, 검색 실행 방식은 호출부가 결정한다.

## 렌더링 경계

Input primitive는 상태를 직접 소유하지 않는 controlled/uncontrolled 입력 surface로 시작한다.

| 파일              | `"use client"`             | 이유                                              |
| ----------------- | -------------------------- | ------------------------------------------------- |
| `Input.tsx`       | ✕                          | native input 렌더와 스타일 합성만 수행            |
| `InputField.tsx`  | ✕                          | id/description/error 연결만 수행                  |
| `InputAction.tsx` | ○                          | 비밀번호 보기·clear 등 이벤트 처리                |
| `UploadInput.tsx` | 후속 파일 입력 PR에서 결정 | drag/drop·파일명 표시를 자체 관리하면 Client 필요 |
| `ImageInput.tsx`  | 후속 파일 입력 PR에서 결정 | preview/delete 상태를 자체 관리하면 Client 필요   |

React Hook Form, 비밀번호 보기 토글, 파일 선택 상태처럼 이벤트와 상태가 필요한 동작은 호출부 또는 specialized component의 말단 파일에서 클라이언트 경계를 가진다.

## 테스트 전략

[test.md](../../convention/test.md)에 따라 `test/`가 `src/` 구조를 미러링한다.

```
test/components/_common/Input/Input.test.tsx
test/components/_common/Input/UploadInput.test.tsx
test/components/_common/Input/ImageInput.test.tsx
```

| 대상        | 검증                                                          |
| ----------- | ------------------------------------------------------------- |
| 기본 렌더   | placeholder, value/defaultValue, disabled/readOnly prop 전달  |
| variant     | `size`, `tone`, `status`, `variant="search"` 클래스 적용      |
| 슬롯        | leftSlot/rightSlot/action 렌더와 icon size                    |
| 에러        | `aria-invalid`, `aria-describedby`, error message 렌더        |
| 검색        | `type="search"`, 검색 아이콘, placeholder 렌더                |
| 파일 입력   | file input 접근성 연결, accept/multiple prop 전달             |
| 이미지 입력 | default/attached 상태 렌더, preview alt/삭제 버튼 접근성 이름 |
| className   | 호출부 className이 `cn`으로 병합되는지                        |

## 단계별 PR 계획

Input은 파일·이미지 입력까지 한 번에 구현하면 범위가 커진다. stacked PR로 나누는 것을 권장한다.

| 순서 | 브랜치                        | base                             | 내용                                |
| ---- | ----------------------------- | -------------------------------- | ----------------------------------- |
| 1    | `feat/common-input-component` | `dev` 또는 바로 아래 스택 브랜치 | **이 설계 문서** + docs 인덱스 갱신 |
| 2    | `feat/common-input-ui`        | `feat/common-input-component`    | `Input`, `InputField`, 기본 테스트  |
| 3    | `feat/common-file-input`      | `feat/common-input-ui`           | `UploadInput`, `ImageInput` 구현    |

팀에서 PR 수를 줄이기로 하면 2~3단계는 같은 브랜치에서 구현하되 커밋을 분리한다.

## 확인 필요

현재 확정되지 않은 항목은 없다. 새 확인 사항이 생기면 이 섹션에 추가한다.

## 참고

- 공통 UI 배치·`cva`·`cn` 규칙: [convention/ui-component.md](../../convention/ui-component.md)
- 스타일·반응형 규칙: [convention/style.md](../../convention/style.md)
- 접근성 규칙: [convention/accessibility.md](../../convention/accessibility.md)
- 렌더링 경계 금지 목록: [architecture/rendering.md](../../architecture/rendering.md)
- 전체 문서 인덱스: [docs/README.md](../../README.md)
