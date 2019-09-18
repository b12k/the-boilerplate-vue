import { minify } from 'html-minifier';

const config = {
  collapseInlineTagWhitespace: true,
  minifyCSS: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeEmptyElements: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeTagWhitespace: true,
  sortAttributes: true,
  sortClassName: true,
};

export default (html) => new Promise((resolve, reject) => {
  try {
    resolve(minify(html, config));
  } catch (e) {
    reject(e);
  }
});
