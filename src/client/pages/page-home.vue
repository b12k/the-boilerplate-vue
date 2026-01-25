<script setup lang="ts">
  import { storeToRefs } from 'pinia';

  import { BaseIcon } from '../components';
  import { useHomeStore } from '../store';

  const store = useHomeStore();
  const { counter, doubledCounter } = storeToRefs(store);
  const { incrementCounter } = store;
</script>
<template>
  <main class="page-home">
    <BaseIcon icon="ShakaBrah" />
    <div>
      <button @click="incrementCounter">[[ increment ]]</button>
    </div>
    <p>{{ counter }} x 2 = {{ doubledCounter }}</p>
  </main>
</template>
