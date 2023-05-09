<template>
  <button class="btn btn-primary">Button</button>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { getLogger } from '../../services';

  getLogger().info('Logged from button component');

  onMounted(() => {
    getLogger().warn('Logged from button component mounted');
  });
</script>
