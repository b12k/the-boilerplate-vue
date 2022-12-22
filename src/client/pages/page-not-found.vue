<script lang="ts">
  import { defineComponent } from 'vue';
  import { LayoutHollyGrail } from '../components';

  export default defineComponent({
    name: 'PageNotFound',
    components: { LayoutHollyGrail },
  });
</script>

<template>
  <LayoutHollyGrail>
    <main class="page-404">Not found</main>
  </LayoutHollyGrail>
</template>
