import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.config.{js,mjs,ts}',
    ],
  },
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    plugins: { import: importPlugin },
    rules: {
      // ─────────────────────────────
      // code-style.md
      // ─────────────────────────────

      // 객체 타입은 interface로 (type alias의 객체 형태 금지)
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

      // enum 금지 → as const 사용 강제
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'enum 대신 `as const` assertion을 사용하세요.',
        },
      ],

      // default export 금지 (index.ts를 통한 named export 강제)
      // Next.js App Router의 page.tsx, layout.tsx 등은 예외 처리 필요
      'import/no-default-export': 'error',

      // ─────────────────────────────
      // naming.md
      // ─────────────────────────────

      // Component는 function 선언식 (화살표 함수 컴포넌트 금지)
      'react/function-component-definition': [
        'warn',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],

      // import alias 강제 (상대경로 ../../.. 금지)
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message: 'axios 대신 fetch API를 사용하세요.',
            },
          ],
          patterns: [
            {
              group: ['../*'],
              message:
                '상위 디렉토리 상대경로 대신 절대경로 alias(@components, @hooks 등)를 사용하세요.',
            },
          ],
        },
      ],

      // import 순서 정렬
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            { pattern: '@apps/**', group: 'internal', position: 'before' },
            { pattern: '@components/**', group: 'internal', position: 'before' },
            { pattern: '@hooks/**', group: 'internal', position: 'before' },
            { pattern: '@providers/**', group: 'internal', position: 'before' },
            { pattern: '@stores/**', group: 'internal', position: 'before' },
            { pattern: '@lib/**', group: 'internal', position: 'before' },
            { pattern: '@types/**', group: 'internal', position: 'before' },
            { pattern: '@test/**', group: 'internal', position: 'before' },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // ─────────────────────────────
      // comment.md
      // ─────────────────────────────

      // 주석 처리된 코드 방지는 린트로 완전히 못 잡음 → 대략적으로 경고
      'no-warning-comments': [
        'warn',
        { terms: ['fixme', 'xxx'], location: 'start' },
        // NOTE, TODO는 허용 규칙이므로 제외
      ],

      // ─────────────────────────────
      // 일반
      // ─────────────────────────────

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports' },
      ],
      // NOTE: no-floating-promises는 타입 정보(parserOptions.projectService)가 필요
      // lint 속도 비용 때문에 제외. 비동기 코드가 늘어나면 함께 재검토한다.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  // Next.js App Router 파일은 default export 필수이므로 예외 처리
  {
    files: [
      '**/app/**/page.{ts,tsx}',
      '**/app/**/layout.{ts,tsx}',
      '**/app/**/loading.{ts,tsx}',
      '**/app/**/error.{ts,tsx}',
      '**/app/**/not-found.{ts,tsx}',
      '**/app/**/route.{ts,tsx}',
      'next.config.{js,ts,mjs}',
      'tailwind.config.{js,ts}',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // 테스트 파일: src 구조 미러링, *.test.tsx
  {
    files: ['test/**/*.test.{ts,tsx}'],
    plugins: {
      vitest: (await import('eslint-plugin-vitest')).default,
    },
    rules: {
      ...(await import('eslint-plugin-vitest')).default.configs.recommended
        .rules,
    },
  }
);