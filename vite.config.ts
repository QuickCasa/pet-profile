import { defineConfig } from 'vitest/config'

/**
 * Vite builds the page in app/ into site/ for GitHub Pages. The tests run in
 * Node by default, and a test that needs a DOM opts in with a
 * vitest-environment comment.
 */
const config = defineConfig({
  root: 'app',
  base: './',
  build: {
    outDir: '../site',
    emptyOutDir: true,
  },
  test: {
    root: '.',
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
})

export default config
