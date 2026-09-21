# 코드 스타일

타입 선언·export 방식의 단일 출처다. 다른 문서에서는 이 문서를 참조한다.

- 객체 타입은 `interface`로 작성한다. (Component/hook/util 공통)
- 각 파일은 네임드 export를 사용한다. (`export { Components }`)
- import는 `index.ts`를 거치지 않고 각 파일에서 직접 named import 한다.
  - `index.ts`로 모아 re-export하는 배럴 파일은 사용하지 않는다.
  - alias 기준은 [naming.md](./naming.md) 참고.

```ts
// ✅ 각 파일에서 직접 import
import { ModalHeader } from "@components/modal/ModalHeader";

// ❌ index.ts 배럴 경유
import { ModalHeader } from "@components/modal";
```

## enum 대체 방식

TS `enum` 대신 `as const` assertion을 사용한다.

```ts
const STATUS = { PENDING: "pending", DONE: "done" } as const;

type Status = (typeof STATUS)[keyof typeof STATUS]; // "pending" | "done"
```
