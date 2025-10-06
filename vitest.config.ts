import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**/*', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'packages/**',
        'scripts/**',
        '**/*.config.ts',
        '**/*.d.ts',
        'src/globals.d.ts'
      ]
    },
    setupFiles: ['./tests/setup.ts']
  }
});
