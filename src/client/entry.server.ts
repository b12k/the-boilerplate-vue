import { createMemoryHistory } from 'vue-router';
import { renderToString } from 'vue/server-renderer';

import { Context } from '@server';

import { createApp } from './create-app';
import { execRoutePreFetch } from './router';

const render = async (context: Context) => {
  const history = createMemoryHistory(context.baseUrl);
  const { app, store, router } = await createApp(history, { context });

  await execRoutePreFetch(router.currentRoute.value, undefined, true);

  return {
    html: await renderToString(app),
    state: store.state.value,
    currentRoute: router.currentRoute.value,
  };
};

export type Render = (context: Context) => ReturnType<typeof render>;
export type RenderResult = Awaited<ReturnType<typeof render>>;
export default render;
