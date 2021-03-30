const { isProd } = require('./webpack.utils');

module.exports = isProd
    ? require('./webpack.prod.config')
    : require('./webpack.dev.config');
