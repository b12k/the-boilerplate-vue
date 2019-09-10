import PurgeCss from 'purgecss';

import { resolvePath } from '../helpers';

export default class CriticalCss {
  constructor(vueJsClientManifest) {
    this.css = vueJsClientManifest
      .all
      .filter((asset) => asset.match(/^.*\.css$/))
      .reverse()
      .map((asset) => resolvePath('dist/public', asset));
  }

  extract(html) {
    return new Promise((resolve, reject) => {
      try {
        const purgeCss = new PurgeCss({
          css: this.css,
          content: [{
            raw: html,
            extension: 'html',
          }],
        });
        const criticalCss = purgeCss
          .purge()
          .reduce((acc, { css }) => acc + css, '');
        resolve(criticalCss);
      } catch (e) {
        reject(e);
      }
    });
  }

  async inject(html, styles) {
    return html.replace('<!--critical-css-->', styles || await this.extract(html));
  }
}
