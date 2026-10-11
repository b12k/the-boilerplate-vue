<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  import { UiBadge, UiEyebrow } from '../atoms';

  const features = [
    'SSR render cache',
    'Critical CSS cache',
    'Language-aware URLs',
    'Unhead metadata',
    'Lazy route chunks',
    'Typed service injection',
  ];
  const styles = tv({
    slots: {
      base: 'mt-12 grid items-center gap-7 rounded-lg border border-line bg-panel p-6 md:grid-cols-[1.4fr_1fr] md:gap-10 md:p-9',
      description: 'text-sm',
      features: 'flex flex-wrap gap-2.5',
      title: 'my-3',
    },
  })();
</script>

<template>
  <section :class="styles.base()">
    <div>
      <UiEyebrow>BEYOND THE COMPONENT</UiEyebrow>
      <h2 :class="styles.title()">The server is part of the design.</h2>
      <p :class="styles.description()">
        Render caching, critical CSS, request context and production builds are
        part of this foundation. Their configuration stays explicit.
      </p>
    </div>
    <div :class="styles.features()">
      <UiBadge
        v-for="feature in features"
        :key="feature"
        tone="neutral"
      >
        {{ feature }}
      </UiBadge>
    </div>
  </section>
</template>
