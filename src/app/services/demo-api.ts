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

const projects: Array<DemoProject> = [
  {
    category: 'Public product',
    description: 'A product catalogue with fast first pages and shared state.',
    features: ['Server rendering', 'Route prefetch', 'Typed stores'],
    id: 'atlas',
    name: 'Atlas',
    status: 'Ready to explore',
  },
  {
    category: 'Engineering workspace',
    description: 'A workspace that keeps its state as you move between views.',
    features: ['Client navigation', 'Service injection', 'Reactive state'],
    id: 'relay',
    name: 'Relay',
    status: 'Ready to explore',
  },
  {
    category: 'Content platform',
    description: 'A public site with route metadata and language-aware URLs.',
    features: ['Unhead metadata', 'Language context', 'Lazy routes'],
    id: 'folio',
    name: 'Folio',
    status: 'Ready to explore',
  },
];

const demoOverview: DemoOverview = {
  features: [
    {
      description: 'Render useful content before the browser runs JavaScript.',
      name: 'Server rendering',
      number: '01',
    },
    {
      description: 'Load route data, write it to Pinia, then render the page.',
      name: 'Data before paint',
      number: '02',
    },
    {
      description: 'Hydrate the same state and keep it during navigation.',
      name: 'One state model',
      number: '03',
    },
    {
      description: 'Use typed services in stores, on the server and client.',
      name: 'Small, clear layers',
      number: '04',
    },
  ],
  projects,
};

const demoArchitecture: DemoArchitecture = {
  layers: [
    {
      description: 'A lazy page declares the data it needs through fetchData.',
      file: 'pages/*.vue',
      name: 'Route',
    },
    {
      description: 'The route loader calls an action on its scoped store.',
      file: 'router/exec-route-pre-fetch.ts',
      name: 'Prefetch',
    },
    {
      description:
        'An injected service returns a typed response. This demo uses mock data.',
      file: 'services/api.service.ts',
      name: 'API',
    },
    {
      description: 'Pinia holds the response. Components read reactive state.',
      file: 'store/stores/*.store.ts',
      name: 'Store',
    },
    {
      description:
        'SSR renders that state. The browser hydrates it and takes over.',
      file: 'server.entry.ts → browser.entry.ts',
      name: 'Render',
    },
  ],
  principles: [
    {
      description:
        'Keep the request path and application layers easy to follow.',
      name: 'KISS',
    },
    {
      description:
        'Use the same services and stores for SSR and client navigation.',
      name: 'DRY',
    },
    {
      description: 'Add abstractions when the product needs them.',
      name: 'YAGNI',
    },
  ],
};

export {
  demoArchitecture,
  type DemoArchitecture,
  demoOverview,
  type DemoOverview,
  type DemoProject,
  type DemoRun,
};
