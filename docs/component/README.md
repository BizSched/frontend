# 공통 컴포넌트 설계 문서

`src/components/_common/`에 들어가는 **공통 컴포넌트의 설계 문서**를 모아두는 곳이다.

## 작성 규칙

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

| 경로                                                                 | 컴포넌트                                                 | 상태                  |
| -------------------------------------------------------------------- | -------------------------------------------------------- | --------------------- |
| [card/README.md](./card/README.md)                                   | Card — 공통 surface primitive, compound 슬롯, variant 축 | 구현 완료             |
| [modal/README.md](./modal/README.md)                                 | Modal — compound 모달, Confirm 프리셋, overlay-kit 연동  | 설계 완료 · 구현 예정 |
| [pagination/README.md](./pagination/README.md)                       | Pagination — 평면 props, size 반응형 판정, 슬롯 계산 훅  | 설계 완료 · 구현 예정 |
| [dropdown/README.md](./dropdown/README.md)                           | Dropdown — 팝업 리스트 평면 API, 월 변경·Form 드롭다운 트리거 설계 | 설계 완료 · 구현 예정 |
| [button/README.md](./button/README.md)         | Button — hierarchy × size variant, 버튼 계열 분리 계획                                    | 구현 완료 · 병합 대기   |
| [IconButton/README.md](./IconButton/README.md) | IconButton — 원형 shape만 공유하는 4개 독립 컴포넌트(Social/Notification/ReadMore/Delete) | 구현 완료 · 테스트 예정 |
| [TextButton/README.md](./TextButton/README.md) | TextButton — `size` variant, `state`는 hover pseudo-class, Button의 sibling 컴포넌트 | 설계 완료 · 구현 예정 |
| [select-button/README.md](./select-button/README.md) | SelectButton — Base UI Toggle 기반 선택 버튼, `data-pressed` 스타일링 | 설계 완료 · 구현 예정 |
| [month-dropdown-button/README.md](./month-dropdown-button/README.md) | MonthDropdownButton — 월 선택 드롭다운 트리거, size 축   | 구현 완료             |
| [month-select-dropdown/README.md](./month-select-dropdown/README.md) | MonthSelectDropdown — 월 선택 트리거 + 월 리스트 팝업 조합, controlled | 설계 완료 · 구현 예정 |
| [form-dropdown/README.md](./form-dropdown/README.md)                 | FormDropdown — Form 트리거(FormDropdownButton) + 옵션 팝업 조합, controlled | 설계 완료 · 구현 예정 |
| [datepicker/README.md](./datepicker/README.md) | DatePicker — 버퍼링 선택(취소/확인), react-day-picker 셀 커스터마이징 | 설계 완료 · 구현 예정 |
| [input/README.md](./input/README.md)                                 | Input — 입력 primitive, 검색·파일·이미지 입력 설계       | 설계 완료 · 구현 예정 |
| [radio/README.md](./radio/README.md) | Radio — RadioGroup(compound), Base UI Radio 기반 | 설계 완료 · 구현 예정 |
| [checkbox/README.md](./checkbox/README.md) | Checkbox — 단일 원자, variant(solid/subtle) 2종, Base UI Checkbox 기반 | 설계 완료 · 구현 예정 |
| [pagination/README.md](./pagination/README.md) | Pagination — 평면 props, size 반응형 판정, 슬롯 계산 훅, URL `?page=` 연동 | 설계 완료 · 구현 완료 |
| [chart/README.md](./chart/README.md)           | Chart — 누적 막대·도넛 compound, `config` 색 주입, 빈 상태·로딩 스켈레톤 슬롯 | 설계 완료 · 구현 예정 |
| [calendar/README.md](./calendar/README.md)                           | Calendar — 단일 날짜 선택, 월 이동, 일정 칩·모바일 점, Dropdown 조합 | 설계 완료 · 구현 예정 |
