const ExtractCssPlugin = require('mini-css-extract-plugin');
const EslintFriendlyFormatter = require('eslint-friendly-formatter');

const {
  resolvePath,
  IS_PROD_MODE,
} = require('./helpers');

module.exports = {
  eslintLoader: () => ({
    test: /\.(js|vue)$/,
    enforce: 'pre',
    exclude: resolvePath('node_modules'),
    loader: 'eslint-loader',
    options: {
      formatter: EslintFriendlyFormatter,
    },
  }),
  jsLoader: () => ({
    test: /\.js$/,
    include: resolvePath('src'),
    use: 'babel-loader',
  }),
  vueLoader: (IS_SSR = false) => {
    const config = {
      test: /\.vue$/,
      loader: 'vue-loader',
    };
    if (!IS_SSR) {
      config.options = {
        extractCSS: IS_PROD_MODE,
        cssSourceMap: IS_PROD_MODE,
      };
    }
    return config;
  },
  styleLoader: () => ({
    test: /\.s?css$/,
    use: [
      IS_PROD_MODE ? ExtractCssPlugin.loader : 'vue-style-loader',
      {
        loader: 'css-loader',
        options: {
          sourceMap: IS_PROD_MODE,
          // modules: true,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: IS_PROD_MODE,
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: IS_PROD_MODE,
        },
      },
    ],
  }),
  iconLoader: () => ({
    test: /\.svg?$/,
    include: resolvePath('src/client/assets/icons'),
    use: [
      'vue-loader',
      {
        loader: 'svg-to-vue-component/loader',
        options: {
          svgoConfig: {
            plugins: [
              {
                cleanupIDs: false,
              },
              {
                prefixIds: false,
              },
            ],
          },
        },
      },
    ],
  }),
  imageLoader: (IS_SSR = false) => ({
    test: /\.(gif|png|jpe?g|svg)?$/,
    exclude: resolvePath('src/client/assets/icons'),
    use: [
      {
        loader: 'url-loader',
        options: {
          fallback: IS_SSR ? 'ignore-loader' : 'file-loader',
          limit: 2048,
          name: 'img/[ext]/[name].[ext]',
        },
      },
    ],
  }),
  ignoreLoader: () => ({
    test: /\.(?!(js|vue|gif|png|jpe?g|svg))[a-zA-Z0-9]{1,4}$/,
    loader: 'ignore-loader',
  }),
};
