import type { Config } from 'stylelint';

export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-html'],
  overrides: [
    {
      extends: ['stylelint-config-html/vue'],
      files: ['**/*.vue'],
    },
    {
      customSyntax: 'postcss-html',
      files: ['**/*.njk'],
    },
  ],
} satisfies Config;
