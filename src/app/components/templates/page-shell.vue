<script setup lang="ts">
  import { container } from '../ui.styles';
</script>

<template>
  <main :class="container({ class: 'pb-12 md:pb-22' })"><slot /></main>
</template>
