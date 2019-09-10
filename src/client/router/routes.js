const PageHome = import(/* webpackChunkName: "PageHome" */ '@pages/PageHome');
const PageAbout = import(/* webpackChunkName: "PageAbout" */'@pages/PageAbout');
const PageNotFound = import(/* webpackChunkName: "PageNotFound" */'@pages/PageNotFound');

export default [
  {
    name: 'home',
    path: '/',
    component: PageHome,
  },
  {
    name: 'about',
    path: 'about',
    component: PageAbout,
  },
  {
    name: 'notFound',
    path: '*',
    component: PageNotFound,
  },
];
