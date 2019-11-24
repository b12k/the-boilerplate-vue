import Vue from 'vue';
import VueRouter from 'vue-router';

import RootRouterView from './RootRouterView';
import routes from './routes';

Vue.use(VueRouter);

export const createRouter = (store) => new VueRouter({
  mode: 'history',
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  routes: [
    {
      path: `/:lang(${store.state.context.env.ACCEPTED_LANGUAGES})`,
      component: RootRouterView,
      children: routes,
    },
    {
      path: '*',
      redirect: (to) => ({
        name: 'NotFound',
        params: {
          lang: to.params.lang || store.state.context.lang,
        },
      }),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { x: 0, y: 0 };
  },
});
