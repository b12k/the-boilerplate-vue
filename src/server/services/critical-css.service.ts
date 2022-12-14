import { PurgeCSS } from 'purgecss';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const purgeCss = new PurgeCSS();

export const getCriticalCss = async (html: string, cssFiles: Array<string>) => {
  const css = await Promise.all(
    cssFiles.map((path) =>
      readFile(join(__dirname, '../..', path), 'utf8').then((raw) => ({
        raw,
      })),
    ),
  );

  const result = await purgeCss.purge({
    css,
    content: [
      {
        raw: `<html><head></head><body><div id="app">${html}</div></body></html>>`,
        extension: 'html',
      },
    ],
    fontFace: true,
  });

  return result.map(({ css: criticalCss }) => criticalCss);
};
