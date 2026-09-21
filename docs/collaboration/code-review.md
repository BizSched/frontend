# 코드 리뷰 체크리스트

## 사람이 확인할 사항
- [ ] 이 변경이 이슈/요구사항을 실제로 해결하는가 (구현 의도와 결과가 일치하는가)
	- 실제로 잘 동작하는가?
- [ ] 엣지 케이스(빈 값, 에러 응답, 권한 없음 등)가 충분히 고려됐는가
	- 핵심 기능 테스트가 있는가?
- [ ] 컴포넌트 분리가 [folder-structure.md](../architecture/folder-structure.md)의 4가지 기준상 "적절한" 수준인가 (과도하게 쪼개지거나 덜 쪼개지지 않았는가)
- [ ] 사용자 경험(UX) 관점에서 자연스러운가 (로딩/에러 상태 처리, 인터랙션 흐름)
	- 로딩, 에러, 빈 상태가 필요한 만큼 처리되었는가?
	- 실제 사용자 흐름이 정상 동작하는가?
- [ ] 실질적인 성능 영향이 있는가 (단순 규칙 위반이 아니라 실제 병목이 되는지)
	- 성능에 큰 영향을 줄 코드가 없는가? (렌더링 경계 점검은 아래 AI 항목 참고)
- [ ] 인증/인가, 민감정보 노출 등 보안 이슈가 없는가
	- secret, token, env 값이 노출되지 않았는가?
- [ ] 컨벤션에서 벗어난 부분이 있다면, 그 예외가 타당한 이유가 있는가
- [ ] 이해하기 어려운 코드가 방치되지 않았는가?
- [ ] 이 변경이 다른 기능에 의도치 않은 영향을 주지 않는가
- [ ] PR 설명이 실제 변경 사항을 정확히 설명하는가
- [ ] 접근성 기본값이 지켜졌는가?

## AI에게 맡기는 항목 (패턴/규칙 기반 — PR 생성 전 자동 확인)
- [ ] 렌더링 경계 — [rendering.md](../architecture/rendering.md)의 "금지 목록" 7개 항목을 그대로 점검한다 (`"use client"` 트리거, 경계 위치, 직렬화, `queryOptions` 공유)
- [ ] env, token, secret이 클라이언트로 노출되지 않는가 — [env.md](../architecture/env.md)
- [ ] loading/error/not-found 상태가 필요한 구간에 있는가? (`error.tsx`·`not-found.tsx`의 배치 단위 기준은 **미확정**)
- [ ] 접근성: alt, label, semantic tag, keyboard interaction 확인
- [ ] 성능: 실제 렌더링·번들·네트워크 비용이 확인될 때만 보고한다 (`next/image`·`dynamic import`·메모이제이션의 **미사용 자체**는 지적 대상이 아니다)
- [ ] 타입: any 남용 없음, 공유 타입 위치 적절
- [ ] 테스트: 핵심 로직/회귀 가능성 있는 부분 커버
- [ ] 네이밍이 [naming.md](../convention/naming.md) 기준을 따르는가 (파일/함수/상수/이벤트/boolean)
- [ ] 레이어 책임이 섞이지 않았는가 (Component에 API 호출, Hook에 순수 계산 로직 등) — [data-flow.md](../architecture/data-flow.md)
- [ ] 상태가 범위에 맞는 도구로 관리됐는가 (useState/Zustand/TanStack Query/URL/RHF) — [state-management.md](../architecture/state-management.md)
- [ ] `interface`, `as const` 등 타입 컨벤션을 따르는가 — [code-style.md](../convention/code-style.md)
- [ ] API 에러를 `ts-pattern`으로 처리했는가
- [ ] variant/className이 [ui-component.md](../convention/ui-component.md)의 `cva`·`cn` 규칙을 따르는가
- [ ] 불필요한 주석, 주석 처리된 코드가 남아있지 않은가 — [comment.md](../convention/comment.md)
- [ ] 테스트 파일이 `src/` 구조를 미러링하고 네이밍 규칙을 따르는가 — [test.md](../convention/test.md)
- [ ] 커밋 메시지가 `commit-message-generator` 스킬 형식을 따르는가
- [ ] `any` 타입, 사용하지 않는 import/변수 등이 남아있지 않은가
- [ ] 명백히 중복된 로직이 다른 파일에 이미 존재하지 않는가

`.claude/skills/code-review/SKILL.md` 스킬이 추가되어 있다. 역할 분담은 다음과 같다.

| 대상 | 역할 |
| --- | --- |
| `architecture/`·`convention/` 문서 | 세부 규칙의 단일 출처 |
| 이 문서 | 리뷰 기준의 요약 |
| `code-review` 스킬 | 실행 절차, 일반 리뷰 기준, 프로젝트 문서 적용 방법 |
| 스킬의 `scripts/` | 후보 탐지 도구 (결과는 finding이 아니라 검토 후보) |

스킬은 결과를 P0~P3으로 보고하며, 문서에 **"미확정"·"결정 필요"·"확인 필요"·"도입 예정"** 으로 적힌 사항은 위반으로 판단하지 않고 "확인 필요" 질문으로 분리한다.

이 항목들은 ESLint/Prettier/CI로 상당 부분 자동화되어 있고, 나머지는 리뷰어가 AI에게 "이 PR 컨벤션 위반 있는지 확인해줘" 식으로 먼저 검토를 맡길 수 있다.
