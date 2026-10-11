<script setup lang="ts">
  import type { DemoRun } from '@app/services';

  import { tv } from 'tailwind-variants';

  import { UiBadge, UiButton, UiEyebrow } from '../atoms';
  import { RunResult } from '../molecules';

  defineProps<{
    error: string;
    isPending: boolean;
    run: DemoRun | undefined;
  }>();
  defineEmits<{ request: [shouldSimulateFailure: boolean] }>();
  const styles = tv({
    slots: {
      actions: 'flex flex-wrap items-center gap-3',
      base: 'rounded-xl border border-line bg-white p-6 md:p-7',
      delay: 'ml-auto font-mono text-[0.65rem] text-muted',
      endpoint:
        'flex flex-wrap items-center gap-3 border-y border-line/60 py-5',
      heading: 'mb-4 flex items-center justify-between gap-3',
    },
  })();
</script>

<template>
  <section :class="styles.base()">
    <div :class="styles.heading()">
      <UiEyebrow>REQUEST CONSOLE</UiEyebrow>
      <UiBadge>MOCK API</UiBadge>
    </div>
    <div :class="styles.endpoint()">
      <UiBadge>GET</UiBadge>
      <code class="font-mono text-sm">/api/mocks/run</code>
      <span :class="styles.delay()">650 ms server delay</span>
    </div>
    <RunResult
      :error="error"
      :is-pending="isPending"
      :run="run"
    />
    <div :class="styles.actions()">
      <UiButton
        :disabled="isPending"
        @click="$emit('request', false)"
      >
        {{ error ? 'Retry request' : 'Run request' }}
        <span aria-hidden="true">↗</span>
      </UiButton>
      <UiButton
        appearance="secondary"
        :disabled="isPending"
        @click="$emit('request', true)"
      >
        Simulate failure
      </UiButton>
    </div>
  </section>
</template>
