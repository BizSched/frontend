# 도메인 기능 문서

도메인 단위 기능 문서와, 그 도메인에 속한 **페이지(`app/**/page.tsx`) 설계 문서**를 모아두는 곳이다.

## 작성 규칙

- 도메인 문서는 `feature/{도메인}/README.md`, 페이지 문서는 `feature/{도메인}/{페이지}.md`에 작성한다.
  - 경로는 `app/` 라우트 구조를 따른다. 예: `app/partTime/schedule/` → `feature/partTime/schedule.md`
- API 명세처럼 도메인 전체에 걸친 내용은 도메인 `README.md`에 한 번만 적고, 페이지 문서에서는 링크한다.
- 페이지 문서에는 **코드·Figma만 봐서는 알 수 없는 판단 근거**만 남긴다. 컴포넌트 트리 상세, breakpoint별 배치, `convention/`에 이미 있는 규칙은 다시 적지 않는다.
- 문서가 추가·삭제되면 [docs/README.md](../README.md)의 인덱스를 함께 갱신한다.
- 문서에 없거나 **"확인 필요"** 로 표시된 항목은 임의로 확정하지 않는다.

## 도메인 문서 템플릿

```md
# {domain} 기능 문서 — 템플릿

## 개요

<!-- 이 기능이 무엇을 하는지 한두 문장 -->

## 주요 화면 / 플로우

<!-- 화면 목록(페이지 문서 링크), 사용자 흐름 -->

## API 명세

<!-- 사용하는 엔드포인트, 요청/응답 구조 -->

## 상태 관리 포인트

<!-- 이 기능에서 쓰는 상태(서버 상태/공유 상태/폼 상태 등)와 이유 -->

## 주요 컴포넌트

<!-- 핵심 컴포넌트와 책임 -->

## 참고

- 공통 규칙은 [docs/README.md](../README.md) 참고
```

## 페이지 문서 템플릿

```md
# {페이지명} 페이지 설계

## 개요

<!-- 목적 2~3줄, Figma 링크, 라우트 -->

## 화면 구성

<!-- 섹션별 컴포넌트와 책임, 한 줄씩 -->

## 상태·데이터

<!-- 상태 맵 표(상태 / 범위 / 도구 / 근거) + API 연동 계획 -->

## 렌더링 경계

<!-- Server/Client Component 경계, architecture/rendering.md 금지 목록 체크 -->

## 설계 결정

<!-- 토큰 신설 등 "왜"가 필요한 것만 -->

## 단계별 PR 계획

<!-- 목업 UI → API 연동 등 -->

## 확인 필요
```

## 문서 목록

| 경로                                               | 내용                                    | 상태                  |
| -------------------------------------------------- | --------------------------------------- | --------------------- |
| [partTime/schedule.md](./partTime/schedule.md)     | 아르바이트생 스케쥴 관리 페이지 설계    | 목업 UI 진행 중       |
| [sales/README.md](./sales/README.md)               | 매출 도메인 개요                        | 설계 완료, UI 별도 PR |
| [sales/dashboard.md](./sales/dashboard.md)         | `/sales/dashboard` 매출 대시보드 페이지 | 정적 UI 별도 PR 예정  |
| [partTime/staff.md](./partTime/staff.md)           | 아르바이트생 관리 페이지 설계           | 설계 중               |
| [sales/details.md](./sales/details.md)             | `/sales/details` 매출 내역 페이지       | 검토 대기             |
| [partTime/staff-form.md](./partTime/staff-form.md) | 아르바이트생 추가·수정 페이지 설계      | 설계 중               |
