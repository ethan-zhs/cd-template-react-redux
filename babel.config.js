module.exports = function (api) {
    api.cache.never();
    return {
        presets: [
            [
                '@babel/env',
                {
                    modules: false,
                    useBuiltIns: 'usage',
                    corejs: '3.x',
                    targets: {
                        ie: '11',
                        chrome: '58',
                        browsers: 'cover 99.5%'
                    },
                }
            ],
            '@babel/react'
        ],
        plugins: [
            'ramda', // => @TAIL webpack tree shaking 应该能自动抖掉不需要的 ramda 函数
            'react-hot-loader/babel',
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            '@babel/plugin-syntax-dynamic-import',
            [
                'import',
                {
                    libraryName: 'antd',
                    style: true
                },
                'antd'
            ],
            [
                'import',
                {
                    libraryName: 'antd-mobile',
                    style: true
                },
                'antd-mobile'
            ],
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-transform-modules-commonjs'
        ],
        env: {
            test: {
                // => 可选的 test plugin
                plugins: ['@babel/plugin-transform-modules-commonjs']
            }
        }
    };
};
