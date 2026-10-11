import { defineStore } from 'pinia';
import { inject } from 'vue';

import { hot, initialContextKey } from '../utils';

export const context = hot(
  defineStore('context', {
    state: () => {
      const injectedContext = inject(initialContextKey);
      if (injectedContext) return injectedContext;
      throw new Error(
        'Initial context must be provided before creating the store',
      );
    },
  }),
  import.meta.webpackHot,
);
