import type { Context } from '@server';
import type { InjectionKey } from 'vue';

import { defineStore } from 'pinia';
import { inject } from 'vue';

const initialContextKey: InjectionKey<Context> = Symbol('initialContext');

const useContextStore = defineStore('context', {
  state: () => {
    const context = inject(initialContextKey);
    if (context) return context;
    throw new Error(
      'Initial context must be provided before creating the store',
    );
  },
});

export { initialContextKey, useContextStore };
