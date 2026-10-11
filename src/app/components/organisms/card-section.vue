<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  import { InfoCard, SectionHeading } from '../molecules';

  const {
    cards,
    columns = 'three',
    eyebrow,
    headingVariant = 'plain',
    title,
  } = defineProps<{
    cards: Array<{ description: string; name: string; number?: string }>;
    columns?: 'four' | 'three';
    eyebrow: string;
    headingVariant?: 'mono' | 'plain';
    title: string;
  }>();
  const section = tv({
    slots: { base: 'mt-10 border-t border-line pt-9', grid: 'grid gap-4' },
    variants: {
      columns: {
        four: { grid: 'sm:grid-cols-2 lg:grid-cols-4' },
        three: { grid: 'md:grid-cols-3' },
      },
    },
  });
</script>

<template>
  <section :class="section({ columns }).base()">
    <SectionHeading
      :eyebrow="eyebrow"
      :title="title"
    >
      <slot />
    </SectionHeading>
    <div :class="section({ columns }).grid()">
      <InfoCard
        v-for="card in cards"
        :key="card.name"
        :title="card.name"
        :description="card.description"
        :number="card.number ?? ''"
        :heading-variant="headingVariant"
      />
    </div>
  </section>
</template>
