import { type Context } from '@server';
import { defineStore } from 'pinia';

export const useContextStore = defineStore('context', {
  state(): Context {
    return {} as Context;
  },
});
