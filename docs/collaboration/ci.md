# 린트 / CI / 배포

- ESLint·Prettier·Husky로 로컬 체크를 수행한다.
- GitHub Actions에서 `lint`, `test`, `build`를 통과해야 병합한다.
- 배포는 Vercel을 사용한다.
- CI/빌드/배포 결과는 Discord로 알림을 보낸다.

## Vercel 배포 매핑

- `main` → Production
- `dev` → Develop(Preview)
- PR 별 Preview 서버 자동 생성

## Discord 알림 조건

- PR 생성
- CI 실패
- PR 머지 완료
- (Vercel) 빌드 실패

PR 관련 Discord 알림은 GitHub Webhook 설정에서 처리하므로 GitHub Actions에서는 CI 실패 알림만 설정한다.

브랜치 전략은 [branch-strategy.md](./branch-strategy.md) 참고.
