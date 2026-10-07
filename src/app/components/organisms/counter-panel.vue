<script setup lang="ts">
  import { BaseIcon } from '@app/components/base';
  import { tv } from 'tailwind-variants';

  import { UiButton, UiEyebrow } from '../atoms';

  defineProps<{ counter: number; doubledCounter: number }>();
  defineEmits<{ increment: [] }>();
  const styles = tv({
    slots: {
      base: 'mt-12 grid items-center gap-7 rounded-lg border border-line bg-panel p-6 md:grid-cols-[1.4fr_1fr] md:gap-10 md:p-9',
      caption: 'text-xs text-muted',
      demo: 'flex flex-col items-center gap-3',
      description: 'text-sm',
      icon: 'size-7 text-accent',
      number: 'font-mono text-4xl font-normal tracking-tight',
      title: 'my-3',
      values: 'flex items-center gap-5',
    },
  })();
</script>

<template>
  <section :class="styles.base()">
    <div>
      <UiEyebrow>A STORE YOU CAN TOUCH</UiEyebrow>
      <h2 :class="styles.title()">State stays with you.</h2>
      <p :class="styles.description()">
        Change the counter. Visit another page. Come back.
        <br />
        The same Pinia store keeps your value during navigation.
      </p>
    </div>
    <div :class="styles.demo()">
      <BaseIcon
        icon="ShakaBrah"
        :class="styles.icon()"
        aria-hidden="true"
      />
      <div
        :class="styles.values()"
        data-testid="counter"
      >
        <strong :class="styles.number()">{{ counter }}</strong>
        <span class="text-sm text-muted">× 2</span>
        <strong :class="styles.number()">{{ doubledCounter }}</strong>
      </div>
      <UiButton @click="$emit('increment')">
        Increment counter
        <span aria-hidden="true">+</span>
      </UiButton>
      <small :class="styles.caption()">
        A full reload restores the server state.
      </small>
    </div>
  </section>
</template>
