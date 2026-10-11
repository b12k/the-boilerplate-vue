import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'postcss';
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
  const purgeResults = await new PurgeCSS().purge({
    content: [
      {
        extension: 'html',
        raw: `<html><head></head><body><div id="app">${html}</div></body></html>`,
      },
    ],
    css: [{ raw: cssChunks.join('') }],
    fontFace: true,
  });
  const criticalCssRoot = parse(purgeResults.map(({ css }) => css).join(''));
  criticalCssRoot.walkComments((comment) => {
    comment.remove();
  });
  return criticalCssRoot.toString();
}
