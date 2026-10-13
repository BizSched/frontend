import { config } from 'dotenv';
import { defineConfig } from 'orval';

config({ path: ['.env.local', '.env'], quiet: true });

if (!process.env.BE_BASE_URL) {
  throw new Error('BE_BASE_URL is not defined. Check .env.local');
}

const SPEC_URL = `${process.env.BE_BASE_URL}/v3/api-docs`;

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
        fetch: {
          includeHttpResponseReturnType: false,
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
