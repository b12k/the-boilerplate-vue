<script lang="ts" setup>
  import * as Icons from '../../assets/icons';

  type IconName = keyof typeof Icons;

  const props = defineProps<{
    name: IconName;
  }>();
</script>
<template>
  <span class="icon" v-html="Icons[props.name]" />
</template>
<style lang="scss">
  // import()
  .icon {
    svg {
      height: 1em;
      margin-top: -0.25em;
    }
  }
</style>
