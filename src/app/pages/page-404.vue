<script setup lang="ts">
  import { useHead } from '@unhead/vue';

  useHead({ title: 'Page not found — Vue Boilerplate' });
</script>

<template>
  <main class="page-404 page-shell">
    <section class="page-intro">
      <span class="eyebrow">404 / ROUTE NOT FOUND</span>
      <h1>
        This page is
        <br />
        off the map.
      </h1>
      <p>
        The application is still here. Open the overview or explore the data
        flow.
      </p>
      <div class="button-row">
        <RouterLink
          class="button button-primary"
          to="/"
        >
          Back to Overview
        </RouterLink>
        <RouterLink
          class="button button-secondary"
          to="/lab"
        >
          Open Data Lab ↗
        </RouterLink>
      </div>
    </section>
  </main>
</template>
