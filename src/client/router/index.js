import Vue from 'vue';
import VueRouter from 'vue-router';

import RootRouterView from './RootRouterView';
import routes from './routes';

Vue.use(VueRouter);

export const createRouter = () => new VueRouter({
  mode: 'history',
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  routes: [
    {
      path: '/:lang',
      component: RootRouterView,
      children: routes,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { x: 0, y: 0 };
  },
});
