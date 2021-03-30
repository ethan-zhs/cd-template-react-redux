// http://eslint.org/docs/user-guide/configuring

module.exports = {
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    env: {
        browser: true
    },
    globals: {
        OSS: true, // => false 代表不允许重写
        plupload: true,
        MODE: true,
        ComposeOss: true // => upload 上传
    },
    plugins: ['react'],
    extends: ['airbnb-base', 'plugin:import/warnings'],
    // => @ 暂时注释 import 插件
    // settings: {
    //     'import/resolver': {
    //         webpack: {
    //             config: [
    //                 'build/webpack.dll.conf.js',
    //                 'build/webpack.base.conf.js',
    //                 'build/webpack.dev.conf.js',
    //                 'build/webpack.prod.conf.js'
    //             ]
    //         }
    //     }
    // },
    rules: {
        // => @ 暂时屏蔽 import 重复导入模块规则
        'import/no-duplicates': [0],
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'func-names': [0],
        'no-console': [0],
        'no-bitwise': [0],
        'consistent-return': ['off'],
        eqeqeq: [0],
        'object-shorthand': [0],
        'prefer-arrow-callback': [1],
        'import/no-unresolved': [0],
        'import/no-extraneous-dependencies': [0],
        // 'no-unused-vars': Number(process.env.ESLINT_NO_CHECK_UNUSED_VARS) === 1 ?
        //     [0] : ['warn', { args: 'none' }],
        'no-unused-vars': [0],
        'no-param-reassign': [0],
        'max-len': [0, 150],
        'import/first': [0],
        'global-require': [0],
        'arrow-parens': [0, 'as-needed'],
        'no-use-before-define': [1],
        'no-multi-assign': [0],
        // 'no-unused-expressions': ['error', { allowShortCircuit: true }],
        'no-underscore-dangle': [0],
        'linebreak-style': [0, 'windows'],
        'object-curly-newline': ['off'],
        indent: [
            'error',
            4,
            { SwitchCase: 1, ignoredNodes: ['ConditionalExpression'] }
        ],
        'space-before-function-paren': [0],
        'no-trailing-spaces': [0],
        'comma-dangle': ['error', 'only-multiline'],
        'comma-spacing': ['error', { before: false, after: true }],
        'prefer-template': [0],
        semi: ['warn', 'always'], //语句强制用分号结尾
        'import/no-dynamic-require': [1],
        'function-paren-newline': [0],
        'no-nested-ternary': [0],
        'prefer-promise-reject-errors': [0],
        'no-var': [1],
        'no-void': [0], // 应该使用 void 0 代替 undefined, 因为 undefined 有可能在外部环境中被覆盖
        'no-undefined': [1],
        'no-mixed-operators': [0],
        radix: [1],
        // don't require .vue extension when importing
        'import/extensions': [
            0,
            'always',
            {
                js: 'never',
                vue: 'never'
            }
        ],
        'class-methods-use-this': [0],
        'import/prefer-default-export': [0],
        quotes: [1, 'single'], //引号类型 `` "" ''
        // allow debugger during development
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        // allow empty during development
        'arrow-body-style': [0],// [1],
        'no-empty': [1],
        'prefer-const': [1],
        // allow some shadow
        'no-shadow': [2, { "allow": [
            "_",
            "resolve",
            "reject",
            "done",
            "callback",
            "fn",
            "item",
            "child",
            "entry.js",
            "self",
            "props", // for react props by pass
            "found",
            "result",
            "key",
            "value"
        ]}],
        'import/no-named-as-default-member': [0],
        'padded-blocks': [1],
        'no-empty-function': [1],
        'array-bracket-spacing': [0],
        'dot-notation': [0],
        'camelcase': [0],
        'spaced-comment': [0],
        'no-unused-expressions': [0],
        'no-restricted-syntax': [0]
    }
};
