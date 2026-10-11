<script setup lang="ts">
  import { action } from '../ui.styles';

  const { appearance = 'primary', disabled = false } = defineProps<{
    appearance?: 'primary' | 'secondary';
    disabled?: boolean;
  }>();
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="
      action({
        appearance,
        class: 'cursor-pointer disabled:cursor-wait disabled:opacity-55',
      })
    "
  >
    <slot />
  </button>
</template>
