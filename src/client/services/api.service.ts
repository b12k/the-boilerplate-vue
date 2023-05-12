export const api = () =>
  setTimeout(() => {
    throw new Error('API error');
  }, 3000);
