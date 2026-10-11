<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  import { UiEyebrow } from '../atoms';

  defineProps<{ eyebrow: string; title: string }>();
  const styles = tv({
    slots: {
      base: 'mb-7 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end md:gap-6',
      title: 'mt-3',
    },
  })();
</script>

<template>
  <div :class="styles.base()">
    <div>
      <UiEyebrow>{{ eyebrow }}</UiEyebrow>
      <h2 :class="styles.title()">{{ title }}</h2>
    </div>
    <slot />
  </div>
</template>
