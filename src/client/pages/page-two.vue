<script lang="ts">
  import { defineComponent } from 'vue';
  import { LayoutHollyGrail } from '../components';

  export default defineComponent({
    components: {
      LayoutHollyGrail,
    },
  });
</script>
<template>
  <LayoutHollyGrail>
    <main class="page-two container">
      <h1>Page Two</h1>
    </main>
  </LayoutHollyGrail>
</template>
