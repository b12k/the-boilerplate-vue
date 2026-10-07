<script setup lang="ts">
  import PageIntro from '@app/components/molecules/page-intro.vue';
  import ArchitectureSection from '@app/components/organisms/architecture-section.vue';
  import CardSection from '@app/components/organisms/card-section.vue';
  import ServerPanel from '@app/components/organisms/server-panel.vue';
  import PageShell from '@app/components/templates/page-shell.vue';
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
      heading="mono"
      title="Less ceremony. More clarity."
    />
    <ServerPanel />
  </PageShell>
</template>
