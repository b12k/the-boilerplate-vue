<script setup lang="ts">
  import type { DemoProject } from '@app/services';

  import { tv } from 'tailwind-variants';

  import { UiBadge, UiEyebrow, UiLink } from '../atoms';

  defineProps<{ project: DemoProject }>();
  const styles = tv({
    slots: {
      actions: 'flex flex-wrap items-center gap-3',
      base: 'grid items-center gap-8 md:grid-cols-2 md:gap-16',
      blueprint:
        'flex min-h-90 flex-col items-center justify-between rounded-lg border border-line bg-panel bg-[linear-gradient(#d6dfd080_1px,transparent_1px),linear-gradient(90deg,#d6dfd080_1px,transparent_1px)] bg-size-[24px_24px] p-6',
      description: 'my-5 text-sm',
      feature: 'flex items-center gap-3 text-sm',
      features: 'my-6 space-y-3',
      mark: 'text-9xl leading-none font-medium text-accent',
      title: 'mt-4',
    },
  })();
</script>

<template>
  <section :class="styles.base()">
    <div :class="styles.blueprint()">
      <UiEyebrow>A SMALL PRODUCT BLUEPRINT</UiEyebrow>
      <div :class="styles.mark()">{{ project.name.slice(0, 1) }}</div>
      <UiBadge>MOCK PROJECT DATA</UiBadge>
    </div>
    <div>
      <UiEyebrow>FOUNDATION FEATURES</UiEyebrow>
      <h2 :class="styles.title()">
        Ready for your
        <br />
        application logic.
      </h2>
      <ul :class="styles.features()">
        <li
          v-for="feature in project.features"
          :key="feature"
          :class="styles.feature()"
        >
          <span
            class="text-accent"
            aria-hidden="true"
          >
            ✓
          </span>
          {{ feature }}
        </li>
      </ul>
      <p :class="styles.description()">
        The route parameter selects this record. fetchData calls the injected
        API service and writes its response to Pinia. Moving to another project
        runs prefetch again.
      </p>
      <div :class="styles.actions()">
        <UiLink
          :to="'/projects/' + (project.id === 'atlas' ? 'relay' : 'atlas')"
        >
          Open another project ↗
        </UiLink>
        <UiLink
          to="/lab"
          appearance="text"
        >
          Inspect the store
        </UiLink>
      </div>
    </div>
  </section>
</template>
