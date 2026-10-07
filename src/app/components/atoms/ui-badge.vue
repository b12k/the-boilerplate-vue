<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  const { tone = 'accent' } = defineProps<{ tone?: 'accent' | 'neutral' }>();
  const badge = tv({
    base: 'inline-block rounded px-2 py-1 font-mono text-[0.6rem] tracking-wide',
    defaultVariants: { tone: 'accent' },
    variants: {
      tone: {
        accent: 'bg-accent/6 text-accent',
        neutral: 'border border-line text-muted',
      },
    },
  });
</script>

<template>
  <span :class="badge({ tone })"><slot /></span>
</template>
