import { omit } from 'lodash';

import createApp from './createApp';

export default (context) => new Promise((resolve, reject) => {
  context.isSSR = true;

  const {
    app,
    router,
    store,
    initialize,
  } = createApp(omit(context, '_registeredComponents'));

  router.push(context.url).catch(reject);
  router.onReady((route) => {
    initialize(route)
      .then(() => {
        context.state = store.state;
        resolve(app);
      })
      .catch(reject);
  }, reject);
});
