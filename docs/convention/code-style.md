# 코드 스타일

타입 선언·export 방식의 단일 출처다. 다른 문서에서는 이 문서를 참조한다.

- 객체 타입은 `interface`로 작성한다. (Component/hook/util 공통)
  - 예외: 멤버 추가 없이 라이브러리 Props를 그대로 넘길 때는 `type` 별칭을 쓴다 (예: `type RadioGroupProps = RadioGroupPrimitive.Props`). 빈 `interface ... extends X {}`는 ESLint `@typescript-eslint/no-empty-object-type`에 걸린다.
- 각 파일은 네임드 export를 사용한다. (`export { Components }`)
  - 예외: 프레임워크가 default export를 읽는 파일은 default export를 쓴다. ESLint `import/no-default-export`도 이 파일들에서는 꺼져 있다.
    - Next.js App Router: `page`, `layout`, `loading`, `error`, `not-found`
    - Route Handler(`route`)는 default export가 아니라 HTTP 메서드 이름의 named export(`GET`, `POST` 등)를 쓴다. Next가 default export를 읽지 않는다.
    - Storybook(CSF): `.storybook/main.ts`, `.storybook/preview.tsx`, `*.stories.tsx`
- import는 `index.ts`를 거치지 않고 각 파일에서 직접 named import 한다.
  - `index.ts`로 모아 re-export하는 배럴 파일은 사용하지 않는다.
  - alias 기준은 [naming.md](./naming.md) 참고.

```ts
// ✅ 각 파일에서 직접 import
import { ModalHeader } from '@components/_common/Modal/ModalHeader';

// ❌ index.ts 배럴 경유
import { ModalHeader } from '@components/_common/Modal';
```

## await하지 않는 Promise

결과를 쓰지 않는 Promise는 `void`로 명시한다. 의도적으로 기다리지 않는다는 것을 드러내기 위해서다. ESLint `no-floating-promises`는 lint 속도 때문에 꺼져 있으므로 이 규칙은 리뷰로 지킨다.

```ts
// ✅ 결과를 쓰지 않는다
void openConfirmModal({ title: '스케쥴을 삭제하시겠어요?' });

// ✅ 결과를 쓴다
const isConfirmed = await openConfirmModal({
  title: '업무를 삭제하시겠어요?',
});

// ❌ 의도가 드러나지 않는다
openConfirmModal({ title: '스케쥴을 삭제하시겠어요?' });
```

## enum 대체 방식

TS `enum` 대신 `as const` assertion을 사용한다.

```ts
const STATUS = { PENDING: 'pending', DONE: 'done' } as const;

type Status = (typeof STATUS)[keyof typeof STATUS]; // "pending" | "done"
```
