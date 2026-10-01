import { env } from '@server/env';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';

const purgeCss = new PurgeCSS();

async function getCriticalCss(html: string, cssFiles: Array<string>) {
  const cssChunks = await Promise.all(
    cssFiles.map((filePath) =>
      readFile(path.join(env.ASSETS_LOCATION_PATH, filePath), 'utf8'),
    ),
  );

  const result = await purgeCss.purge({
    content: [
      {
        extension: 'html',
        raw: `<html><head></head><body><div id="app">${html}</div></body></html>`,
      },
    ],
    css: [
      {
        raw: cssChunks.join(''),
      },
    ],
    fontFace: true,
  });

  return result.map(({ css: criticalCss }) => criticalCss).join('');
}

export { getCriticalCss };
