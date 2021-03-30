"use strict";
const path = require('path');

exports.HTML_DIST = path.join(__dirname, '../dist/project/index.html')

if (process.env.ENABLE_BUNDLE_ANALYZ) {
    exports.HTML_DIST = path.join(__dirname, '../dist/index.html')
}
