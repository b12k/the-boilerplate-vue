import { configs } from 'eslint-plugin-perfectionist';
import { defineConfig } from 'oxlint';

const MAX_FUNCTION_LINES = 150;
const MAX_STATEMENTS = 50;
const MAX_PARAMETERS = 4;

export default defineConfig({
  categories: {
    correctness: 'error',
    nursery: 'error',
    pedantic: 'error',
    perf: 'error',
    restriction: 'error',
    style: 'error',
    suspicious: 'error',
  },
  env: {
    builtin: true,
  },
  ignorePatterns: ['dist', 'node_modules', '.pocketbase'],
  jsPlugins: ['eslint-plugin-perfectionist'],
  options: {
    denyWarnings: true,
    reportUnusedDisableDirectives: 'error',
    typeAware: true,
  },
  overrides: [
    {
      env: {
        browser: true,
      },
      files: ['src/client/**'],
    },
    {
      env: {
        node: true,
      },
      files: ['src/server/**', 'rspack/**', '*.mjs', '*.ts'],
    },
    {
      env: {
        browser: true,
        node: true,
        vue: true,
      },
      files: ['**/*.vue'],
    },
    {
      files: ['src/server/**', 'rspack/**', '*.mjs', '*.ts'],
      rules: {
        // Server and build tooling can import Node.js built-in modules.
        'import/no-nodejs-modules': 'off',
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        // Ambient declarations may intentionally have no top-level import or export.
        'import/unambiguous': 'off',
      },
    },
    {
      files: ['**/*.config.*', 'rspack/config.{browser,server,single}.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
  plugins: ['typescript', 'oxc', 'import', 'vue', 'node', 'promise', 'unicorn'],
  rules: {
    ...configs['recommended-natural'].rules,
    curly: ['error', 'multi-line'],
    'func-style': ['error', 'declaration'],
    // Require names of at least two characters, with these conventional exceptions.
    'id-length': [
      'error',
      {
        exceptions: ['_', 'z', 'T'],
      },
    ],
    'import/no-named-export': 'off',
    'import/no-namespace': 'off',
    'import/no-unassigned-import': [
      'error',
      {
        allow: ['**/*.css'],
      },
    ],
    'import/prefer-default-export': 'off',
    'max-lines-per-function': [
      'error',
      {
        max: MAX_FUNCTION_LINES,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-params': ['error', MAX_PARAMETERS],
    'max-statements': ['error', MAX_STATEMENTS],
    'no-duplicate-imports': [
      'error',
      {
        allowSeparateTypeImports: true,
      },
    ],
    'no-magic-numbers': [
      'error',
      {
        ignore: [-1, 0, 1, 200, 302, 404, 500],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
      },
    ],
    // Prefer the native Unicorn equivalents when rules overlap.
    'no-negated-condition': 'off',
    'no-nested-ternary': 'off',
    // These bans conflict with Unicorn's preferred syntax.
    'no-ternary': 'off',
    'no-undefined': 'off',
    'no-underscore-dangle': [
      'error',
      {
        allow: ['__dirname'],
      },
    ],
    'no-use-before-define': ['error', { functions: false }],
    'node/no-top-level-await': 'off',
    'one-var': ['error', 'never'],
    'oxc/no-async-await': 'off',
    'oxc/no-barrel-file': 'off',
    'oxc/no-optional-chaining': 'off',
    'oxc/no-rest-spread-properties': 'off',
    // Perfectionist owns ordering.
    'sort-imports': 'off',
    'sort-keys': 'off',
    'sort-vars': 'off',
    'typescript/array-type': [
      'error',
      {
        default: 'generic',
      },
    ],
    'typescript/explicit-function-return-type': 'off',
    'typescript/explicit-module-boundary-types': 'off',
    'typescript/no-confusing-void-expression': [
      'error',
      { ignoreArrowShorthand: true },
    ],
    // Reject guards that types prove redundant, including type predicates.
    'typescript/no-unnecessary-condition': [
      'error',
      { checkTypePredicates: true },
    ],
    // Prefer constructor parameter properties over separate fields and assignments.
    'typescript/parameter-properties': [
      'error',
      {
        prefer: 'parameter-property',
      },
    ],
    'typescript/prefer-readonly-parameter-types': 'off',
    // Returning a promise does not require async; require-await checks async bodies.
    'typescript/promise-function-async': 'off',
    'typescript/strict-boolean-expressions': [
      'error',
      { allowNullableString: true },
    ],
    'typescript/strict-void-return': 'off',
  },
});
