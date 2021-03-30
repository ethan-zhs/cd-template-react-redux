const R = require('ramda');
const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const base = require('./webpack.base.config');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const { GenerateSW } = require('workbox-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const cdnConfig = require('./config.cdn.json');
const { HTML_DIST } =  require('./config.constants.js');

const testSplitChunkCharts = (module) => {
    return /echarts|zrender|chart\.js|chartjs|d3|wordcloud/.test(module.context);
}

const testSplitChunkVideojs = (module) => {
    return /videojs|video\.js|m3u8/.test(module.context) ||
        /src\/assets\/vendor\/video/.test(module.context)
}

const testSplitChunkContainerHomePc = (module) => {
    return /src\/containers\/Home/.test(module.context);
}

const testSplitChunkAntdCommon = (module) => {
    return [
        /@ant-design\/icons/,
        /antd\/lib\//,
        /node_modules\/rc-/
    ].some(regexp => regexp.test(module.context))
}

const config = merge(base.baseConfig, {
    mode: 'production',
    entry: {
        main: path.join(__dirname, '../src/index.js')
    },
    output: {
        path: path.join(__dirname, '../dist/cdn/'),
        filename: '[name]_[chunkhash:8].js',
        publicPath: process.env.ENABLE_BUNDLE_ANALYZ ?
            `http://localhost:5000/cdn/` :
            `https://domain/sitecdn/${cdnConfig.key}/`
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new HtmlWebpackPlugin({
            template: path.join(
                __dirname,
                '../src/assets/template/index.template.html'
            ),
            inject: true,
            chunksSortMode: 'none',
            filename: HTML_DIST, // path.join(__dirname, '../dist/project/index.html'),
            // ...process.env.ENABLE_BUNDLE_ANALYZ && {
            //     filename: path.join(__dirname, '../dist/index.html'),
            // },
            minify: true
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new CopyWebpackPlugin(
            [
                {
                    from: path.join(__dirname, '../src/manifest.json'),
                    to: path.join(__dirname, '../dist/project')
                }
            ],
            {
                ignore: ['*.DS_Store']
            }
        ),
        ...(function () {
            const extendPlugins = []
            if (process.env.ENABLE_BUNDLE_ANALYZ) {
                extendPlugins.push(new BundleAnalyzerPlugin())
            }
            return extendPlugins
        }())
    ],
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        splitChunks: {
            cacheGroups: {
                node_modules_extar: {
                    name: 'vendor_charts',
                    test: testSplitChunkCharts,
                    chunks: 'all',
                    enforce: true
                },
                videojs: {
                    name: 'vendor_videojs',
                    test: testSplitChunkVideojs,
                    chunks: 'all',
                    enforce: true
                },
                antd_1: {
                    name: 'vendor_antd_1',
                    test: testSplitChunkAntdCommon,
                    chunks: 'all',
                    enforce: true
                },
                node_modules: {
                    name: 'vendor',
                    test: (module) => {
                        if (testSplitChunkCharts(module) ||
                            testSplitChunkVideojs(module) ||
                            testSplitChunkAntdCommon(module)
                        ) {
                            return false;
                        }
                        return /node_modules/.test(module.context);
                    },
                    chunks: 'all',
                    enforce: true
                },
                home_pc: {
                    name: 'home_pc',
                    test: testSplitChunkContainerHomePc,
                    chunks: 'all',
                    enforce: true
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                parallel: false,
                terserOptions: {
                    extractComments: 'all',
                    compress: {
                        drop_console: true,
                    },
                }
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    }
});

module.exports = config;
