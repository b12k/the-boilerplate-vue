<script setup lang="ts">
  import { useStore } from '@app/store';
  import { tv } from 'tailwind-variants';

  import { UiLogo } from '../atoms';
  import { container } from '../ui.styles';

  const contextStore = useStore('context');
  const styles = tv({
    slots: {
      base: 'border-b border-line',
      inner:
        'flex min-h-25 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 md:min-h-22 md:flex-nowrap md:gap-6 md:py-0',
      language:
        'rounded-md border border-line px-3 py-2 font-mono text-xs hover:bg-panel',
      link: 'border-b-2 border-transparent py-3 text-sm text-muted hover:text-ink',
      nav: 'order-3 flex w-full items-center gap-6 md:order-none md:w-auto md:gap-8',
    },
  })();
</script>

<template>
  <header :class="styles.base()">
    <div :class="container({ class: styles.inner() })">
      <RouterLink
        to="/"
        aria-label="Vue Boilerplate home"
      >
        <UiLogo />
      </RouterLink>
      <nav
        aria-label="Main navigation"
        :class="styles.nav()"
      >
        <RouterLink
          to="/"
          :class="styles.link()"
          exact-active-class="border-accent! text-ink!"
        >
          Overview
        </RouterLink>
        <RouterLink
          to="/about"
          :class="styles.link()"
          active-class="border-accent! text-ink!"
        >
          Architecture
        </RouterLink>
        <RouterLink
          to="/lab"
          :class="styles.link()"
          active-class="border-accent! text-ink!"
        >
          Data Lab
          <span aria-hidden="true">↗</span>
        </RouterLink>
      </nav>
      <a
        :class="styles.language()"
        :href="contextStore.lang === 'en' ? '/de' : '/en'"
        aria-label="Change language"
      >
        {{ String(contextStore.lang ?? '').toUpperCase() }} ↔
      </a>
    </div>
  </header>
</template>
