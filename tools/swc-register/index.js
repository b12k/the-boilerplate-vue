// eslint-disable-next-line import-x/no-extraneous-dependencies -- resolved from the root package devDependencies
const { register } = require('@swc-node/register/register');

register(undefined, { exts: ['.ts'] });
