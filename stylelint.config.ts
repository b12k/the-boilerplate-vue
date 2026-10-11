import type { Config } from 'stylelint';

export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-html'],
  overrides: [
    {
      files: ['src/app/styles/main.css'],
      rules: {
        'scss/at-rule-no-unknown': [true, { ignoreAtRules: ['theme'] }],
      },
    },
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
