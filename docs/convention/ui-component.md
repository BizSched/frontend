# 공통 UI 규칙

- Button·Input·Dialog 등 기본 UI는 Shadcn/ui 기반, `src/components/ui/`에서 관리
  (Composition pattern으로 선언적 구성)
- 여러 화면에서 쓰는 서비스 컴포넌트는 `src/components/`, 특정 화면 전용은 해당 화면 근처에 배치
- 공통 컴포넌트에 특정 페이지의 API·비즈니스 로직을 넣지 않는다 (→ `hooks/`로 분리)
- 반복되는 디자인 차이는 `class-variance-authority(cva)`로 `variant`·`size`를 정의한다
- className 병합은 `clsx` + `tailwind-merge` 조합(`cn` 유틸)을 사용한다

위 두 줄이 `cva`·`cn` 규칙의 단일 출처다. `tech-stack.md`, `AGENTS.md`, [code-review.md](../collaboration/code-review.md)는 이 문서를 참조만 한다.

hooks 구조: `hooks/api/`, `hooks/handler/` 등. 상태 도구 기준은 [state-management.md](../architecture/state-management.md) 참고.
