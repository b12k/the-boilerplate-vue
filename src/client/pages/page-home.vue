<script setup lang="ts">
  import { foo } from '../barrel';
  import { BaseIcon } from '../components';
</script>
<template>
  <main class="page-home">
    {{ foo }}
    <BaseIcon icon="ShakaBrah" />
  </main>
</template>
