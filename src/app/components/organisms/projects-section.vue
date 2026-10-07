<script setup lang="ts">
  import type { DemoProject } from '@app/services/demo-api';

  import { tv } from 'tailwind-variants';

  import UiBadge from '../atoms/ui-badge.vue';
  import ProjectCard from '../molecules/project-card.vue';
  import SectionHeading from '../molecules/section-heading.vue';

  defineProps<{ projects: Array<DemoProject> }>();
  const styles = tv({
    slots: {
      base: 'mt-10 border-t border-line pt-9',
      grid: 'grid gap-4.5 md:grid-cols-3',
    },
  })();
</script>

<template>
  <section :class="styles.base()">
    <SectionHeading
      eyebrow="DATA FROM THE MOCK API"
      title="One foundation. Different products."
    >
      <UiBadge>PREFETCHED INTO PINIA</UiBadge>
    </SectionHeading>
    <div :class="styles.grid()">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
    </div>
  </section>
</template>
