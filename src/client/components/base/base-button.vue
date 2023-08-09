<template>
  <button class="btn btn-primary" @click="handleClick">Button</button>
</template>

<script lang="ts" setup>
  const handleClick = async () => {
    const { default: isMobile } = await import('is-mobile');
    console.log(isMobile());
  };
</script>
