<script setup lang="ts">
  import type { RouteLocationRaw } from 'vue-router';

  import { action } from '../ui.styles';

  const { appearance = 'secondary', to } = defineProps<{
    appearance?: 'primary' | 'secondary' | 'text';
    to: RouteLocationRaw;
  }>();
</script>

<template>
  <RouterLink
    :to="to"
    :class="action({ appearance })"
  >
    <slot />
  </RouterLink>
</template>
