<script lang="ts" setup>
  import * as icons from '@app/assets/icons';

  type IconName = keyof typeof icons;

  const { icon } = defineProps<{
    icon: IconName;
  }>();
</script>

<template>
  <span
    class="icon"
    v-html="icons[icon]"
  />
</template>

<style lang="css">
  .icon {
    svg {
      height: 1em;
      margin-top: -0.25em;
    }
  }
</style>
