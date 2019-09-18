import PurgeCss from 'purgecss';
import { isNil } from 'lodash';

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
    if (!this.css.length) return '';

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
    const stylesToInject = isNil(styles) ? await this.extract(html) : styles;
    return html.replace('<!--critical-css-->', stylesToInject);
  }
}
