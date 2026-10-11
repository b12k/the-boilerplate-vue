import type { ExtractorResultDetailed } from 'purgecss';

import { Parser } from 'htmlparser2';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'postcss';
import { PurgeCSS } from 'purgecss';

interface CriticalCssTask {
  assetsPath: string;
  cssFiles: Array<string>;
  html: string;
}

function extractHtmlSelectors(html: string): ExtractorResultDetailed {
  const selectors: ExtractorResultDetailed = {
    attributes: { names: [], values: [] },
    classes: [],
    ids: [],
    tags: [],
    undetermined: [],
  };

  new Parser(
    {
      onattribute(attributeName, attributeValue) {
        const normalizedAttributeName = attributeName.toLowerCase();
        selectors.attributes.names.push(attributeName, normalizedAttributeName);
        selectors.attributes.values.push(attributeValue);
        if (normalizedAttributeName === 'class') {
          selectors.classes.push(
            ...attributeValue.split(/[ \t\r\n\f]+/u).filter(Boolean),
          );
        }
        if (normalizedAttributeName === 'id') {
          selectors.ids.push(attributeValue);
        }
      },
      onopentagname(tagName) {
        selectors.tags.push(tagName, tagName.toLowerCase());
      },
    },
    {
      decodeEntities: true,
      lowerCaseAttributeNames: false,
      lowerCaseTags: false,
    },
  ).end(html);

  return selectors;
}

async function extractCriticalCss({
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
    extractors: [{ extensions: ['html'], extractor: extractHtmlSelectors }],
    fontFace: true,
  });
  const criticalCssRoot = parse(purgeResults.map(({ css }) => css).join(''));
  criticalCssRoot.walkComments((comment) => {
    comment.remove();
  });
  return criticalCssRoot.toString();
}

export { type CriticalCssTask, extractCriticalCss };
