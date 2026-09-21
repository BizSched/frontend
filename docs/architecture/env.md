# 환경변수 관리

## 파일 구성

`.env` 파일은 아래 3가지로만 구성한다.

- `.env.local`
- `.env.prod`
- `.env.template` (`.gitignore`에서 제외 — 실제 값 없이 키 목록만 관리)

## client / server 구분

이 절이 `NEXT_PUBLIC_` 규칙의 단일 출처다. [data-flow.md](./data-flow.md), [rendering.md](./rendering.md), [code-review.md](../collaboration/code-review.md)는 이 문서를 참조만 한다.

- **client에서 참조하는 값**: `NEXT_PUBLIC_` + 이름 형식으로 선언한다. 이 접두사가 없는 환경변수는 Client Component에서 참조할 수 없다.
- **server에서만 쓰는 값**: 접두사 없이 그대로 선언한다. Client Component에 props로 넘기거나 클라이언트 번들에 포함되게 두지 않는다.
- `NEXT_PUBLIC_`이 붙은 값은 클라이언트 JS에 그대로 번들되므로 **secret·token·자격증명을 넣지 않는다.**

API baseURL에 이 규칙을 적용하는 방식은 [data-flow.md](./data-flow.md)의 "baseURL" 참고.
