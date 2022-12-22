export const stringToBase64 = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64url');
