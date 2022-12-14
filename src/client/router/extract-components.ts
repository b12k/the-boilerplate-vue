import {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  RouteRecordNormalized,
} from 'vue-router';

import { DefineComponent } from 'vue';

type ImportFunction = () => Promise<{
  default: DefineComponent;
}>;

const resolveComponentsRecursive = async (
  entries: RouteRecordNormalized['components'],
) => {
  if (!entries) return [];

  const { loaded, imports } = Object.values(entries).reduce<{
    loaded: Array<DefineComponent>;
    imports: Array<ImportFunction>;
  }>(
    (acc, next) => {
      if (typeof next === 'function') {
        acc.imports.push(next as ImportFunction);
      } else {
        acc.loaded.push(next as DefineComponent);
      }
      return acc;
    },
    {
      loaded: [],
      imports: [],
    },
  );
  const importPromises = imports.map((index) => index());
  const importResults = await Promise.all(importPromises);
  const imported = importResults.map((index) => index.default);
  const components: Array<DefineComponent> = [...loaded, ...imported];

  const nestedImportsResult = await Promise.all(
    components.map(({ components: nestedComponents }) =>
      resolveComponentsRecursive(nestedComponents),
    ),
  );

  const nestedComponents: Array<DefineComponent> = nestedImportsResult.flat();

  return [...components, ...nestedComponents];
};

export const extractComponents = async (
  to: RouteLocationNormalized,
  from?: RouteLocationNormalizedLoaded,
) => {
  const toPromises = to.matched.map((route) =>
    resolveComponentsRecursive(route.components),
  );
  const fromPromises = from
    ? from.matched.map((route) => resolveComponentsRecursive(route.components))
    : [];

  const [componentsTo, componentsFrom] = await Promise.all([
    ...toPromises,
    ...fromPromises,
  ]);

  const staying: Array<DefineComponent> = [];
  const entering: Array<DefineComponent> = componentsTo.filter((component) => {
    const isStaying = (componentsFrom || []).includes(component);
    if (isStaying) staying.push(component);
    return !isStaying;
  });
  const leaving = (componentsFrom || []).filter(
    (component) => !staying.includes(component),
  );

  return {
    entering,
    leaving,
    staying,
  };
};
