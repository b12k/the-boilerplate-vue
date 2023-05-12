<template>
  <button class="btn btn-primary" @click="handleClick">Button</button>
</template>

<script lang="ts" setup>
  import { api } from '../../services';

  const handleClick = () => {
    api();
  };
</script>
