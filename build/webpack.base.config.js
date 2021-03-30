const webpack = require('webpack');
const path = require('path');

const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const { isProd } = require('./webpack.utils');

const baseCSSLoader = [
    {
        loader: 'css-loader',
        options: {
            modules: true,
            localIdentName: '[name]__[local]-[hash:base64:5]',
            sourceMap: !!isProd
        }
    },
    {
        loader: 'postcss-loader',
        options: {
            plugins: loader => [
                autoprefixer({
                    browsers: isProd
                        ? ['last 3 versions', 'iOS 9']
                        : ['last 3 versions']
                })
            ]
        }
    }
];
const baseNotCSSModuleLoader = [
    {
        loader: 'css-loader',
        options: {
            sourceMap: !!isProd
        }
    },
    {
        loader: 'postcss-loader',
        options: {
            plugins: loader => [
                autoprefixer({
                    browsers: isProd
                        ? ['last 3 versions', 'iOS 9']
                        : ['last 3 versions']
                })
            ]
        }
    }
];

const stableModules = [
    {
        // url-loader (html)
        test: /\.(html)$/,
        loader: 'url-loader',
        exclude: isProd ? /template/ : undefined,
        options: {
            limit: 1,
            name: '[name][hash:8].[ext]',
            outputPath: '/html/',
            publicPath: '/html/'
        }
    },
    {
        // less-loader
        test: /\.less$/,
        use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            ...baseCSSLoader,
            { loader: 'less-loader', options: { javascriptEnabled: true } }
        ],
        include: [
            path.join(__dirname, '../src'),
        ],
    },
    {
        // less-loader (antd)
        test: /\.less$/,
        use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            ...baseNotCSSModuleLoader,
            {
                loader: 'less-loader',
                options: {
                    modifyVars: require('../src/assets/css/antd_modifyvars.js'),
                    javascriptEnabled: true
                }
            }
        ],
        include: path.join(__dirname, '../node_modules/antd')
    },
    {
        // css-loader
        test: /\.(css)$/,
        use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            ...baseNotCSSModuleLoader,
            'sass-loader'
        ],
        exclude: path.join(__dirname, '../node_modules')
    },
    {
        // sass-loader (cropperjs)
        test: /\.(scss)$/,
        use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            ...baseNotCSSModuleLoader,
            'sass-loader'
        ],
        include: path.join(__dirname, '../node_modules/cropperjs')
    }
];

const baseConfig = {
    output: {
        path: path.join(__dirname, '../dist'),
        publicPath: '/dist/',
        filename: '[name].[chunkhash:8].js',
        chunkFilename: 'chunks/[name]_[chunkhash:8].chunk.js',
        sourceMapFilename: 'sourceMaps/[name]_[chunkhash:8].map'
    },
    resolve: {
        extensions: ['.mjs', '.js', '.jsx', '.less', '.css', '.scss'], // resolve 指定可以被 import 的文件后缀
        alias: {
            '@src': path.join(__dirname, '../src'),
            // '@public': path.join(__dirname, '../src/public/statics'),
            '@components': path.join(__dirname, '../src/components'),
            '@containers': path.join(__dirname, '../src/containers'),
            '@constants': path.join(__dirname, '../src/constants'),
            // '@globalData': path.join(__dirname, '../src/global'),
            '@utils': path.join(__dirname, '../src/utils'),
            '@services': path.join(__dirname, '../src/services'),
            '@assets': path.join(__dirname, '../src/assets'),
            '@models': path.join(__dirname, '../src/models'),
            '@store': path.join(__dirname, '../src/store'),
            '@router': path.join(__dirname, '../src/router'),
        }
    },
    stats: {
        warningsFilter: [
            /mini-css-extract-plugin[^]*Conflicting order between:/
        ]
    },
    module: {
        noParse: /es6-promise\.js$/,
        rules: [
            {
                // file-loader
                exclude: [
                    /\.html$/,
                    /\.(js|jsx|mjs)$/,
                    /\.css$/,
                    /\.less$/,
                    /\.scss$/,
                    /\.json$/,
                    /\.bmp$/,
                    /\.gif$/,
                    /\.jpe?g$/,
                    /\.png$/
                ],
                loader: require.resolve('file-loader'),
                options: {
                    name: isProd
                        ? 'dist/images/[name].[hash:8].[ext]'
                        : 'images/[name].[hash:8].[ext]'
                }
            },
            {
                // eslint-loader
                loader: 'eslint-loader',
                test: /.js$/,
                enforce: 'pre',
                include: [path.join(__dirname, '../src')],
                options: {
                    formatter: require('eslint-friendly-formatter')
                }
            },
            {
                // babel-loader
                test: /\.(jsx|js)$/,
                use: ['babel-loader?cacheDirectory'],
                // exclude: /node_modules/,
                include: [
                    path.join(__dirname, '../src'),
                    path.join(__dirname, '../node_modules/d3-array'),
                    path.join(__dirname, '../node_modules/d3-scale')
                ],
            },
            // {
            //     // babel-loader
            //     test: /\.(jsx|js)$/,
            //     use: ['babel-loader?cacheDirectory'],
            //     exclude: /node_modules/
            // },
            {
                // url-loader (images)
                test: /\.(jpe?g|png|gif)/,
                loader:
                    'url-loader?limit=4000&name=dist/images/[name][hash:8].[ext]'
            },

            {
                // css-loader
                test: /\.css/,
                use: [
                    isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                    ...baseNotCSSModuleLoader
                ],
                include: path.join(__dirname, '../src'),
                exclude: /node_modules/
            },
            {
                // css-loader (quill)
                test: /\.css/,
                use: [
                    isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                    ...baseNotCSSModuleLoader
                ],
                include: [
                    path.join(__dirname, '../node_modules/quill/dist')
                ]
            },
            ...stableModules
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.DISABLE_REDUX_LOGGER': !!(Number(process.env.DISABLE_REDUX_LOGGER) === 1),
        }),
        new CaseSensitivePathsPlugin(),
        new MiniCssExtractPlugin({
            filename: 'styles/style.[contenthash:8].css'
        })
    ]
};

module.exports = {
    resolve: baseConfig.resolve,
    baseConfig,
    baseNotCSSModuleLoader,
    baseCSSLoader,
    stableModules
};
