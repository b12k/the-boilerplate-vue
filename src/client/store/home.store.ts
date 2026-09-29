import { defineStore } from 'pinia';

export const useHomeStore = defineStore('home', {
  actions: {
    incrementCounter(this) {
      this.counter += 1;
    },
  },
  getters: {
    doubledCounter(this) {
      return this.counter * 2;
    },
  },
  state: () => {
    return {
      counter: 6,
    };
  },
});

if (module.hot) module.hot.dispose(() => globalThis.location.reload());
