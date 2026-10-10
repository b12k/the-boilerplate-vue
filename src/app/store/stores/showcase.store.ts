import type {
  ApiErrorResponse,
  DemoArchitecture,
  DemoOverview,
  DemoProject,
  DemoRun,
} from '@app/services';

import { isAxiosError, isCancel } from 'axios';
import { defineStore } from 'pinia';

import { hot } from '../utils';

export const showcase = hot(
  defineStore('showcase', {
    actions: {
      async fetchArchitecture() {
        this.architecture = await this.$services.api.fetchArchitecture();
        this.requestsCount += 1;
      },
      async fetchOverview() {
        this.overview = await this.$services.api.fetchOverview();
        this.requestsCount += 1;
      },
      async fetchProject(id: string) {
        const project = await this.$services.api.fetchProject(id);
        this.projects = project ? [project] : [];
        this.requestsCount += 1;
      },
      async fetchRun(shouldFail = false) {
        let isRequestCancelled = false;
        const requestSequence = this.requestSequence + 1;
        this.requestSequence = requestSequence;
        this.isRunPending = true;
        this.runError = '';
        try {
          const run = await this.$services.api.fetchRun(shouldFail);
          if (requestSequence === this.requestSequence) this.runs = [run];
        } catch (error) {
          if (isCancel(error)) {
            isRequestCancelled = true;
            return;
          }
          if (requestSequence === this.requestSequence) {
            if (isAxiosError<ApiErrorResponse>(error)) {
              this.runError = error.response?.data.message ?? error.message;
            } else {
              this.runError = Error.isError(error)
                ? error.message
                : 'The mock request failed.';
            }
          }
        } finally {
          if (requestSequence === this.requestSequence) {
            this.isRunPending = false;
            if (!isRequestCancelled) this.requestsCount += 1;
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
