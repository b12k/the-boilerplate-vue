<script setup lang="ts">
  import {
    ArchitectureSection,
    CardSection,
    PageIntro,
    PageShell,
    ServerPanel,
  } from '@app/components';
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';

  defineOptions({
    fetchData: async (_, getStore) => {
      await getStore('showcase').fetchArchitecture();
    },
  });
  const { architecture } = storeToRefs(useStore('showcase'));
  useHead({ title: 'Architecture — Vue Boilerplate' });
</script>

<template>
  <PageShell>
    <PageIntro eyebrow="02 / ARCHITECTURE">
      <template #title>
        A foundation you
        <br />
        can follow.
      </template>
      Keep the framework familiar. Keep the application layers explicit. This
      demo uses the same code path for server rendering and client navigation.
    </PageIntro>
    <ArchitectureSection :layers="architecture.layers" />
    <CardSection
      :cards="architecture.principles"
      eyebrow="DESIGN PRINCIPLES"
      heading-variant="mono"
      title="Less ceremony. More clarity."
    />
    <ServerPanel />
  </PageShell>
</template>
