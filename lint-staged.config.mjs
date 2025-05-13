const STYLES = '*.s?css';
const SCRIPTS = '*.[mc]?[jt]sx?';
const VUE = '*.vue';
const PACKAGE_JSON = 'package.json';
// const NUNJUCKS = '*.njk';
const OTHER = `!(${[SCRIPTS, STYLES, PACKAGE_JSON, VUE].join('|')})`;

const tsc = () => 'pnpm _tsc';
const eslint = 'pnpm _eslint --fix';
const prettier = 'pnpm _prettier -w';
const stylelint = 'pnpm _stylelint --fix';
const sortPackageJson = 'pnpm _sort-package-json';

export default {
  [`${SCRIPTS}|${VUE}|SCRIPTS`]: eslint,
  [`${SCRIPTS}|${VUE}|TYPES`]: tsc,
  [`${VUE}|STYLES`]: stylelint,
  [OTHER]: prettier,
  [PACKAGE_JSON]: [sortPackageJson, prettier],
  [STYLES]: [stylelint, prettier],
};
