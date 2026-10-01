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

## Chromatic 시각 테스트 기준

- PR(`dev`/`main` 대상)마다 Chromatic으로 Storybook 스냅샷을 비교한다.
- 비교 기준은 **PR head 브랜치 커밋**이다. merge 결과가 아니라 "이 PR이 무엇을 바꿨는가"를 리뷰하는 것이 목적이기 때문이다.
  - `actions/checkout`의 기본값은 가상의 merge 커밋(`refs/pull/N/merge`)이다. 이 커밋은 push마다 새로 생성되어 서로 조상 관계가 없고, Chromatic이 git 조상 관계로 baseline을 찾지 못한다.
  - 따라서 `ref: ${{ github.event.pull_request.head.ref }}`로 PR 브랜치를 checkout한다.
- Trade-off: dev와 합쳐졌을 때의 시각 차이는 PR 단계에서 검증하지 않는다.
- 스냅샷 변경이 있으면 job이 실패(exit 1)한다. Chromatic 빌드 페이지에서 변경을 확인하고 Accept한 뒤 재실행한다.
  - 단, **Re-run jobs는 같은 커밋을 재사용**한다. Accept는 해당 CI 빌드에서 해야 재실행 시 baseline으로 인식된다.
- `--auto-accept-changes`는 사용하지 않는다. 의도하지 않은 UI 변경이 자동 승인될 수 있다.

브랜치 전략은 [branch-strategy.md](./branch-strategy.md) 참고.
