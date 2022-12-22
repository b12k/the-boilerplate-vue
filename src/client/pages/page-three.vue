<script lang="ts">
  import { defineComponent } from 'vue';
  import { LayoutHollyGrail } from '../components';

  export default defineComponent({
    name: 'PageThree',
    components: {
      LayoutHollyGrail,
    },
  });
</script>
<template>
  <LayoutHollyGrail>
    <main class="page-three container">
      <h1>Page Three</h1>
    </main>
  </LayoutHollyGrail>
</template>
