<script setup lang="ts">
  import type { DemoArchitecture } from '@app/services';

  import { tv } from 'tailwind-variants';

  import { UiEyebrow, UiLink } from '../atoms';

  defineProps<{ layers: DemoArchitecture['layers'] }>();
  const styles = tv({
    slots: {
      base: 'grid gap-10 border-t border-line pt-10 md:grid-cols-[1fr_1.3fr] lg:gap-20',
      code: 'font-mono text-xs wrap-anywhere text-accent',
      description: 'my-5 text-sm',
      layer: 'mb-6 flex gap-5 border-b border-line pb-6',
      layerDescription: 'my-2 text-sm',
      number: 'pt-1 font-mono text-xs text-muted',
      title: 'my-4',
    },
  })();
</script>

<template>
  <section :class="styles.base()">
    <div>
      <UiEyebrow>FROM ROUTE TO PAGE</UiEyebrow>
      <h2 :class="styles.title()">
        Five steps.
        <br />
        One data flow.
      </h2>
      <p :class="styles.description()">
        Axios loaded this content from the server mock API over HTTP. The route
        loader wrote it into a scoped Pinia store before SSR rendered the page.
      </p>
      <UiLink
        to="/lab"
        appearance="text"
      >
        Run the flow yourself
        <span aria-hidden="true">↗</span>
      </UiLink>
    </div>
    <ol>
      <li
        v-for="(layer, index) in layers"
        :key="layer.name"
        :class="styles.layer()"
      >
        <span :class="styles.number()">0{{ index + 1 }}</span>
        <div>
          <h3>{{ layer.name }}</h3>
          <p :class="styles.layerDescription()">{{ layer.description }}</p>
          <code :class="styles.code()">{{ layer.file }}</code>
        </div>
      </li>
    </ol>
  </section>
</template>
