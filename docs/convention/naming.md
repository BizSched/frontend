# 네이밍 규칙

- 파일: `name/Name.tsx` (예: `ModalHeader.tsx`)
- 함수: Component는 `function` 선언식, 그 외(hook·util·내부 핸들러)는 화살표 함수
- 상수: `CONST_VALUE`
- 이벤트 props: `on대상동작` (예: onClick, onValueChange)
- 내부 핸들러: `handle대상동작` (예: handleClick)
- boolean: `is`·`has` 접두사, 부정형 이름 피하기

타입 선언·export 방식은 [code-style.md](./code-style.md) 참고.

## import 순서 / 절대경로 alias
`src` 기준 바로 하위 폴더 단위로 alias를 사용한다.
- `@components`, `@hooks`, `@lib`, `@types`
- 테스트 폴더의 경우, `@test`를 활용하여 따로 설정한다.
