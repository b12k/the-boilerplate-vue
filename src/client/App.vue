<template>
  <div id="app">
    <RouterLink
      :to="{
        name: 'Home',
      }"
    >
      Home
    </RouterLink>
    <RouterLink
      :to="{
        name: 'About',
      }"
    >
      About
    </RouterLink>
    <RouterView />
  </div>
</template>
<script>
  export default {
    name: 'App',
  };
</script>
