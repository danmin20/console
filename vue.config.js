/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpackBundleAnalyzer = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const postcssConfig = require('./postcss.config');


/** ********************************************
 *     Set additional environment variables    *
 * ******************************************* */
process.env.VUE_APP_VERSION = require('./package.json').version;


/** ********************************************
 *        Set additional webpack plugins       *
 * ******************************************* */
const extraPlugins = [];

if (process.env.NODE_ENV === 'development') {
    // const StylelintPlugin = require('stylelint-webpack-plugin');

    // extraPlugins.push(
    // new StylelintPlugin({
    //     files: ['src/**/*.{vue,scss,pcss}'],
    // }),
    // );
}

if (process.env.VUE_APP_ANALYZE_MOD) {
    const BundleAnalyzerPlugin = webpackBundleAnalyzer.BundleAnalyzerPlugin;
    extraPlugins.push(
        new BundleAnalyzerPlugin(),
    );
}


/** ********************************************
 *              Set Vue CLI config             *
 * ******************************************* */
module.exports = {
    lintOnSave: false,
    runtimeCompiler: true,
    devServer: {
        disableHostCheck: true,
        port: 8080,
    },
    css: {
        loaderOptions: {
            postcss: postcssConfig,
            sass: {
                includePaths: ['./node_modules'],
            },
        },
    },
    configureWebpack: {
        devtool: 'source-map',
        plugins: [
            new CompressionPlugin(),
            ...extraPlugins,
        ],
        // eslint-disable-next-line consistent-return
        externals(context, request, callback) {
            if (/xlsx|canvg|pdfmake/.test(request)) {
                return callback(null, `commonjs ${request}`);
            }
            callback();
        },
        optimization: {
            runtimeChunk: true,
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        chunks: 'initial',
                        name: 'vendor',
                        enforce: true,
                    },
                },
            },
        },
    },
    chainWebpack: (config) => {
        // These are some necessary steps changing the default webpack config of the Vue CLI
        // that need to be changed in order for Typescript based components to generate their
        // declaration (.d.ts) files.
        //
        // Discussed here https://github.com/vuejs/vue-cli/issues/1081
        config.output.chunkFilename('[id].[chunkhash:8].js');
        config.plugins.delete('prefetch');
        if (process.env.NODE_ENV === 'production' && process.env.VUE_APP_BUILD_MOD === 'lib') {
            config.module.rule('ts').uses.delete('cache-loader');

            config.module
                .rule('ts')
                .use('ts-loader')
                .loader('ts-loader')
                .tap((opts) => {
                    opts.transpileOnly = false;
                    opts.happyPackMode = false;
                    opts.configFile = 'tsconfig.build.json';
                    return opts;
                });
        }
    },
    parallel: false,
};
