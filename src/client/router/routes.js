const PageHome = () => import(/* webpackChunkName: "PageHome" */ '@pages/PageHome');
const PageAbout = () => import(/* webpackChunkName: "PageAbout" */ '@pages/PageAbout');
const PageNotFound = () => import(/* webpackChunkName: "PageNotFound" */ '@pages/PageNotFound');

export default [
  {
    name: 'Home',
    path: '/',
    component: PageHome,
  },
  {
    name: 'About',
    path: 'about',
    component: PageAbout,
  },
  {
    name: 'NotFound',
    path: '404',
    component: PageNotFound,
  },
];
