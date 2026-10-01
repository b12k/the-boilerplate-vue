import { defineConfig } from 'lint-staged/config';

const STYLES = '*.{css,scss}';
const SCRIPTS = '*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}';
const VUE = '*.vue';
const OTHER = '!(*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,vue,css,scss})';

const oxlint = 'pnpm exec oxlint --fix';
const oxfmt = 'pnpm ~oxfmt --write';
const stylelint = 'pnpm ~stylelint --fix';

export default defineConfig({
  [OTHER]: oxfmt,
  [SCRIPTS]: [oxlint, oxfmt],
  [STYLES]: [stylelint, oxfmt],
  [VUE]: [oxlint, stylelint, oxfmt],
});
