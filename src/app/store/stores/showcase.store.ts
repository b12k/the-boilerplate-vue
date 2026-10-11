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
        this.completedRequestsCount += 1;
      },
      async fetchOverview() {
        this.overview = await this.$services.api.fetchOverview();
        this.completedRequestsCount += 1;
      },
      async fetchProject(id: string) {
        const project = await this.$services.api.fetchProject(id);
        this.projects = project ? [project] : [];
        this.completedRequestsCount += 1;
      },
      async fetchRun(shouldSimulateFailure = false) {
        let isRequestCancelled = false;
        const currentRunRequestSequence = this.runRequestSequence + 1;
        this.runRequestSequence = currentRunRequestSequence;
        this.isRunPending = true;
        this.runError = '';
        try {
          const runResult = await this.$services.api.fetchRun(
            shouldSimulateFailure,
          );
          if (currentRunRequestSequence === this.runRequestSequence) {
            this.runs = [runResult];
          }
        } catch (error) {
          if (isCancel(error)) {
            isRequestCancelled = true;
            return;
          }
          if (currentRunRequestSequence === this.runRequestSequence) {
            if (isAxiosError<ApiErrorResponse>(error)) {
              this.runError = error.response?.data.message ?? error.message;
            } else {
              this.runError = Error.isError(error)
                ? error.message
                : 'The mock request failed.';
            }
          }
        } finally {
          if (currentRunRequestSequence === this.runRequestSequence) {
            this.isRunPending = false;
            if (!isRequestCancelled) this.completedRequestsCount += 1;
          }
        }
      },
    },
    getters: {
      currentProject: (state) => state.projects.at(0),
      latestRunResult: (state) => state.runs.at(-1),
    },
    state: () => ({
      architecture: { layers: [], principles: [] } as DemoArchitecture,
      completedRequestsCount: 0,
      isRunPending: false,
      overview: { features: [], projects: [] } as DemoOverview,
      projects: [] as Array<DemoProject>,
      runError: '',
      runRequestSequence: 0,
      runs: [] as Array<DemoRun>,
    }),
  }),
  import.meta.webpackHot,
);
