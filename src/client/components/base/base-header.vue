<template>
  <header class="container">
    <RouterLink :to="{ name: 'One' }" class="btn btn-link">One</RouterLink>
    <RouterLink :to="{ name: 'Two' }" class="btn btn-link">Two</RouterLink>
    <RouterLink :to="{ name: 'Three' }" class="btn btn-link">Three</RouterLink>
    <RouterLink :to="{ name: 'Error' }" class="btn btn-link">Error</RouterLink>
    <RouterLink :to="{ name: 'NotFound' }" class="btn btn-link">
      NotFound
    </RouterLink>
  </header>
</template>
