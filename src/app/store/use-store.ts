import type { Pinia } from 'pinia';

import * as stores from './stores';
import { bindPiniaToStores } from './utils';

function createUseStore(pinia?: Pinia) {
  return bindPiniaToStores(stores, pinia);
}

const useStore = createUseStore();

export { createUseStore, useStore };
