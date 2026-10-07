import { env } from '@server/env';
import { withTimeout } from 'es-toolkit/promise';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';

const MS_PER_SEC = 1000;

export async function getCriticalCss(html: string, cssFiles: Array<string>) {
  const budgetMs = env.CACHE_CRITICAL_CSS_BUDGET_SEC * MS_PER_SEC;
  const expiresBefore = performance.now() + budgetMs;
  const controller = new AbortController();
  try {
    const css = await withTimeout(
      async () => {
        const cssChunks = await Promise.all(
          cssFiles.map((filePath) =>
            readFile(path.join(env.ASSETS_LOCATION_PATH, filePath), {
              encoding: 'utf8',
              signal: controller.signal,
            }),
          ),
        );

        const result = await new PurgeCSS().purge({
          content: [
            {
              extension: 'html',
              raw: `<html><head></head><body><div id="app">${html}</div></body></html>`,
            },
          ],
          css: [{ raw: cssChunks.join('') }],
          fontFace: true,
        });

        // Synchronous extraction can block the timeout callback.
        if (performance.now() >= expiresBefore) {
          throw new Error('Critical CSS extraction exceeded its time budget');
        }

        return result.map(({ css: criticalCss }) => criticalCss).join('');
      },
      budgetMs,
      { signal: controller.signal },
    );
    return css;
  } finally {
    controller.abort();
  }
}
