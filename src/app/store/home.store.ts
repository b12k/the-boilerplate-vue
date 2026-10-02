import { defineStore } from 'pinia';

const DOUBLE_FACTOR = 2;

const useHomeStore = defineStore('home', {
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
});

import.meta.webpackHot?.dispose(() => location.reload());

export { useHomeStore };
