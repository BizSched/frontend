# PR / 작업 플로우

## 기능 개발 (Feat Workflow)
1. 이슈 생성 (진행도 템플릿 사용 — [.github/ISSUE_TEMPLATE/progress.md](../../.github/ISSUE_TEMPLATE/progress.md))
2. `dev` 브랜치에서 최신 상태로 pull
3. `feat/` 브랜치 생성
4. 작업 + 커밋 (`feat:` — [commit.md](../convention/commit.md) 참고)
5. Husky를 활용한 로컬 체크
6. origin으로 push
7. `dev`로 PR 생성
8. CI 통과 확인 (lint, test, build)
9. 코드 리뷰 요청 → 승인 (1인 이상)
10. `dev` 브랜치로 Squash Merge
11. `feat` 브랜치 삭제

## 긴급 수정 (Hotfix Workflow)
1. 운영 장애 발견 → 버그 리포트 이슈 등록 ([.github/ISSUE_TEMPLATE/bug-report.md](../../.github/ISSUE_TEMPLATE/bug-report.md))
2. `main`에서 `hotfix/` 분기
3. 최소 범위로 수정 + 커밋
4. PR 생성 → CI 통과 → 빠른 리뷰(1인 승인)
5. `main` 병합 → 즉시 배포 + 패치 버전 태그 (예: v1.4.1)
6. `dev`에도 반드시 병합 (동기화)
7. `hotfix` 브랜치 삭제

코드 리뷰 체크리스트는 [code-review.md](../collaboration/code-review.md) 참고.
