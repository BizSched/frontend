# 커밋 메시지 규칙

실제 커밋 작성은 `commit-message-generator` 스킬이 자동으로 처리한다.
스킬 위치: `.claude/skills/commit-message-generator/SKILL.md`

아래는 요약이다. 형식의 단일 출처는 스킬과 husky `commit-msg` 훅 정규식이다.

## 헤더

```
타입: 간결한 설명 #이슈번호
```

- 타입은 8종만 허용한다: `feat`, `fix`, `design`, `refactor`, `docs`, `test`, `chore`, `ci/cd`
- 설명은 영어 소문자로 50자 이내로 작성한다.
- `#이슈번호`는 선택이다.

## 바디

한글로 작성한다.

- `## 설명` (필수): 변경이 필요했던 이유와 해결한 내용
- `## 변경 내용` (선택): 추가·수정된 항목을 bullet으로 나열
