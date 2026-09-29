export const overrideEnv = <T extends object>(
  environment: T,
  overrides: Partial<T>,
): T => {
  return {
    ...environment,
    ...overrides,
    IS_OVERRIDDEN: 'true',
  };
};
