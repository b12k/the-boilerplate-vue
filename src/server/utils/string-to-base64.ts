export const stringToBase64 = (value: string) =>
  Buffer.from(value, 'utf8').toBase64({
    alphabet: 'base64url',
    omitPadding: true,
  });
