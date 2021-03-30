const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        vendor: [
            '@babel/polyfill',
            'ramda',
            'react',
            'react-dom',
            'redux',
            'react-redux',
            'react-router-dom',
            'redux-saga',
            'immutable',
            'redux-immutable',
            'antd',
            'crypto-js',
            'reselect',
            'react-router-redux'
        ]
    },
    output: {
        path: path.join(__dirname, '../dll'),
        filename: '[name].dll.js',
        library: '[name]_library'
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, '../dll', '[name]-manifest.json'),
            name: '[name]_library'
        })
    ]
};
