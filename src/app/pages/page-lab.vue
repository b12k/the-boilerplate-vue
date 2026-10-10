<script setup lang="ts">
  import {
    CardSection,
    ContextPanel,
    PageIntro,
    PageShell,
    RequestConsole,
  } from '@app/components';
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';
  import { tv } from 'tailwind-variants';
  import { computed } from 'vue';

  defineOptions({
    fetchData: async (_, getStore) => {
      await getStore('showcase').fetchRun();
    },
  });
  const showcaseStore = useStore('showcase');
  const { isRunPending, requestsCount, run, runError } =
    storeToRefs(showcaseStore);
  const { counter, doubledCounter } = storeToRefs(useStore('home'));
  const contextStore = useStore('context');
  const rows = computed(() => [
    { label: 'Completed mock calls', value: requestsCount.value },
    {
      label: 'Shared counter',
      value: `${counter.value} → ${doubledCounter.value}`,
    },
    { label: 'Language', value: String(contextStore.lang ?? 'Unknown') },
    { label: 'Device', value: contextStore.device.type },
    { label: 'App version', value: contextStore.version },
    {
      label: 'Render cache',
      value: contextStore.isRenderCacheEnabled ? 'Enabled' : 'Disabled',
    },
    {
      label: 'Critical CSS cache',
      value: contextStore.isCriticalCssCacheEnabled ? 'Enabled' : 'Disabled',
    },
  ]);
  const experiments = [
    {
      description:
        'SSR waits for the route data. The first HTML already contains the completed result.',
      name: 'Open this URL directly.',
      number: '01',
    },
    {
      description:
        'This route uses noPreFetchAwait. Navigation can complete while the mock request is pending.',
      name: 'Navigate here from Overview.',
      number: '02',
    },
    {
      description:
        'The navigation signal cancels the Axios request. A stale result cannot replace the next request.',
      name: 'Leave while it loads.',
      number: '03',
    },
  ];
  const grid = tv({ base: 'grid items-start gap-6 md:grid-cols-[1.5fr_1fr]' });
  async function fetchRun(shouldFail = false) {
    await showcaseStore.fetchRun(shouldFail);
  }
  useHead({ title: 'Data Lab — Vue Boilerplate' });
</script>

<template>
  <PageShell>
    <PageIntro eyebrow="03 / INTERACTIVE DEMO">
      <template #title>
        Watch the data
        <br />
        become a page.
      </template>
      A server mock API with real HTTP requests through Axios. The response
      lives in Pinia. The page reads it during SSR and in your browser.
    </PageIntro>
    <div :class="grid()">
      <RequestConsole
        :error="runError"
        :is-pending="isRunPending"
        :run="run"
        @request="fetchRun"
      />
      <ContextPanel :rows="rows" />
    </div>
    <CardSection
      :cards="experiments"
      eyebrow="WHAT TO TRY"
      title="Three useful experiments."
    />
  </PageShell>
</template>
