<template>
  <div id="app">
    <BaseHeader class="boom" />
    <RouterView />
  </div>
</template>
<script>
  import { BaseHeader } from '@components';

  export default {
    name: 'App',
    components: {
      BaseHeader,
    },
  };
</script>
