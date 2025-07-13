<script lang="ts" setup>
  import { BaseFooter, BaseHeader } from '../base';
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
    height: 100%;

    main {
      flex: 1;
    }
  }
</style>
