<script lang="ts">
  import { defineComponent } from 'vue';
  import { LayoutHollyGrail } from '../components';

  export default defineComponent({
    name: 'ErrorPage',
    components: {
      LayoutHollyGrail,
    },
    async fetchData() {
      throw new Error('Ooopsie. An Error!');
    },
  });
</script>
<template>
  <LayoutHollyGrail>
    <main class="page-three container">
      <h1>Error Page</h1>
    </main>
  </LayoutHollyGrail>
</template>
