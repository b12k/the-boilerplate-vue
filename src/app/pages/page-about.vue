<script setup lang="ts">
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';

  defineOptions({
    fetchData: async (_, getStore, signal) => {
      await getStore('showcase').fetchArchitecture(signal);
    },
  });
  const { architecture } = storeToRefs(useStore('showcase'));
  useHead({ title: 'Architecture — Vue Boilerplate' });
</script>

<template>
  <main class="page-about page-shell">
    <section class="page-intro">
      <span class="eyebrow">02 / ARCHITECTURE</span>
      <h1>
        A foundation you
        <br />
        can follow.
      </h1>
      <p>
        Keep the framework familiar. Keep the application layers explicit. This
        demo uses the same code path for server rendering and client navigation.
      </p>
    </section>
    <section class="architecture-grid">
      <div>
        <span class="eyebrow">FROM ROUTE TO PAGE</span>
        <h2>
          Five steps.
          <br />
          One data flow.
        </h2>
        <p class="section-description">
          The content on this page came from the mock API. Its route loader
          wrote the response into a request-scoped Pinia store before SSR
          rendered it.
        </p>
        <RouterLink
          class="text-link"
          to="/lab"
        >
          Run the flow yourself
          <span aria-hidden="true">↗</span>
        </RouterLink>
      </div>
      <ol class="architecture-list">
        <li
          v-for="(layer, index) in architecture?.layers"
          :key="layer.name"
        >
          <span class="flow-number">0{{ index + 1 }}</span>
          <div>
            <h3>{{ layer.name }}</h3>
            <p>{{ layer.description }}</p>
            <code>{{ layer.file }}</code>
          </div>
        </li>
      </ol>
    </section>
    <section class="section-block">
      <div class="section-heading">
        <div>
          <span class="eyebrow">DESIGN PRINCIPLES</span>
          <h2>Less ceremony. More clarity.</h2>
        </div>
      </div>
      <div class="principle-grid">
        <article
          v-for="principle in architecture?.principles"
          :key="principle.name"
          class="feature-card"
        >
          <h3 class="principle-name">{{ principle.name }}</h3>
          <p>{{ principle.description }}</p>
        </article>
      </div>
    </section>
    <section class="state-panel">
      <div>
        <span class="eyebrow">BEYOND THE COMPONENT</span>
        <h2>The server is part of the design.</h2>
        <p>
          Render caching, critical CSS, request context and production builds
          are part of this foundation. Their configuration stays explicit.
        </p>
      </div>
      <div class="server-features">
        <span>SSR render cache</span>
        <span>Critical CSS cache</span>
        <span>Language-aware URLs</span>
        <span>Unhead metadata</span>
        <span>Lazy route chunks</span>
        <span>Typed service injection</span>
      </div>
    </section>
  </main>
</template>
