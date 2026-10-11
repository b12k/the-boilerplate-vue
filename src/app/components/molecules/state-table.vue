<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  defineProps<{ rows: Array<{ label: string; value: number | string }> }>();
  const styles = tv({
    slots: {
      base: 'mb-5',
      label: 'text-muted',
      row: 'flex justify-between gap-4 border-b border-line py-3 text-sm',
      value: 'font-mono text-xs wrap-anywhere text-right',
    },
  })();
</script>

<template>
  <dl :class="styles.base()">
    <div
      v-for="row in rows"
      :key="row.label"
      :class="styles.row()"
    >
      <dt :class="styles.label()">{{ row.label }}</dt>
      <dd :class="styles.value()">{{ row.value }}</dd>
    </div>
  </dl>
</template>
