<script setup lang="ts">
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';

  defineOptions({
    fetchData: async (to, getStore, signal) => {
      await getStore('showcase').fetchProject(
        String(to.params['projectId']),
        signal,
      );
    },
    shouldReFetch: true,
  });
  const { project } = storeToRefs(useStore('showcase'));
  useHead(() => ({
    title: `${project.value?.name ?? 'Project not found'} — Vue Boilerplate`,
  }));
</script>

<template>
  <main class="page-project page-shell">
    <RouterLink
      class="text-link back-link"
      to="/"
    >
      ← Back to Overview
    </RouterLink>
    <template v-if="project">
      <section class="page-intro">
        <span class="eyebrow">
          EXAMPLE APPLICATION / {{ project.category }}
        </span>
        <h1>
          {{ project.name }}
          <span class="project-heading-dot">.</span>
        </h1>
        <p>{{ project.description }}</p>
      </section>
      <section class="project-detail-grid">
        <div class="project-blueprint">
          <span class="eyebrow">A SMALL PRODUCT BLUEPRINT</span>
          <div class="blueprint-mark">{{ project.name.slice(0, 1) }}</div>
          <span class="tag">MOCK PROJECT DATA</span>
        </div>
        <div>
          <span class="eyebrow">FOUNDATION FEATURES</span>
          <h2>
            Ready for your
            <br />
            application logic.
          </h2>
          <ul class="detail-features">
            <li
              v-for="feature in project.features"
              :key="feature"
            >
              <span class="flow-check">✓</span>
              {{ feature }}
            </li>
          </ul>
          <p class="section-description">
            The route parameter selects this record. fetchData calls the
            injected API service and writes its response to Pinia. Moving to
            another project runs prefetch again.
          </p>
          <div class="button-row">
            <RouterLink
              class="button button-secondary"
              :to="'/projects/' + (project.id === 'atlas' ? 'relay' : 'atlas')"
            >
              Open another project ↗
            </RouterLink>
            <RouterLink
              class="text-link"
              to="/lab"
            >
              Inspect the store
            </RouterLink>
          </div>
        </div>
      </section>
    </template>
    <section
      v-else
      class="page-intro"
    >
      <span class="eyebrow">MOCK API RESULT</span>
      <h1>No project found.</h1>
      <p>This identifier has no record in the demo dataset.</p>
      <RouterLink
        class="button button-primary"
        to="/"
      >
        Explore the examples
      </RouterLink>
    </section>
  </main>
</template>
