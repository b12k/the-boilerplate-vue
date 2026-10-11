<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  import { UiEyebrow } from '../atoms';

  defineProps<{ eyebrow: string }>();
  const styles = tv({
    slots: {
      base: 'max-w-190 pt-11 pb-9 md:pt-17 md:pb-14',
      description: 'mt-6 max-w-152 text-lg',
      title: 'mt-6',
    },
  })();
</script>

<template>
  <section :class="styles.base()">
    <UiEyebrow>{{ eyebrow }}</UiEyebrow>
    <h1 :class="styles.title()"><slot name="title" /></h1>
    <p :class="styles.description()"><slot /></p>
  </section>
</template>
