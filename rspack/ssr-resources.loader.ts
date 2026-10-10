import type { LoaderContext } from '@rspack/core';

import path from 'node:path';

/* oxlint-disable oxc/no-this-in-exported-function -- Rspack binds LoaderContext when calling pitch loaders. */

// Rspack calls the named pitch export before normal loaders; its return value replaces the module source.
export function pitch(this: LoaderContext<Record<string, never>>) {
  const moduleId = path
    .relative(this.rootContext, this.resourcePath)
    .replaceAll('\\', '/');
  const componentRequest = JSON.stringify(`!!${this.remainingRequest}`);
  // Compile the original SFC unchanged: scoped CSS hashes must match the browser build.
  return `
    import component from ${componentRequest};
    export * from ${componentRequest};
    import { useSSRContext } from 'vue';
    const originalSetup = component.setup;
    component.setup = function setupWithSsrResource(props, setupContext) {
      useSSRContext().modules.add(${JSON.stringify(moduleId)});
      return originalSetup?.(props, setupContext);
    };
    export default component;
  `;
}
