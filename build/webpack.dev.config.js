const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const base = require('./webpack.base.config');

const FreiendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const config = merge(base.baseConfig, {
    mode: 'development',
    entry: {
        main: [
            'react-hot-loader/patch',
            'webpack-hot-middleware/client?quiet=true&hot=true&reload=true',
            path.join(__dirname, '../src/index.js')
        ]
    },
    output: {
        path: path.join(__dirname, '../dist'),
        chunkFilename: 'chunks/[name].chunk.js', // 按需加载配置
        filename: '[name].js',
        publicPath: '/',
        pathinfo: true
    },
    devtool: 'inline-source-map',
    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom',
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.LOCALHOST_IP': `"${process.env.LOCALHOST_IP}"`,
            'process.env.MOCKING_ENABLE':
                !!(Number(process.env.MOCKING_ENABLE) === 1)
        }),
        new FreiendlyErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('../dll/vendor-manifest.json')
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
});

module.exports = config;
