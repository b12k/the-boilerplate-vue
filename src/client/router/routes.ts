import { type RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    noPreFetchAwait?: boolean;
    responseCode?: number;
  }
}

type RouteRecordRawNamed = RouteRecordRaw & { name: string };

export const routes: Array<RouteRecordRawNamed> = [
  {
    component: () => import('../pages/page-home.vue'),
    name: 'home',
    path: '/',
  },
  {
    component: () => import('../pages/page-about.vue'),
    name: 'about',
    path: '/about',
  },
  {
    component: () => import('../pages/page-404.vue'),
    meta: {
      responseCode: 404,
    },
    name: 'notFound',
    path: '/404',
  },
  {
    name: 'CatchNotFound',
    path: '/:uri(.*)*',
    redirect: ({ params: { uri } }) => ({
      path: '/404',
      query: {
        uri: encodeURIComponent(uri.toString()),
      },
    }),
  },
];
