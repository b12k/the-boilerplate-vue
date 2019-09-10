import { basename, join } from 'path';
import { readdirSync } from 'fs';

readdirSync(__dirname).forEach((file) => {
  /* If its the current file ignore it */
  if (file === 'index.js') return;
  /* Store module with its name (from filename) */
  module.exports[basename(file, '.js')] = require(join(__dirname, file));
});
