import Vue from 'vue';
import VueRouter from 'vue-router';

import RootRouterView from './RootRouterView';
import routes from './routes';

const PageNotFound = () => import(/* webpackChunkName: "PageNotFound" */ '@pages/PageNotFound');

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
      name: 'NotFound',
      path: '*',
      component: PageNotFound,
      beforeEnter: (to, from, next) => {
        if (!to.params.lang) {
          to.params.lang = store.state.context.lang; // eslint-disable-line
        }
        return next();
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { x: 0, y: 0 };
  },
});
