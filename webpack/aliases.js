const { resolvePath } = require('./helpers');

module.exports = {
  '@assets': resolvePath('src/client/assets'),
  '@components': resolvePath('src/client/components'),
  '@helpers': resolvePath('src/client/helpers'),
  '@pages': resolvePath('src/client/pages'),
  '@services': resolvePath('src/client/services'),
  '@store': resolvePath('src/client/store'),
  '@styles': resolvePath('src/client/styles'),
};
