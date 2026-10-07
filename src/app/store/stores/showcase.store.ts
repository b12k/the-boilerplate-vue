import type {
  DemoArchitecture,
  DemoOverview,
  DemoProject,
  DemoRun,
} from '@app/services/demo-api';

import { defineStore } from 'pinia';

import { hot } from '../utils';

export const showcase = hot(
  defineStore('showcase', {
    actions: {
      async fetchArchitecture(signal?: AbortSignal) {
        this.architecture = await this.$services.api.fetchArchitecture(signal);
        this.requestsCount += 1;
      },
      async fetchOverview(signal?: AbortSignal) {
        this.overview = await this.$services.api.fetchOverview(signal);
        this.requestsCount += 1;
      },
      async fetchProject(id: string, signal?: AbortSignal) {
        const project = await this.$services.api.fetchProject(id, signal);
        this.projects = project ? [project] : [];
        this.requestsCount += 1;
      },
      async fetchRun(shouldFail = false, signal?: AbortSignal) {
        const requestSequence = this.requestSequence + 1;
        this.requestSequence = requestSequence;
        this.isRunPending = true;
        this.runError = '';
        try {
          const run = await this.$services.api.fetchRun(shouldFail, signal);
          if (requestSequence === this.requestSequence) this.runs = [run];
        } catch (error) {
          if (signal?.aborted) return;
          if (requestSequence === this.requestSequence) {
            this.runError = Error.isError(error)
              ? error.message
              : 'The mock request failed.';
          }
        } finally {
          if (requestSequence === this.requestSequence) {
            this.isRunPending = false;
            if (!signal?.aborted) this.requestsCount += 1;
          }
        }
      },
    },
    getters: {
      project: (state) => state.projects.at(0),
      run: (state) => state.runs.at(-1),
    },
    state: () => ({
      architecture: { layers: [], principles: [] } as DemoArchitecture,
      isRunPending: false,
      overview: { features: [], projects: [] } as DemoOverview,
      projects: [] as Array<DemoProject>,
      requestsCount: 0,
      requestSequence: 0,
      runError: '',
      runs: [] as Array<DemoRun>,
    }),
  }),
  import.meta.webpackHot,
);
