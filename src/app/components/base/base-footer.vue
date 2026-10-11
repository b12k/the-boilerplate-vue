<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  import { UiLogo } from '../atoms';
  import { container } from '../ui.styles';

  const styles = tv({
    slots: {
      base: 'border-t border-line',
      caption: 'font-mono text-[0.6rem] tracking-wider',
      inner:
        'flex min-h-24 flex-wrap items-center justify-start gap-x-6 gap-y-3 py-6 text-xs text-muted md:justify-between',
    },
  })();
</script>

<template>
  <footer :class="styles.base()">
    <div :class="container({ class: styles.inner() })">
      <UiLogo size="small" />
      <span>Small foundation. Clear boundaries.</span>
      <span :class="styles.caption()">VUE / TYPESCRIPT / SSR</span>
    </div>
  </footer>
</template>
