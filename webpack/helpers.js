const path = require('path');
const { version } = require('../package.json');

module.exports = {
  version,
  IS_PROD: process.env.NODE_ENV !== 'development',
  resolvePath: (...args) => path.resolve(process.cwd(), ...args),
};
