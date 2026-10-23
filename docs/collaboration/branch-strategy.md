# 브랜치 전략

release 브랜치 없는 Git Flow를 사용한다: `main`, `dev`, `{접두사}/작업-성격`.

- `main`·`dev` 직접 푸시는 금지하며, PR과 최소 1명 승인을 거쳐 병합한다.
- 브랜치명은 무엇을 작업하는지 알 수 있도록 구체적으로 짓는다. 띄어쓰기는 `-`로 대체한다.

## 접두사

| 접두사                                                                                       | 용도                                                                                 | 분기 기준 |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------- |
| 커밋 타입 8종: `feat/`, `fix/`, `design/`, `refactor/`, `docs/`, `test/`, `chore/`, `ci/cd/` | 일반 작업. 브랜치의 주된 작업 타입을 쓴다([commit.md](../convention/commit.md) 참고) | `dev`     |
| `hotfix/`                                                                                    | `main`(운영) 버그 수정                                                               | `main`    |

- 예: `feat/user-login`, `fix/login-error-message`, `docs/collaboration-convention`, `hotfix/payment-error`
- 버그 수정 접두사는 버그가 있는 브랜치로 정한다. `main` 버그는 `hotfix/`, `dev` 버그는 `fix/`를 쓴다.

작업 플로우는 [pr-flow.md](./pr-flow.md) 참고.
