import { defineConfig } from 'oxfmt';

export default defineConfig({
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'ignore',
  ignorePatterns: ['dist', 'node_modules', '.pocketbase'],
  jsxSingleQuote: false,
  printWidth: 80,
  semi: true,
  singleAttributePerLine: true,
  singleQuote: true,
  // Perfectionist owns import ordering.
  sortImports: false,
  sortPackageJson: {
    sortScripts: true,
  },
  sortTailwindcss: {
    stylesheet: './src/client/styles/main.css',
  },
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
  vueIndentScriptAndStyle: true,
});
