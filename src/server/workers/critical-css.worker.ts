import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';

export interface CriticalCssTask {
  assetsPath: string;
  cssFiles: Array<string>;
  html: string;
}

export async function extractCriticalCss({
  assetsPath,
  cssFiles,
  html,
}: CriticalCssTask) {
  const cssChunks = await Promise.all(
    cssFiles.map((filePath) =>
      readFile(path.join(assetsPath, filePath), 'utf8'),
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
  return result.map(({ css: criticalCss }) => criticalCss).join('');
}
