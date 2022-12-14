import { defineStore } from 'pinia';

import { Context } from '@server';

export const useContextStore = defineStore<string, Context>('context', {
  state() {
    return {} as Context;
  },
});
