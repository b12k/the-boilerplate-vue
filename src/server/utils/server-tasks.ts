const serverReadiness = { isDraining: false, isReady: false };
const pendingTasks = new Set<Promise<unknown>>();

function trackServerTask<T>(task: Promise<T>) {
  const trackedTask: Promise<T> = task.finally(() => {
    pendingTasks.delete(trackedTask);
  });
  pendingTasks.add(trackedTask);
  return trackedTask;
}

async function waitForServerTasks() {
  while (pendingTasks.size > 0) {
    // Tasks can register pending cleanup before they finish.
    // oxlint-disable-next-line no-await-in-loop
    await Promise.allSettled(pendingTasks);
  }
}

export { serverReadiness, trackServerTask, waitForServerTasks };
