const { register } = require('@swc-node/register/register');
const path = require('node:path');

register(undefined, {
  matcher: (filename) => !filename.includes(`${path.sep}dist${path.sep}`),
});
