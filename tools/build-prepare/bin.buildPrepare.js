'use strict';
const fs = require('fs');
const os = require('os');
const exec = require('child_process').exec;
const stat = fs.statSync('./package.json');
const diff = parseInt((+new Date() - (+stat.mtime)) / 1000 / 60 / 60 / 24, 10);
const log = require('fancy-log');
const yargs = require('yargs');
const rimraf = require('rimraf')

log('平台信息:', os.platform(), 'node版本:', process.version, '更改时间:',stat.mtime);

const argv = yargs.default('r', null).boolean('f').argv;

const pathnameCachePackageJson = './build/cache-package.json';

;(function () {
    const isExistCachePackageJson = fs.existsSync(pathnameCachePackageJson);
    const currentPackageJson = fs.readFileSync('./package.json');
    let isUpdatedPackageJson = true;
    if (isExistCachePackageJson) {
        const lastPackageJson = fs.readFileSync(pathnameCachePackageJson);
        isUpdatedPackageJson = currentPackageJson.toString() !== lastPackageJson.toString();
    }
    isUpdatedPackageJson && fs.writeFileSync(pathnameCachePackageJson, currentPackageJson);
    const isExistNodeModules = fs.existsSync('./node_modules');

    log('isExistCachePackageJson', isExistCachePackageJson);
    log('node_modules是否存在?', isExistNodeModules);
    log('package.json是否更新?', isUpdatedPackageJson);

    if (isExistNodeModules && !isUpdatedPackageJson && !argv.f) {
        log('不需要重新npm install');
        return;
    }

    if (argv.f) {
        log('rimraf ./node_modules');
        rimraf.sync('./node_modules');
    }

    const execNpmInstall = typeof argv.r === 'string' ? `npm install --registry=${argv.r}` : 'npm install';
    log(`${execNpmInstall} ...`);
    exec(execNpmInstall, function(err,stdout,stderr) {
        if (err) { console.error('error', err) }
        log('stdout', stdout);
        log('stderr', stderr);
    });
})();

