const PageHome = () => import(/* webpackChunkName: "PageHome" */ '@pages/PageHome');
const PageAbout = () => import(/* webpackChunkName: "PageAbout" */ '@pages/PageAbout');

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
];
