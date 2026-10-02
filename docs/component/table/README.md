# Table 컴포넌트 설계

## 개요

여러 화면에서 데이터의 행과 열을 표시하기 위한 공통 Table이다. shadcn/ui Table의 시맨틱 HTML 구조와 기본 스타일을 프로젝트의 compound API로 분리해 `src/components/_common/Table/`에 구현했다. 매출 대시보드의 최근 매출 목록이 예정된 사용처이며, 해당 [화면 인스턴스](https://www.figma.com/design/0UAYWaDS9UNjigV73HWcPZ/BizSched?node-id=337-105748)는 표의 데이터와 화면별 스타일을 결정한다.

Table은 표의 구조와 기본 표현만 담당한다. 매출 금액 포맷, 행 수정, 정렬·필터·페이지 이동, 모바일 전용 목록은 각 도메인에서 조합한다.

## 설계 결정 요약

| 결정        | 선택                                                                       | 근거                                                   |
| ----------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| 공개 API    | `Table`에 `Header`·`Body`·`Footer`·`Row`·`Head`·`Cell`·`Caption` 슬롯 부착 | 표의 HTML 구조를 사용처에서 읽기 쉽게 조합             |
| 기반 요소   | 네이티브 `table`·`thead`·`tbody`·`tfoot`·`tr`·`th`·`td`·`caption`          | 표의 의미와 브라우저 접근성 유지                       |
| 가로 넘침   | `Table`이 `overflow-x-auto` 컨테이너를 제공                                | 열이 많은 화면에서 페이지 전체가 가로로 넘치지 않게 함 |
| 화면별 차이 | 각 슬롯의 `className`을 `cn`으로 병합                                      | 현재 공통 Table에 확정된 variant 축이 없음             |
| 동작        | 데이터와 이벤트 상태를 Table 내부에 두지 않음                              | 정렬·선택·수정 등의 책임은 사용처에 따라 다름          |

## 레이어 구조

| 파일                                                  | 책임                                                      |
| ----------------------------------------------------- | --------------------------------------------------------- |
| `Table.tsx`                                           | `TableRoot`에 compound 슬롯을 연결하고 공개 타입을 내보냄 |
| `TableRoot.tsx`                                       | 가로 스크롤 컨테이너와 `table` 렌더링                     |
| `TableHeader.tsx`, `TableBody.tsx`, `TableFooter.tsx` | 표 영역의 기본 테두리·배경 스타일                         |
| `TableRow.tsx`                                        | 행 테두리와 hover·선택 상태 스타일                        |
| `TableHead.tsx`, `TableCell.tsx`                      | 머리글·데이터 셀의 기본 정렬과 간격                       |
| `TableCaption.tsx`                                    | 표 설명의 기본 타이포그래피                               |

모든 슬롯은 해당 HTML 요소의 props와 `className`을 전달한다. `TableRoot`의 props는 바깥 컨테이너가 아닌 내부 `table`에 전달한다.

## API

```tsx
import { Table } from '@components/_common/Table/Table';

<Table>
  <Table.Caption>최근 입력한 매출</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head scope="col">날짜</Table.Head>
      <Table.Head scope="col" className="text-right">
        합계
      </Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>9월 11일</Table.Cell>
      <Table.Cell className="text-right">₩756,300</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>;
```

`Table.Footer`는 합계 행 등이 필요할 때, `Table.Caption`은 화면에 설명 문구가 필요할 때 선택적으로 사용한다. 화면에 보이는 caption이 필요 없으면 `aria-label` 또는 `aria-labelledby`로 표의 이름을 제공한다.

## variant

현재 구현에는 `cva` variant가 없다. 사용처는 열 너비, 숫자 정렬, 행 높이 등을 각 슬롯의 `className`으로 지정한다. 반복되는 스타일 조합이 확인되면 [공통 UI 규칙](../../convention/ui-component.md)에 따라 variant 도입 여부를 결정한다.

## 디자인 토큰 매핑

| 요소        | 현재 기본 스타일                                      | 화면별 처리                        |
| ----------- | ----------------------------------------------------- | ---------------------------------- |
| 표 전체     | `text-sm`, `caption-bottom`                           | 폭과 레이아웃을 사용처에서 조정    |
| 행          | `border-b`, `hover:bg-muted/50`, 선택 상태 `bg-muted` | 강조·비활성 표현은 도메인에서 조정 |
| 머리글·셀   | `text-foreground`, `whitespace-nowrap`, 기본 간격     | 정렬·색·열 너비를 사용처에서 조정  |
| 바닥글·설명 | `bg-muted/50`, `text-muted-foreground`                | 필요 시 슬롯 단위로 조정           |

새 색상 토큰은 추가하지 않는다. Figma의 매출 표와 공통 기본값이 다른 부분은 매출 화면에서 조정한다.

## 접근성

- 열 머리글은 `Table.Head`에 `scope="col"`을 지정한다. 행 머리글이 필요한 화면은 `scope="row"`인 `th`를 사용한다.
- 표의 목적을 `Caption`, `aria-label`, `aria-labelledby` 중 적절한 방법으로 제공한다.
- 정렬·수정처럼 동작하는 요소는 셀 안에 실제 버튼이나 링크를 배치한다. 텍스트만으로 동작을 암시하지 않는다.
- 가로 스크롤 시 열 정보가 사라지지 않도록 화면별 최소 너비와 모바일 표현을 검토한다.

## 렌더링 경계

Table 자체에는 상태·이벤트 핸들러·클라이언트 훅이 없어 Server Component에서 사용할 수 있다. 정렬·선택·수정 기능을 붙이는 화면은 필요한 말단 컴포넌트에만 클라이언트 경계를 둔다.

## 테스트 전략

- compound 슬롯이 `table`·`thead`·`tbody`·`tr`·`th`·`td`로 렌더링되는지 확인한다.
- `aria-label` 등 HTML props와 슬롯별 `className`이 실제 요소에 전달되는지 확인한다.
- 열이 많은 사용처에서 가로 스크롤과 모바일 대체 표현을 화면 테스트로 확인한다.

`test/components/_common/Table/Table.test.tsx`에서 시맨틱 구조, 표 이름, HTML 속성과 `className`, 가로 스크롤 컨테이너를 검증한다. 열이 많은 화면의 모바일 대체 표현은 해당 화면 테스트에서 검증한다.

## 단계별 PR 계획

1. `feat/common-table`에서 공통 Table 구현·문서·검증을 묶어 `dev` 대상 PR을 만든다.
2. 매출 대시보드 작업은 Table 브랜치 위에 쌓고, Table PR 병합 후 `dev`로 대상 브랜치를 변경한다.

## 확인 필요

- 독립된 Figma Table 원본 컴포넌트의 링크와 공통 variant 축은 확인되지 않았다. 확인 전까지 화면 인스턴스의 스타일을 공통 기본값으로 확정하지 않는다.
- 정렬·선택 기능이 여러 화면에서 반복될 때 Table의 공통 API로 올릴지 사용처별 조합으로 유지할지 결정한다.
