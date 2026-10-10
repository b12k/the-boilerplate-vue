<script setup lang="ts">
  import { PageIntro, PageShell, ProjectDetail, UiLink } from '@app/components';
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';

  defineOptions({
    fetchData: async (to, getStore) => {
      await getStore('showcase').fetchProject(String(to.params['projectId']));
    },
    shouldReFetch: true,
  });
  const { project } = storeToRefs(useStore('showcase'));
  useHead(() => ({
    title: `${project.value?.name ?? 'Project not found'} — Vue Boilerplate`,
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
    <template v-if="project">
      <PageIntro :eyebrow="'EXAMPLE APPLICATION / ' + project.category">
        <template #title>
          {{ project.name }}
          <span class="text-accent">.</span>
        </template>
        {{ project.description }}
      </PageIntro>
      <ProjectDetail :project="project" />
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
