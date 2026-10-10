interface ApiErrorResponse {
  message: string;
}

interface DemoArchitecture {
  layers: Array<{ description: string; file: string; name: string }>;
  principles: Array<{ description: string; name: string }>;
}

interface DemoOverview {
  features: Array<{ description: string; name: string; number: string }>;
  projects: Array<DemoProject>;
}

interface DemoProject {
  category: string;
  description: string;
  features: Array<string>;
  id: string;
  name: string;
  status: string;
}

interface DemoRun {
  delayMs: number;
  sequence: number;
  steps: Array<string>;
}

export {
  type ApiErrorResponse,
  type DemoArchitecture,
  type DemoOverview,
  type DemoProject,
  type DemoRun,
};
