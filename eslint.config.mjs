import jsPlugin from '@eslint/js';
import { flatConfigs as importPluginFlatConfigs } from 'eslint-plugin-import-x';
import { configs as perfectionistConfigs } from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import unicornPlugin from 'eslint-plugin-unicorn';
import vuePlugin from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { configs as tsEslintConfigs } from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['dist', '.temp', 'node_modules', '.pocketbase'],
  },
  jsPlugin.configs.recommended,
  ...tsEslintConfigs.recommended,
  ...vuePlugin.configs['flat/strongly-recommended'],
  unicornPlugin.configs.all,
  importPluginFlatConfigs.recommended,
  importPluginFlatConfigs.typescript,
  perfectionistConfigs['recommended-natural'],
  prettierPlugin,
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  },
  {
    files: ['*.{js,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['!**/src/**/*'],
        },
      ],
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            Dir: true,
            dir: true,
            Env: true,
            env: true,
            props: true,
            Props: true,
            utils: true,
            Utils: true,
          },
        },
      ],
    },
  },
);
