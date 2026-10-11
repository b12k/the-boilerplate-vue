<script setup lang="ts">
  import { PageIntro, PageShell, ProjectDetail, UiLink } from '@app/components';
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';

  defineOptions({
    fetchData: async (to, getStore) => {
      const showcaseStore = getStore('showcase');
      await showcaseStore.fetchProject(String(to.params['projectId']));
      to.meta.responseCode = showcaseStore.currentProject ? 200 : 404;
    },
    shouldReFetch: true,
  });
  const { currentProject } = storeToRefs(useStore('showcase'));
  useHead(() => ({
    title: `${currentProject.value?.name ?? 'Project not found'} — Vue Boilerplate`,
  }));
</script>

<template>
  <PageShell>
    <UiLink
      to="/"
      appearance="text"
      class="mt-10"
    >
      ← Back to Overview
    </UiLink>
    <template v-if="currentProject">
      <PageIntro :eyebrow="'EXAMPLE APPLICATION / ' + currentProject.category">
        <template #title>
          {{ currentProject.name }}
          <span class="text-accent">.</span>
        </template>
        {{ currentProject.description }}
      </PageIntro>
      <ProjectDetail :project="currentProject" />
    </template>
    <template v-else>
      <PageIntro eyebrow="MOCK API RESULT">
        <template #title>No project found.</template>
        This identifier has no record in the demo dataset.
      </PageIntro>
      <UiLink
        to="/"
        appearance="primary"
      >
        Explore the examples
      </UiLink>
    </template>
  </PageShell>
</template>
