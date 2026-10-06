# 테스트 규칙

- 별도 test 폴더를 두고 `src/` 구조를 미러링한다.
- 파일명은 테스트 대상 파일명에 `.test.ts(x)`를 붙인다. 대소문자도 대상 파일과 같게 쓴다 (예: `Chart.tsx` → `Chart.test.tsx`, `useChartSize.ts` → `useChartSize.test.tsx`).
- Vitest를 사용한다.

CI 통과 기준은 [ci.md](../collaboration/ci.md) 참고.
