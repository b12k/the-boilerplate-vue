import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';

const purgeCss = new PurgeCSS();

export const getCriticalCss = async (html: string, cssFiles: Array<string>) => {
  const cssChunks = await Promise.all(
    cssFiles.map((filePath) =>
      readFile(path.join(__dirname, '../..', filePath), 'utf8'),
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
};
