import Vue from 'vue';

import '@styles/app.scss';
import createApp from './createApp';

(async () => {
  const { __INITIAL_STATE__ } = global;
  __INITIAL_STATE__.context.isSSR = false;

  Vue.config.devtools = __INITIAL_STATE__.context.env.SERVER_ENV !== 'production';

  const {
    app,
    // store,
    router,
    initialize,
    execRouteAsyncData,
  } = createApp(__INITIAL_STATE__.context);

  const handleRouteChanges = () => router.beforeResolve(async (from, to, next) => {
    await execRouteAsyncData(from, to);
    next();
  });

  router.onReady(async (route) => {
    await initialize(route, __INITIAL_STATE__);
    app.$mount('#app');
    handleRouteChanges();
  });
})();
