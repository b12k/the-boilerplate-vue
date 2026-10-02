function overrideEnv<T extends object>(env: T, overrides: Partial<T>) {
  return {
    ...env,
    ...overrides,
    IS_OVERRIDDEN: true,
  };
}

export { overrideEnv };
