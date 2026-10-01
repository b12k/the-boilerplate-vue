import type { RouteRecordRaw } from 'vue-router';

type RouteRecordRawNamed = RouteRecordRaw & { name: string };

const routes: Array<RouteRecordRawNamed> = [
  {
    component: () => import('~/pages/page-home.vue'),
    name: 'home',
    path: '/',
  },
  {
    component: () => import('~/pages/page-about.vue'),
    name: 'about',
    path: '/about',
  },
  {
    component: () => import('~/pages/page-404.vue'),
    meta: {
      responseCode: 404,
    },
    name: 'notFound',
    path: '/404',
  },
  {
    name: 'CatchNotFound',
    path: '/:url(.*)*',
    redirect: ({ params: { url } }) => ({
      path: '/404',
      query: {
        uri: encodeURIComponent(url?.toString() ?? ''),
      },
    }),
  },
];

export { routes };
