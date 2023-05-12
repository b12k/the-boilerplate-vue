<script lang="ts" setup>
  import { BaseHeader, BaseFooter } from '../base';
</script>

<template>
  <BaseHeader />
  <slot />
  <BaseFooter />
</template>

<style lang="scss">
  #app {
    display: flex;
    flex-direction: column;
    height: 100%;

    main {
      flex: 1;
    }
  }
</style>
