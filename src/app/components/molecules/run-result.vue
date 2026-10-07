<script setup lang="ts">
  import type { DemoRun } from '@app/services/demo-api';

  import { tv } from 'tailwind-variants';

  defineProps<{
    error: string;
    isPending: boolean;
    run: DemoRun | undefined;
  }>();
  const styles = tv({
    slots: {
      base: 'min-h-72 py-6',
      description: 'text-sm',
      spinner:
        'mb-5 block size-8 animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none',
      steps: 'mt-5 space-y-2 text-sm text-muted',
      title: 'mb-2.5 text-2xl',
    },
  })();
  const symbol = tv({
    base: 'mb-4 flex size-9 items-center justify-center rounded-full',
    variants: {
      isError: {
        false: 'bg-panel text-accent',
        true: 'bg-orange-50 text-orange-800',
      },
    },
  });
</script>

<template>
  <div
    :class="styles.base()"
    aria-live="polite"
    :aria-busy="isPending"
  >
    <template v-if="isPending">
      <span
        :class="styles.spinner()"
        aria-hidden="true"
      />
      <h2 :class="styles.title()">Request in progress.</h2>
      <p :class="styles.description()">
        The route can show this state while prefetch runs in the background.
      </p>
    </template>
    <template v-else-if="error">
      <span
        :class="symbol({ isError: true })"
        aria-hidden="true"
      >
        !
      </span>
      <h2 :class="styles.title()">A controlled failure.</h2>
      <p :class="styles.description()">{{ error }}</p>
    </template>
    <template v-else-if="run">
      <span
        :class="symbol({ isError: false })"
        aria-hidden="true"
      >
        ✓
      </span>
      <h2 :class="styles.title()">Data is ready.</h2>
      <p :class="styles.description()">
        Response #{{ run.sequence }} is now in the store.
      </p>
      <ol :class="styles.steps()">
        <li
          v-for="step in run.steps"
          :key="step"
        >
          <span
            class="mr-1.5 text-accent"
            aria-hidden="true"
          >
            ✓
          </span>
          {{ step }}
        </li>
      </ol>
    </template>
  </div>
</template>
