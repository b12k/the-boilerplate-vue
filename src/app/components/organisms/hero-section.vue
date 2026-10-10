<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  import { UiBadge, UiEyebrow, UiLink } from '../atoms';

  const steps = [
    {
      description: 'Route + language + device context',
      name: 'Request arrives',
    },
    { description: 'Axios HTTP → typed data → Pinia', name: 'Fetch the data' },
    {
      description: 'Page content + serialized state',
      name: 'Render useful HTML',
    },
    {
      description: 'Hydrate once. Navigate without reload.',
      name: 'Let the client take over',
    },
  ];
  const styles = tv({
    slots: {
      actions: 'flex flex-wrap items-center gap-3',
      base: 'grid items-center gap-9 py-11 md:grid-cols-[1.2fr_1fr] md:gap-8 md:pt-22 md:pb-20 lg:gap-16',
      description: 'mt-6 mb-8 max-w-118 text-base md:text-lg',
      eyebrow: 'mb-6',
      heading: 'text-muted',
      note: 'mt-5',
      number: 'font-mono text-xs text-muted',
      panel: 'rounded-xl border border-line bg-white p-5 shadow-sm md:p-6',
      panelHeading: 'mb-3 flex items-center justify-between gap-3',
      step: 'flex items-center gap-4.5 border-b border-line/60 py-5',
      stepDescription: 'mt-1 block text-xs text-muted',
      stepTitle: 'block text-sm font-medium',
      tech: 'mt-7 flex flex-wrap gap-4.5 font-mono text-xs text-muted',
    },
  })();
</script>

<template>
  <section :class="styles.base()">
    <div>
      <UiEyebrow
        dot
        :class="styles.eyebrow()"
      >
        A SMALL FOUNDATION. A FULL APPLICATION.
      </UiEyebrow>
      <h1>
        Build the app.
        <br />
        <span :class="styles.heading()">Own the architecture.</span>
      </h1>
      <p :class="styles.description()">
        Vue, TypeScript and server rendering. Clear layers, shared state, and a
        request path you can understand.
      </p>
      <div :class="styles.actions()">
        <UiLink
          to="/lab"
          appearance="primary"
        >
          Explore the data flow
          <span aria-hidden="true">↗</span>
        </UiLink>
        <UiLink to="/about">See the architecture</UiLink>
      </div>
      <div :class="styles.tech()">
        <span
          v-for="tech in ['Vue', 'TypeScript', 'Pinia', 'Rspack', 'Express']"
          :key="tech"
        >
          {{ tech }}
        </span>
      </div>
    </div>
    <div :class="styles.panel()">
      <div :class="styles.panelHeading()">
        <UiEyebrow>THE REQUEST PATH</UiEyebrow>
        <UiBadge>SSR → CLIENT</UiBadge>
      </div>
      <div
        v-for="(step, index) in steps"
        :key="step.name"
        :class="styles.step()"
      >
        <span :class="styles.number()">0{{ index + 1 }}</span>
        <div>
          <strong :class="styles.stepTitle()">{{ step.name }}</strong>
          <small :class="styles.stepDescription()">
            {{ step.description }}
          </small>
        </div>
        <span
          class="ml-auto text-accent"
          aria-hidden="true"
        >
          ✓
        </span>
      </div>
      <UiEyebrow
        dot
        :class="styles.note()"
      >
        Mock data. Real application lifecycle.
      </UiEyebrow>
    </div>
  </section>
</template>
