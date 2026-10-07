<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  const {
    description,
    heading = 'plain',
    number = '',
    title,
  } = defineProps<{
    description: string;
    heading?: 'mono' | 'plain';
    number?: string;
    title: string;
  }>();
  const card = tv({
    slots: {
      base: 'rounded-lg border border-line p-6',
      description: 'text-sm',
      number: 'mb-5 inline-block font-mono text-[0.65rem] text-muted md:mb-7',
      title: 'mb-3',
    },
    variants: { heading: { mono: { title: 'font-mono text-2xl' }, plain: {} } },
  });
</script>

<template>
  <article :class="card({ heading }).base()">
    <span
      v-if="number"
      :class="card({ heading }).number()"
    >
      {{ number }}
    </span>
    <h3 :class="card({ heading }).title()">{{ title }}</h3>
    <p :class="card({ heading }).description()">{{ description }}</p>
  </article>
</template>
