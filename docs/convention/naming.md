# 네이밍 규칙

- 파일: `name/Name.tsx` (예: `ModalHeader.tsx`)
- 함수: Component는 `function` 선언식, 그 외(hook·util·내부 핸들러)는 화살표 함수
- 상수: `CONST_VALUE`
- 이벤트 props: `on대상동작` (예: onClick, onValueChange)
- 내부 핸들러: `handle대상동작` (예: handleClick)
- boolean: `is`·`has` 접두사, 부정형 이름 피하기

타입 선언·export 방식은 [code-style.md](./code-style.md) 참고.

## import 순서 / 절대경로 alias

alias는 [folder-structure.md](../architecture/folder-structure.md)의 폴더 구조를 1:1로 따른다. 폴더가 늘거나 이름이 바뀌면 그 문서를 먼저 고치고 alias를 맞춘다.

- 프로젝트 최상위: `@app`(라우트 진입점 `app/`), `@test`(테스트 `test/`)
- `src` 바로 하위: `@components`, `@hooks`, `@lib`, `@providers`, `@stores`, `@assets`

`app/`은 `src/` 안이 아니라 `src/`와 나란히 최상위에 둔다. 각 폴더가 무엇을 담는지는 [folder-structure.md](../architecture/folder-structure.md)를, 타입 선언 위치는 [folder-structure.md의 "타입 정의 파일 위치"](../architecture/folder-structure.md#타입-정의-파일-위치)를 참고한다. 타입 전용 alias는 두지 않는다.
