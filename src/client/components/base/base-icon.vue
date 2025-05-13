<script lang="ts" setup>
  import * as icons from '../../assets/icons';

  type IconName = keyof typeof icons;

  const props = defineProps<{
    icon: IconName;
  }>();
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span class="icon" v-html="icons[props.icon]" />
</template>

<style lang="scss">
  .icon {
    svg {
      height: 1em;
      margin-top: -0.25em;
    }
  }
</style>
