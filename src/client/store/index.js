import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import * as modules from './modules';

Vue.use(Vuex);

export const createStore = (context) => new Store({
  modules,
  strict: true,
  state: () => ({
    context,
  }),
});
