<script setup lang="ts">
  import { useStore } from '@app/store';

  const contextStore = useStore('context');
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink
        to="/"
        class="wordmark"
        aria-label="Vue Boilerplate home"
      >
        <span
          class="brand-mark"
          aria-hidden="true"
        >
          [v]
        </span>
        boilerplate
        <span class="wordmark-dot">.</span>
      </RouterLink>
      <nav aria-label="Main navigation">
        <RouterLink
          to="/"
          exact-active-class="nav-active"
        >
          Overview
        </RouterLink>
        <RouterLink
          to="/about"
          active-class="nav-active"
        >
          Architecture
        </RouterLink>
        <RouterLink
          to="/lab"
          active-class="nav-active"
        >
          Data Lab
          <span aria-hidden="true">↗</span>
        </RouterLink>
      </nav>
      <a
        class="language-link"
        :href="contextStore.lang === 'en' ? '/de' : '/en'"
        aria-label="Change language"
      >
        {{ String(contextStore.lang ?? '').toUpperCase() }}
        <span aria-hidden="true">↔</span>
      </a>
    </div>
  </header>
</template>
