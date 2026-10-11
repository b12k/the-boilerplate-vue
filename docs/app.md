# Build pages

The same page code runs during SSR and browser navigation. Start with the [demo pages](../src/app/pages).

## Follow the data

1. The server builds a request context from the URL and environment.
2. `createApp` creates the app, router, Pinia and services for that request.
3. The router runs the page's `fetchData` hook. The store calls the API service.
4. Vue renders HTML. The server includes Pinia state and the page's assets.
5. The browser hydrates that state. Later navigation runs page hooks in the browser.

SSR app instances do not share stores. Each API client belongs to its app instance. Request IDs and abort signals stay outside serialized state.

## Add a page

Create a Vue file in `src/app/pages`. Add a lazy import to [routes.ts](../src/app/router/routes.ts). Use a page hook to fetch data before rendering:

```vue
<script setup lang="ts">
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';

  defineOptions({
    fetchData: async (_, getStore) => {
      await getStore('showcase').fetchArchitecture();
    },
  });

  const { architecture } = storeToRefs(useStore('showcase'));
  useHead({ title: 'Architecture' });
</script>

<template>
  <p>{{ architecture.layers.length }} application layers</p>
</template>
```

Use `storeToRefs` for reactive state and getters. Call actions on the store itself.

Set `shouldReFetch: true` in `defineOptions` when a reused page must fetch again, such as a project page with a new ID. Set `meta.noPreFetchAwait: true` on a route to show it while its browser request runs. SSR still waits for the data. See [Data Lab](../src/app/pages/page-lab.vue).

## Keep UI reusable

[Components](../src/app/components) follow atomic design:

| Folder      | Purpose                          |
| ----------- | -------------------------------- |
| `atoms`     | Links, labels and basic controls |
| `molecules` | Small groups of atoms            |
| `organisms` | Complete page sections           |
| `templates` | Page structure                   |

Import named components from `@app/components`. Use Tailwind utilities for layout and `tailwind-variants` for shared variants. Put public files in `src/public`.

`CardSection` and `InfoCard` use `headingVariant` to choose plain or monospace titles. This setting changes appearance; it does not change the HTML heading level.

## Set page behavior

Use Unhead for titles and metadata. `app.vue` reads the document language from the context store. Language prefixes come from server configuration; the demo text is in English.

The SSR build records the components used by a page. The server selects their assets from the manifest. Other route chunks load when navigation needs them.

For a router redirect, set `meta.responseCode` on the source route when you need a code other than 302. SSR sends `Location` for 301, 302, 303, 307 and 308. The demo's catch-all route uses 404 and renders a navigable client page.

## Add a service

Register its factory in [service-creators.ts](../src/app/services/service-creators.ts). Pass the context, logger and optional SSR abort signal. Build the service configuration inside its factory. Stores access services through `this.$services`.

Next: [connect your API](api.md).
