<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  const {
    description,
    headingVariant = 'plain',
    number = '',
    title,
  } = defineProps<{
    description: string;
    headingVariant?: 'mono' | 'plain';
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
    variants: {
      headingVariant: { mono: { title: 'font-mono text-2xl' }, plain: {} },
    },
  });
</script>

<template>
  <article :class="card({ headingVariant }).base()">
    <span
      v-if="number"
      :class="card({ headingVariant }).number()"
    >
      {{ number }}
    </span>
    <h3 :class="card({ headingVariant }).title()">{{ title }}</h3>
    <p :class="card({ headingVariant }).description()">{{ description }}</p>
  </article>
</template>
