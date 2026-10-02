import type { Configuration } from '@rspack/core';

import browserConfig from './config.browser';
import serverConfig from './config.server';

export default [browserConfig, serverConfig] satisfies Array<Configuration>;
