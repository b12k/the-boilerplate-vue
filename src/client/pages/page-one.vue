<script lang="ts">
  import { defineComponent } from 'vue';
  import { storeToRefs } from 'pinia';
  import { LayoutHollyGrail, BaseIcon, BaseButton } from '../components';
  import { useContextStore } from '../store';

  export default defineComponent({
    name: 'PageOne',
    components: {
      BaseButton,
      BaseIcon,
      LayoutHollyGrail,
    },
    data() {
      return {
        isMounted: false,
        context: storeToRefs(useContextStore()),
      };
    },
    mounted() {
      this.isMounted = true;
    },
  });
</script>
<template>
  <LayoutHollyGrail>
    <main class="page-one container">
      <div class="row">
        <div class="col">
          <h1>Page One 1</h1>
          <p>
            Lorem ipsum dolor sit amet.
            <BaseIcon icon="Poo" />
          </p>
        </div>
      </div>
      <div class="row">
        <div class="col-1">
          <div class="ratio ratio-1x1">
            <img
              src="../assets/images/image-1-thmb.jpg"
              alt="image 1 thumb banana"
              class="object-fit-cover"
              width="100"
              height="125"
            />
          </div>
        </div>
        <div class="col-6">
          <div class="ratio ratio-4x3">
            <img
              src="../assets/images/image-1.jpg"
              alt="image 1"
              class="w-100 object-fit-cover"
              width="1024"
              height="1280"
            />
          </div>
        </div>
      </div>
      Context
      <pre v-if="isMounted">{{ context }}</pre>
      <BaseButton />
    </main>
  </LayoutHollyGrail>
</template>
