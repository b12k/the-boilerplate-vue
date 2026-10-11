<script lang="ts" setup>
  import { BaseFooter, BaseHeader } from '@app/components/base';
</script>

<template>
  <BaseHeader />
  <slot />
  <BaseFooter />
</template>

<style lang="css">
  #app {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;

    main {
      flex: 1;
    }
  }
</style>
