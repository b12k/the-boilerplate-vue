import { RouteRecordRaw } from 'vue-router';

type RouteRecordRawNamed = RouteRecordRaw & { name: string };
export const routes: Array<RouteRecordRawNamed> = [
  {
    name: 'One',
    path: '/',
    component: () => import('../pages/page-one.vue'),
  },
  {
    name: 'Two',
    path: '/two',
    component: () => import('../pages/page-two.vue'),
  },
  {
    name: 'Three',
    path: '/three',
    component: () => import('../pages/page-three.vue'),
  },
  {
    name: 'NotFound',
    path: '/404',
    component: () => import('../pages/page-not-found.vue'),
    meta: {
      responseCode: 404,
    },
  },
  {
    name: 'Error',
    path: '/error',
    component: () => import('../pages/error-page.vue'),
  },
  {
    name: 'CatchNotFound',
    path: '/:notFoundPath(.*)*',
    redirect: (to) => ({
      path: '/404',
      query: {
        'not-found': encodeURIComponent(String(to.params.notFoundPath)),
      },
    }),
  },
];
