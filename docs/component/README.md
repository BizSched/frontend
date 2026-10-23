# 공통 컴포넌트 설계 문서

`src/components/_common/`에 들어가는 **공통 컴포넌트의 설계 문서**를 모아두는 곳이다.

## 작성 규칙

### 현재 타이포그래피 기준 (2026-10-23)

전체 페이지 적용의 기반으로 공통 컴포넌트에 [공통 폰트 스케일](../convention/style.md#폰트-스케일)을 적용했다.
페이지·앱 레이아웃의 명시적 역할 지정은 후속 PR에서 진행한다.
개별 문서의 기존 Figma 크기 매핑과 다를 때 글자 크기·줄높이·굵기는 이 기준을 따른다.
기존 size prop은 클릭 영역과 여백을 구분하며, 작은 버튼이나 입력이라고 글자를 축소하지 않는다.

| 대상                                                       | 현재 역할                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| Button, TextButton, Pagination, 선택/월 버튼, DropdownItem | label — 14/20·600                                              |
| Input, FormDropdownButton, DatePicker 트리거               | body — 16/24·400                                               |
| Card.Title / 주요 섹션 Card.Title                          | subtitle — 16/24·600 / sectionTitle — 20/28·700 (모바일 18/28) |
| Card.Description, 입력 도움말, 차트 범례·툴팁              | supporting — 14/20·400                                         |
| Modal.Title / Modal.Description                            | sectionTitle / body                                            |
| Table 기본 / Table.Head / Table.Caption                    | body / label / supporting                                      |
| Badge, 캘린더 요일·일정 칩, 차트 축                        | caption — 12/16·500                                            |
| 캘린더·DatePicker 날짜                                     | label                                                          |
| 사이드바 메뉴 / 하위 메뉴                                  | subtitle / label                                               |

선택·오늘·비활성 상태의 기존 굵기 차이는 유지한다(DatePicker 400/500, Pagination 비선택 500, 사이드바 선택 700).
Toast는 기존 확정 사항인 Sonner 기본 디자인을 유지한다. 랜딩 마케팅 제목과 브랜드 로고도 별도 display 스타일을 유지한다.

> **앞으로 추가되는 공통 컴포넌트 설계는 모두 `docs/component/{컴포넌트}/README.md`에 작성한다.**

- 경로는 `feature/{도메인}/README.md`와 같은 형태를 따른다. 폴더 하나에 컴포넌트 하나다.
- 컴포넌트 작업 전 해당 문서부터 확인한다. 문서가 없으면 **구현보다 설계 문서를 먼저 작성한다.**
- 문서가 추가·삭제되면 아래 목록과 [docs/README.md](../README.md)의 인덱스를 함께 갱신한다.
- 문서에 없거나 **"확인 필요"** 로 표시된 항목은 임의로 확정하지 않는다.

## `convention/`과의 차이

|                               | 성격                                      | 예                                       |
| ----------------------------- | ----------------------------------------- | ---------------------------------------- |
| [convention/](../convention/) | 모든 코드에 적용되는 **규칙의 단일 출처** | `cva`·`cn` 사용법, 네이밍, 반응형 방향   |
| `component/`                  | 개별 컴포넌트의 **설계 결정 기록**        | Modal의 슬롯 구성, variant 축, 토큰 매핑 |

규칙이 바뀌면 `convention/`을, 특정 컴포넌트의 구조가 바뀌면 `component/`를 고친다.

## 권장 구성

```md
# {컴포넌트} 컴포넌트 설계

## 개요 <!-- 무엇을 해결하는가, Figma 원본 링크 -->

## 설계 결정 요약 <!-- 결정 / 선택 / 근거 표 -->

## 레이어 구조 <!-- 파일 배치와 책임 -->

## API <!-- 사용 예시 -->

## variant <!-- cva 축 -->

## 디자인 토큰 매핑 <!-- 일치 / 신설 / 불일치 -->

## 접근성

## 렌더링 경계

## 테스트 전략

## 단계별 PR 계획

## 확인 필요
```

## 문서 목록

| 경로                                                                 | 컴포넌트                                                                                  | 상태                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| [card/README.md](./card/README.md)                                   | Card — 공통 surface primitive, compound 슬롯, variant 축                                  | 구현 완료               |
| [table/README.md](./table/README.md)                                 | Table — 시맨틱 compound 슬롯, 가로 스크롤, 화면별 스타일 조합                             | 구현 완료 · 테스트 예정 |
| [modal/README.md](./modal/README.md)                                 | Modal — compound 모달, Confirm 프리셋, overlay-kit 연동                                   | 구현 완료               |
| [dropdown/README.md](./dropdown/README.md)                           | Dropdown — 팝업 리스트 평면 API, 월 변경·Form 드롭다운 트리거 설계                        | 구현 완료               |
| [button/README.md](./button/README.md)                               | Button — hierarchy × size variant, 버튼 계열 분리 계획                                    | 구현 완료               |
| [IconButton/README.md](./IconButton/README.md)                       | IconButton — 원형 shape만 공유하는 4개 독립 컴포넌트(Social/Notification/ReadMore/Delete) | 구현 완료               |
| [TextButton/README.md](./TextButton/README.md)                       | TextButton — `size` variant, `state`는 hover pseudo-class, Button의 sibling 컴포넌트      | 구현 완료               |
| [select-button/README.md](./select-button/README.md)                 | SelectButton — Base UI Toggle 기반 선택 버튼, `data-pressed` 스타일링                     | 구현 완료               |
| [month-dropdown-button/README.md](./month-dropdown-button/README.md) | MonthDropdownButton — 월 선택 드롭다운 트리거, size 축                                    | 구현 완료               |
| [month-select-dropdown/README.md](./month-select-dropdown/README.md) | MonthSelectDropdown — 월 선택 트리거 + 월 리스트 팝업 조합, controlled                    | 구현 완료               |
| [form-dropdown/README.md](./form-dropdown/README.md)                 | FormDropdown — Form 트리거(FormDropdownButton) + 옵션 팝업 조합, controlled               | 구현 완료               |
| [datepicker/README.md](./datepicker/README.md)                       | DatePicker — 버퍼링 선택(취소/확인), react-day-picker 셀 커스터마이징, 모바일 바텀시트    | 구현 완료               |
| [input/README.md](./input/README.md)                                 | Input — 입력 primitive, 검색·파일·이미지 입력 설계                                        | 구현 완료               |
| [radio/README.md](./radio/README.md)                                 | Radio — RadioGroup(compound), Base UI Radio 기반                                          | 구현 완료               |
| [checkbox/README.md](./checkbox/README.md)                           | Checkbox — 단일 원자, variant(solid/subtle) 2종, Base UI Checkbox 기반                    | 구현 완료               |
| [pagination/README.md](./pagination/README.md)                       | Pagination — 평면 props, size 반응형 판정, 슬롯 계산 훅, URL `?page=` 연동                | 구현 완료               |
| [chart/README.md](./chart/README.md)                                 | Chart — 누적 막대·도넛 compound, `config` 색 주입, 빈 상태·로딩 스켈레톤 슬롯             | 구현 완료               |
| [calendar/README.md](./calendar/README.md)                           | Calendar — 단일 날짜 선택, 월 이동, 일정 칩·모바일 점, Dropdown 조합                      | 구현 완료               |
| [ActionButton/README.md](./ActionButton/README.md)                   | ActionButton — Base UI Menu 기반 speed dial, `actions` 배열 prop, lucide 아이콘           | 구현 완료 · 테스트 예정 |
| [toast/README.md](./toast/README.md)                                 | Toast — shadcn/Sonner 기반, `_common/Toast/Toaster.tsx` 한 파일, layout 1회 마운트        | 구현 완료               |
| [badge/README.md](./badge/README.md)                                 | Badge — 표시용 pill 라벨, `color` variant(gray/green/yellow/red/purple)                   | 구현 완료 · 테스트 예정 |
