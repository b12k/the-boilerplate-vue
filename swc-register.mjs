import { createRequire } from 'node:module';

const { register } = createRequire(import.meta.url)(
  '@swc-node/register/register',
);

register(undefined, { exts: ['.ts'] });
