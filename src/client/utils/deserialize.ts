export const deserialize = <T>(serializedJs: string): T =>
  // eslint-disable-next-line no-eval
  eval(`(${serializedJs})`) as T;
