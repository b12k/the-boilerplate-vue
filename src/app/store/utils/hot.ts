import type { Pinia, StoreDefinition } from 'pinia';

import { acceptHMRUpdate } from 'pinia';

interface HotModule {
  accept: () => void;
  readonly data: object | undefined;
  dispose: (callback: (data: object) => void) => void;
  invalidate: () => void;
}

interface StoreSession {
  data: { pinia?: Pinia };
  storeDefinition: StoreDefinition;
}

const storeSessionsByHotData = new WeakMap<object, StoreSession>();

// Reload when the helper changes because its session registry is recreated.
import.meta.webpackHot?.decline();

export function hot<Definition extends StoreDefinition>(
  storeDefinition: Definition,
  moduleHot: HotModule | undefined,
) {
  if (!moduleHot) return storeDefinition;

  moduleHot.accept();
  const previousStoreSession = moduleHot.data
    ? storeSessionsByHotData.get(moduleHot.data)
    : undefined;
  if (
    previousStoreSession &&
    previousStoreSession.storeDefinition.$id !== storeDefinition.$id
  ) {
    moduleHot.invalidate();
    return storeDefinition;
  }

  // Each store module owns one session across replacements.
  const storeSession: StoreSession = previousStoreSession ?? {
    data: {},
    storeDefinition,
  };
  const hmrContext = {
    data: storeSession.data,
    invalidate: () => moduleHot.invalidate(),
  };
  if (previousStoreSession) {
    acceptHMRUpdate(
      storeSession.storeDefinition,
      hmrContext,
    )({ useStore: storeDefinition });
  }
  storeSession.storeDefinition = storeDefinition;
  moduleHot.dispose((hotData) =>
    storeSessionsByHotData.set(hotData, storeSession),
  );

  // Existing imports also use the latest definition when a store is first created later.
  return new Proxy(storeDefinition, {
    apply(_target, _receiver, storeArguments: Parameters<StoreDefinition>) {
      return storeSession.storeDefinition(...storeArguments);
    },
  });
}
