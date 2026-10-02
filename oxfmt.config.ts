import type { OxfmtConfig } from 'oxfmt';

export default {
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
    stylesheet: './src/app/styles/main.css',
  },
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
  vueIndentScriptAndStyle: true,
} satisfies OxfmtConfig;
