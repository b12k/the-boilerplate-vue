import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PurgeCSS } from 'purgecss';

const purgeCss = new PurgeCSS();

export const getCriticalCss = async (html: string, cssFiles: Array<string>) => {
  const cssChunks = await Promise.all(
    cssFiles.map((path) => readFile(join(__dirname, '../..', path), 'utf8')),
  );

  const result = await purgeCss.purge({
    css: [
      {
        raw: cssChunks.join(''),
      },
    ],
    content: [
      {
        raw: `<html><head></head><body><div id="app">${html}</div></body></html>`,
        extension: 'html',
      },
    ],
    fontFace: true,
  });

  return result.map(({ css: criticalCss }) => criticalCss).join('');
};
