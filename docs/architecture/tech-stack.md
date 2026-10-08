# 기술 스택

| 구분                         | 이름                                           | 버전           |
| ---------------------------- | ---------------------------------------------- | -------------- |
| 언어                         | TypeScript                                     |                |
| 프레임워크                   | Next.js                                        | v16            |
| 스타일링                     | TailwindCSS, Shadcn/ui                         | TailwindCSS v4 |
| 상태관리                     | Zustand, TanStack Query                        |                |
| 데이터 페칭                  | fetch API (axios 미사용)                       |                |
| 조건 분기 처리               | ts-pattern                                     |                |
| 폼                           | React Hook Form                                |                |
| 스키마 검증                  | zod                                            | v4             |
| API 타입·클라이언트·zod 생성 | orval                                          |                |
| CSS 유틸                     | tailwind-merge, clsx, class-variance-authority |                |
| 테스트                       | Vitest                                         |                |
| 포맷팅/린트                  | ESLint, Prettier, Husky                        |                |
| CI/CD                        | GitHub Actions                                 |                |
| 배포                         | Vercel                                         |                |
| 알림                         | Discord                                        |                |

- Shadcn/ui는 Base UI 기반이므로 `@base-ui/react`가 함께 설치된다. `components.json`의 `style`은 `base-nova`.
- `cva`·`cn` 사용 규칙은 [ui-component.md](../convention/ui-component.md) 참고.
- zod는 API 응답 검증과 폼 검증에 쓴다. 폼에는 `@hookform/resolvers`의 `zodResolver`로 React Hook Form에 연결한다. API 응답 검증용 zod 스키마는 BE OpenAPI 명세로부터 `orval`로 생성한다. DTO 타입 생성·응답 검증 규칙은 [data-flow.md](./data-flow.md) 참고.
- `orval`은 TanStack Query 훅은 생성하지 않는다 (`client: 'fetch'`). 캐시 무효화 전략·서버-클라이언트 `queryOptions` 공유를 팀이 직접 설계하기 위한 선택이다. 이유는 [data-flow.md](./data-flow.md)의 "API 타입·클라이언트·zod 생성" 참고.
- 데이터 페칭·에러 처리 구성은 [data-flow.md](./data-flow.md), Server/Client 렌더링 경계는 [rendering.md](./rendering.md) 참고.
- 배포·알림 조건은 [ci.md](../collaboration/ci.md) 참고.
