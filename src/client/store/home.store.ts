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
  state: () => ({
    counter: 6,
  }),
});

if (module.hot) module.hot.dispose(() => window.location.reload());
