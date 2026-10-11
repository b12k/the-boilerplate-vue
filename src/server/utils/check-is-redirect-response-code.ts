const REDIRECT_RESPONSE_CODES = {
  FOUND: 302,
  MOVED_PERMANENTLY: 301,
  PERMANENT_REDIRECT: 308,
  SEE_OTHER: 303,
  TEMPORARY_REDIRECT: 307,
} as const;
const redirectResponseCodes = new Set<number>(
  Object.values(REDIRECT_RESPONSE_CODES),
);

function checkIsRedirectResponseCode(
  responseCode: number | undefined,
): responseCode is number {
  return responseCode !== undefined && redirectResponseCodes.has(responseCode);
}

export { checkIsRedirectResponseCode };
