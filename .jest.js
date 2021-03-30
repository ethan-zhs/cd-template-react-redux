module.exports = {
    setupFiles: [
        './tests/setup.js',
    ],
    testRegex: '.*\\.test\\.js$',
    collectCoverageFrom: [
        'src/components/*/*.{js,jsx}',
        '!src/components/*/__tests__/*.js',
    ],
    moduleNameMapper: {
        ".*\\.(css|less|styl|scss|sass)$": "identity-obj-proxy",
        ".*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/tests/__mocks__/image.js"
    },
    snapshotSerializers: [
        'enzyme-to-json/serializer'
    ],
}
