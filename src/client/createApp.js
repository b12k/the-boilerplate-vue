import Vue from 'vue';
import VueObserveVisibility from 'vue-observe-visibility';
import VuexI18n from 'vuex-i18n/dist/vuex-i18n.umd';
import { sync } from 'vuex-router-sync';
import {
  toArray,
  flattenDeep,
  uniqWith,
  isEqual,
} from 'lodash';

import { initializeServices } from './services';
import { createStore } from './store';

import App from './App';
import { createRouter } from './router';

Vue.config.devtools = true;
Vue.use(VueObserveVisibility);

export default (context) => {
  const store = createStore(context);
  const router = createRouter(store);
  sync(store, router);

  const app = new Vue({
    router,
    store,
    render: (cb) => cb(App),
  });

  initializeServices(store, router);

  const flattenMatchedComponents = (matched) => {
    const components = matched.reduce((acc, next) => {
      acc.push(next);
      if (next.components) acc.push(flattenMatchedComponents(toArray(next.components)));
      return acc;
    }, []);
    return uniqWith(flattenDeep(components), isEqual);
  };

  const execRouteAsyncData = (to, from) => {
    const next = flattenMatchedComponents(router.getMatchedComponents(to));
    const prev = from ? flattenMatchedComponents(router.getMatchedComponents(from)) : [];
    const diff = next.filter((nextComp) => {
      if (!nextComp.fetchData) return false;
      if (nextComp.forceFetchData) return true;
      const prevComp = prev.find(({ name }) => name === nextComp.name);
      return !prevComp || prevComp !== nextComp;
    });
    const promises = diff.map(({ fetchData }) => fetchData(store, to));
    return Promise.all(promises);
  };

  const initialize = async (route, initialState) => {
    if (initialState) {
      store.replaceState(initialState);
    } else {
      const promises = [execRouteAsyncData(route)];
      if (App.fetchData) promises.push(App.fetchData(store));
      await Promise.all(promises);
    }

    Vue.use(VuexI18n.plugin, store, { preserveState: true });
    Vue.i18n.set(store.state.context.lang);
    Vue.i18n.fallback(store.state.context.env.DEFAULT_LANGUAGE);
  };

  return {
    app,
    store,
    router,
    execRouteAsyncData,
    initialize,
  };
};
