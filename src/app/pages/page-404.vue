<script setup lang="ts">
  import UiLink from '@app/components/atoms/ui-link.vue';
  import PageIntro from '@app/components/molecules/page-intro.vue';
  import PageShell from '@app/components/templates/page-shell.vue';
  import { useHead } from '@unhead/vue';

  useHead({ title: 'Page not found — Vue Boilerplate' });
</script>

<template>
  <PageShell>
    <PageIntro eyebrow="404 / ROUTE NOT FOUND">
      <template #title>
        This page is
        <br />
        off the map.
      </template>
      The application is still here. Open the overview or explore the data flow.
    </PageIntro>
    <div class="flex flex-wrap items-center gap-3">
      <UiLink
        to="/"
        appearance="primary"
      >
        Back to Overview
      </UiLink>
      <UiLink to="/lab">Open Data Lab ↗</UiLink>
    </div>
  </PageShell>
</template>
