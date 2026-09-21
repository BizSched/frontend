# 브랜치 전략

release 브랜치 없는 Git Flow를 사용한다: `main`, `dev`, `feat/작업-성격`, `hotfix/작업-성격`.

- `main`·`dev` 직접 푸시는 금지하며, PR과 최소 1명 승인을 거쳐 병합한다.
- 브랜치명은 무엇을 작업하는지 알 수 있도록 구체적으로 짓는다. 띄어쓰기는 `-`로 대체한다.
  - 예: `feat/user-login`, `feat/alba-list-filter`, `hotfix/payment-error`

작업 플로우는 [pr-flow.md](./pr-flow.md) 참고.
