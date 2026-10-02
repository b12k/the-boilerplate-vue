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
  definition: StoreDefinition;
}

const sessions = new WeakMap<object, StoreSession>();

function hot<Definition extends StoreDefinition>(
  definition: Definition,
  moduleHot: HotModule | undefined,
) {
  if (!moduleHot) return definition;

  moduleHot.accept();
  const previous = moduleHot.data ? sessions.get(moduleHot.data) : undefined;
  if (previous && previous.definition.$id !== definition.$id) {
    moduleHot.invalidate();
    return definition;
  }

  // Each store module owns one session across replacements.
  const session: StoreSession = previous ?? { data: {}, definition };
  const context = {
    data: session.data,
    invalidate: () => moduleHot.invalidate(),
  };
  if (previous) {
    acceptHMRUpdate(session.definition, context)({ useStore: definition });
  }
  session.definition = definition;
  moduleHot.dispose((data) => sessions.set(data, session));

  // Existing imports also use the latest definition when a store is first created later.
  return new Proxy(definition, {
    apply(_target, _receiver, parameters: Parameters<StoreDefinition>) {
      return session.definition(...parameters);
    },
  });
}

// Reload when the helper changes because its session registry is recreated.
import.meta.webpackHot?.decline();

export { hot };
