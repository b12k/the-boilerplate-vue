import { defineStore } from 'pinia';
import { inject } from 'vue';

import { hot, initialContextKey } from './utils';

const useContextStore = hot(
  defineStore('context', {
    state: () => {
      const context = inject(initialContextKey);
      if (context) return context;
      throw new Error(
        'Initial context must be provided before creating the store',
      );
    },
  }),
  import.meta.webpackHot,
);

export { useContextStore };
