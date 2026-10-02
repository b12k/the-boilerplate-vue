import { defineStore } from 'pinia';

import { hot } from './utils';

const DOUBLE_FACTOR = 2;

const useHomeStore = hot(
  defineStore('home', {
    actions: {
      incrementCounter(this) {
        this.counter += 1;
      },
    },
    getters: {
      doubledCounter(this) {
        return this.counter * DOUBLE_FACTOR;
      },
    },
    state: () => ({
      counter: 6,
    }),
  }),
  import.meta.webpackHot,
);

export { useHomeStore };
