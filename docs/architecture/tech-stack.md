# 기술 스택

| 구분           | 이름                                           | 버전           |
| -------------- | ---------------------------------------------- | -------------- |
| 언어           | TypeScript                                     |                |
| 프레임워크     | Next.js                                        | v16            |
| 스타일링       | TailwindCSS, Shadcn/ui                         | TailwindCSS v4 |
| 상태관리       | Zustand, TanStack Query                        |                |
| 데이터 페칭    | fetch API (axios 미사용)                       |                |
| 조건 분기 처리 | ts-pattern                                     |                |
| 폼             | React Hook Form                                |                |
| CSS 유틸       | tailwind-merge, clsx, class-variance-authority |                |
| 테스트         | Vitest                                         |                |
| 포맷팅/린트    | ESLint, Prettier, Husky                        |                |
| CI/CD          | GitHub Actions                                 |                |
| 배포           | Vercel                                         |                |
| 알림           | Discord                                        |                |

- Shadcn/ui는 Base UI 기반이므로 `@base-ui/react`가 함께 설치된다. `components.json`의 `style`은 `base-nova`.
- `cva`·`cn` 사용 규칙은 [ui-component.md](../convention/ui-component.md) 참고.
- 데이터 페칭·에러 처리 구성은 [data-flow.md](./data-flow.md), Server/Client 렌더링 경계는 [rendering.md](./rendering.md) 참고.
- 배포·알림 조건은 [ci.md](../collaboration/ci.md) 참고.
