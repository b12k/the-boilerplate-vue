<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  import { UiEyebrow, UiLink } from '../atoms';
  import { StateTable } from '../molecules';

  defineProps<{ rows: Array<{ label: string; value: number | string }> }>();
  const styles = tv({
    slots: {
      base: 'rounded-xl border border-line bg-panel p-6 md:p-7',
      description: 'mb-5 text-sm',
      title: 'mt-4 mb-6',
    },
  })();
</script>

<template>
  <aside :class="styles.base()">
    <UiEyebrow>LIVE APPLICATION STATE</UiEyebrow>
    <h2 :class="styles.title()">
      Same store.
      <br />
      Different view.
    </h2>
    <StateTable :rows="rows" />
    <p :class="styles.description()">
      Change the counter on Overview, then return here. Its value persists
      without a page reload.
    </p>
    <UiLink
      to="/"
      appearance="text"
    >
      Back to Overview
      <span aria-hidden="true">↗</span>
    </UiLink>
  </aside>
</template>
