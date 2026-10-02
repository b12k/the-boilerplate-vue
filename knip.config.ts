import type { KnipConfiguration } from 'knip';

export default {
  commitlint: true,
  entry: ['src/server/server.ts'],
  ignoreDependencies: [
    // Nodemon loads this through its JSON exec command.
    '@swc-node/register',
    // Knip evaluates the Rspack configs in production; this loader is used in development.
    'vue-style-loader',
  ],
  rspack: {
    config: ['rspack/config.{browser,server,single}.ts'],
  },
  treatConfigHintsAsErrors: true,
} satisfies KnipConfiguration;
