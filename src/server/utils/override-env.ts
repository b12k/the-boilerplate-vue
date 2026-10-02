function overrideEnv<T extends object>(
  env: T,
  overrides: Readonly<Partial<T>>,
) {
  return {
    ...env,
    ...overrides,
    IS_OVERRIDDEN: true,
  };
}

export { overrideEnv };
