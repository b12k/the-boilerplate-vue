<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  const { dot = false } = defineProps<{ dot?: boolean }>();
  const styles = tv({
    slots: {
      base: 'inline-flex items-center gap-2 font-mono text-[0.65rem] leading-relaxed tracking-wider text-muted',
      dot: 'size-1.5 shrink-0 rounded-full bg-accent',
    },
  })();
</script>

<template>
  <span :class="styles.base()">
    <span
      v-if="dot"
      :class="styles.dot()"
      aria-hidden="true"
    />
    <slot />
  </span>
</template>
