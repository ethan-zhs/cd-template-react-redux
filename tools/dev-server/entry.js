'use strict';
import os from 'os'
import fs from 'fs'
import http from 'http'
import https from 'https'
import webpack from 'webpack'
import path from 'path'
import yargs from 'yargs'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import Koa from 'koa'
import e2k from 'express-to-koa'
// import serve from 'koa-static'
import serve from './middleware/koa-static-serve'
import send from 'koa-send'
import Router from 'koa-router'
import compress from 'koa-compress'
import koaBodyParser from 'koa-bodyparser'

import fsStatAsync from './utils/fs-stat-async'
import fsReadDirAsync from './utils/fs-read-dir-async'
import shellJsExec from './utils/shelljs-exec-async'

import middlewareMockBackendApi from './middleware/mock-backend-api'
import log from 'fancy-log'

const privateKey = fs.readFileSync(path.join(__dirname, './credentials/private.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, './credentials/file.crt'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

const cwd = process.cwd();
const argv = yargs
  .alias('port', 'p')
  .default('port', 9091)
  .alias('sslPort', 'ssl-port')
  .boolean('run-webpack-dll')
  .array('mock-fixtures')
  .default('mock-fixtures', [])
  .argv;

const middlewareNoop = async (_, next) => await next();

function getLocalHostIP() {
  const ifaces = os.networkInterfaces();

  const { address } = Object.keys(ifaces).reduce(function (flatten, dev) {
    return [...flatten, ...ifaces[dev]];
  }, []).find(details => {
    return details.family === 'IPv4' && !details.internal;
  });

  return address || "127.0.0.1";
}

;(async _ => {

  process.env.LOCALHOST_IP = getLocalHostIP();

  const pathDirWebpackDll = path.join(cwd, './dll');

  const statDirWebpackDll = await fsStatAsync(pathDirWebpackDll).catch(_ => null);

  let shouldRunWebpackTaskDll = !!argv['runWebpackDll'];

  if ( !shouldRunWebpackTaskDll ) {
    if ( !statDirWebpackDll || !statDirWebpackDll.isDirectory() ) {
      shouldRunWebpackTaskDll = true;
    } else {
      const filesInDirWebpackDll = await fsReadDirAsync(pathDirWebpackDll);
      if ( filesInDirWebpackDll.length === 0 ) shouldRunWebpackTaskDll = true;
    }
  }

  if ( shouldRunWebpackTaskDll ) {
    await shellJsExec('npm run dll');
  }

  const config = require('../../build/webpack.config');

  const app = new Koa();
  const compiler = webpack(config);

  app.use(compress({ threshold: 0 }));
  app.use(e2k(webpackDevMiddleware(
    compiler,
    {
      noInfo: true,
      publicPath: config.output.publicPath,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  )));
  app.use(e2k(webpackHotMiddleware(compiler)));

  app.use(koaBodyParser());

  app.use(Number(process.env.MOCKING_ENABLE) === 1 ? middlewareMockBackendApi({
    apiScope: '-mock-backend-api-',
    mockFixtureDefaultConfig: 'tests/fixtures-mock-backend-api/_default/_config.json',
    mockFixturePaths: [
      'tests/fixtures-mock-backend-api/_default',
      ...argv.mockFixtures
    ].map(p => path.join(cwd, p))
  }) : middlewareNoop);

  const router = new Router();

  router
    .get('/lib/*', serve('./src', { shouldThrow404: true }))
    .get('/statics/*', serve('./src/assets/statics', { shouldThrow404: true }))
    .get('/icons/*', serve('./src/assets/statics', { shouldThrow404: true }))
    .get('/dll/*', serve('./', { shouldThrow404: true }))
    .get('/pwacompat.min.js', serve('./src/assets/pwa/pwacompat', { shouldThrow404: true }))
    .get('/manifest.json', serve('./src', { shouldThrow404: true }))
    .get('/service-worker.js', serve('./src', { shouldThrow404: true }))
    .get('/*', async (ctx, next) => await send(ctx, './src/index.html'));

  app.use(router.routes()).use(router.allowedMethods());

  const PORT = argv.port;
  const PORT_SSL = argv.sslPort;
  const httpServer = http.createServer(app.callback());
  httpServer.listen(PORT, _ => {
    log('HTTP Server is running on: http://localhost:%s', PORT);
  });
  if (PORT_SSL) {
    const httpsServer = https.createServer(credentials, app.callback());
    httpsServer.listen(PORT_SSL, _ => {
      log('HTTPS Server is running on: https://localhost:%s', PORT_SSL);
    });
  }
})();
