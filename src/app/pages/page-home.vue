<script setup lang="ts">
  import CardSection from '@app/components/organisms/card-section.vue';
  import CounterPanel from '@app/components/organisms/counter-panel.vue';
  import HeroSection from '@app/components/organisms/hero-section.vue';
  import ProjectsSection from '@app/components/organisms/projects-section.vue';
  import PageShell from '@app/components/templates/page-shell.vue';
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';

  defineOptions({
    fetchData: async (_, getStore, signal) => {
      await getStore('showcase').fetchOverview(signal);
    },
  });
  const { overview } = storeToRefs(useStore('showcase'));
  const homeStore = useStore('home');
  const { counter, doubledCounter } = storeToRefs(homeStore);
  useHead({ title: 'Vue Boilerplate — A clear starting point' });
</script>

<template>
  <PageShell>
    <HeroSection />
    <CardSection
      :cards="overview.features"
      columns="four"
      eyebrow="BUILT INTO THE FOUNDATION"
      title="Small pieces. A complete path."
    />
    <ProjectsSection :projects="overview.projects" />
    <CounterPanel
      :counter="counter"
      :doubled-counter="doubledCounter"
      @increment="homeStore.incrementCounter()"
    />
  </PageShell>
</template>
