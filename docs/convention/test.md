# 테스트 규칙

## Unit / Integration (Vitest)

- 별도 `test/` 폴더를 두고 `src/` 구조를 미러링한다.
- 파일명은 테스트 대상 파일명에 `.test.ts(x)`를 붙인다. 대소문자도 대상 파일과 같게 쓴다 (예: `Chart.tsx` → `Chart.test.tsx`, `useChartSize.ts` → `useChartSize.test.tsx`).
- 실행: `pnpm test`

## E2E (Playwright)

- 테스트 파일은 루트의 `e2e/` 폴더에 둔다.
- 파일명은 `[기능].spec.ts` 형식으로 작성한다 (예: `login.spec.ts`).
- 실행: `pnpm test:e2e` — 실행 전 `pnpm exec playwright install chromium firefox webkit`으로 브라우저 바이너리를 설치해야 한다.
- `.env.template`을 참고해 `.env.local`에 테스트 전용 계정의 `E2E_EMAIL`, `E2E_PASSWORD`를 설정한다. Playwright가 `.env.local`을 읽고, 로그인 상태를 `e2e/auth.json`에 저장한다. 이 파일은 Git에서 제외한다.
- `webServer` 옵션이 Next.js dev 서버를 자동으로 띄운다. 이미 `pnpm dev`가 실행 중이라면 재사용한다.

CI 통과 기준은 [ci.md](../collaboration/ci.md) 참고.
