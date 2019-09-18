const path = require('path');
const { version } = require('../package.json');

const {
  env: {
    NODE_ENV,
    SERVER_ENV,
  },
} = process;

console.log({
  NODE_ENV,
  SERVER_ENV,
})

module.exports = {
  version,
  IS_PROD_MODE: NODE_ENV !== 'development',
  IS_PROD_SERVER: SERVER_ENV === 'production',
  resolvePath: (...args) => path.resolve(process.cwd(), ...args),
};
