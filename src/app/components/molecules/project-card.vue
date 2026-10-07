<script setup lang="ts">
  import type { DemoProject } from '@app/services/demo-api';

  import { tv } from 'tailwind-variants';

  import { UiEyebrow } from '../atoms';

  defineProps<{ project: DemoProject }>();
  const styles = tv({
    slots: {
      base: 'rounded-lg border border-line bg-white p-6 transition duration-150 hover:-translate-y-0.5 hover:border-accent/60 motion-reduce:transform-none motion-reduce:transition-none',
      description: 'min-h-15 text-sm',
      mark: 'mb-6 flex h-18 items-center justify-between border-b border-line/60 pb-5 text-3xl font-medium text-accent',
      status: 'mt-7',
      title: 'mt-2 mb-2.5 text-2xl',
    },
  })();
</script>

<template>
  <RouterLink
    :to="'/projects/' + project.id"
    :class="styles.base()"
  >
    <div :class="styles.mark()">
      {{ project.name.slice(0, 1) }}
      <span
        class="text-xl text-muted"
        aria-hidden="true"
      >
        ↗
      </span>
    </div>
    <UiEyebrow>{{ project.category }}</UiEyebrow>
    <h3 :class="styles.title()">{{ project.name }}</h3>
    <p :class="styles.description()">{{ project.description }}</p>
    <UiEyebrow
      dot
      :class="styles.status()"
    >
      {{ project.status }}
    </UiEyebrow>
  </RouterLink>
</template>
