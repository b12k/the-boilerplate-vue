export const overrideEnv = <T extends object>(
  environment: T,
  overrides: Partial<T>,
): T => ({
  ...environment,
  ...overrides,
  IS_OVERRIDDEN: 'true',
});
