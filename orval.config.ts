import { defineConfig } from 'orval';

const SPEC_URL = 'https://bizsched.store/v3/api-docs';

export default defineConfig({
  apiClient: {
    input: SPEC_URL,
    output: {
      target: './src/lib/api/generated',
      mode: 'tags-split',
      client: 'fetch',
      override: {
        mutator: {
          path: './src/lib/api/customFetcher.ts',
          name: 'customFetcher',
        },
      },
    },
  },
  apiZod: {
    input: SPEC_URL,
    output: {
      target: './src/lib/api/generated',
      mode: 'tags-split',
      client: 'zod',
      fileExtension: '.zod.ts',
    },
  },
});
