import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': fromRoot('./app'),
      '@assets': fromRoot('./src/assets'),
      '@components': fromRoot('./src/components'),
      '@hooks': fromRoot('./src/hooks'),
      '@providers': fromRoot('./src/providers'),
      '@lib': fromRoot('./src/lib'),
      '@stores': fromRoot('./src/stores'),
      '@test': fromRoot('./test'),
    },
  },
  test: {
    environment: 'jsdom',
  },
});
