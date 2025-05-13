export const deserialize = <T>(serializedJs: string): T =>
  eval(`(${serializedJs})`) as T;
