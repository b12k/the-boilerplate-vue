<script lang="ts">
  import { defineComponent } from 'vue';
  import { LayoutHollyGrail, BaseIcon } from '../components';

  export default defineComponent({
    components: {
      BaseIcon,
      LayoutHollyGrail,
    },
  });
</script>
<template>
  <LayoutHollyGrail>
    <main class="page-one container">
      <div class="row">
        <div class="col">
          <h1>Page One</h1>
          <p>
            Lorem ipsum dolor sit amet.
            <BaseIcon name="Poo" />
          </p>
        </div>
      </div>
      <div class="row">
        <div class="col-2">
          <img
            src="../assets/images/image-1-thmb.jpg"
            alt="image 1 thumb banana"
            class="w-100 ratio-4x3"
          />
        </div>
        <div class="col-4">
          <img
            src="../assets/images/image-1.jpg"
            alt="image 1"
            class="w-100 ratio-4x3"
          />
        </div>
      </div>
    </main>
  </LayoutHollyGrail>
</template>
