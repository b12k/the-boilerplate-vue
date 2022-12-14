// import 'bootstrap';
import { createWebHistory } from 'vue-router';

import './styles/main.scss';
import { createApp, InitialState } from './create-app';
import { execRoutePreFetch } from './router';

declare global {
  interface Window {
    INITIAL_STATE: string;
  }
}

(async () => {
  const initialState = JSON.parse(window.INITIAL_STATE) as InitialState;

  const history = createWebHistory(initialState.context.baseUrl);
  const { app, router } = await createApp(history, initialState);

  app.mount('#app');

  let alreadyNavigatingTo: string | undefined;
  router.beforeEach(async (to, from) => {
    if (alreadyNavigatingTo === to.fullPath) return false;
    alreadyNavigatingTo = to.fullPath;
    try {
      await execRoutePreFetch(to, from);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  });
})();
