async function execInSsrOrAbort<T>(
  runOperation: () => Promise<T>,
  ssrAbortSignal: AbortSignal,
) {
  ssrAbortSignal.throwIfAborted();
  const operationResult = await runOperation();
  ssrAbortSignal.throwIfAborted();
  return operationResult;
}

export { execInSsrOrAbort };
