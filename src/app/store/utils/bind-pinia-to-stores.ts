import type { Pinia, StoreDefinition } from 'pinia';

export function bindPiniaToStores<
  Definitions extends Record<string, StoreDefinition>,
>(definitions: Definitions, pinia?: Pinia) {
  function getStore<Name extends keyof Definitions>(
    name: Name,
  ): ReturnType<Definitions[Name]>;
  function getStore(name: keyof Definitions) {
    const storeDefinition = definitions[name];
    if (
      !Object.hasOwn(definitions, name) ||
      typeof storeDefinition !== 'function'
    ) {
      throw new Error(`Store definition not found for ${String(name)}`);
    }
    return storeDefinition(pinia);
  }

  return getStore;
}
