'use strict';
import * as R from 'ramda'
// import fs from 'fs'
import queryString from 'querystring'
import path from 'path'
import globby from 'globby'
import minimatch from 'minimatch'
import HttpError from 'http-errors'
import * as tryJSON from '../utils/try-json'
import fsReadFileAsync from '../utils/fs-read-file-async'
import log from 'fancy-log'
import chalk from 'chalk'
import chokidar from 'chokidar'

const logPrefix = chalk.bold.cyan('[mocking service]');

export default ({
    cwd = process.cwd(),
    apiScope = '',
    mockFixtureDefaultConfig,
    mockFixturePaths = []
}) => {
    const defaultConfig = mockFixtureDefaultConfig; //

    let currentMockFixtures = readMockFixturesFrom(mockFixturePaths, {
        prefix: apiScope,
        defaultConfig
    });

    log(`${logPrefix} ${
        chalk.yellow.bold(`mocking is enabled on ${`/${path.join(apiScope, '**')}`}`)
    } ...`);

    log(`${logPrefix} ${
        `watching: \n${mockFixturePaths
    .map(pathPrefix => chalk.gray(`  - ${path.join(path.relative(cwd, pathPrefix), '*.json')}`))
    .join('\n')
    } ...`
    }`);

    const watcher = chokidar.watch(
        mockFixturePaths.map(pathPrefix => path.join(pathPrefix, '*.json')), {
        ignoreInitial: false
    });

    watcher.on('change', (fpath, stats) => {
        log(`${logPrefix} ${`watched change ${chalk.gray(path.relative(cwd, fpath))}`}`)
        log(`${logPrefix} ${'mocking fixtures maybe changed ... loading new fixtures'}`)
        const lastMockFixtures = Promise.resolve(currentMockFixtures);
        currentMockFixtures = readMockFixturesFrom(mockFixturePaths, {
            prefix: apiScope,
            defaultConfig,
            onError: error => {
                log.error(chalk.red(error));
                return lastMockFixtures;
            }
        });
    });

    return async (ctx, next) => {
        const fixtures = await currentMockFixtures;
        const { request } = ctx;
        const { method, url } = request;
        const [ urlPath, /*strQueryString = ''*/ ] = url.split('?');

        if (apiScope) {
            if (!minimatch(urlPath, `/${apiScope}/**`)) {
                return await next();
            }
        }

        const urlPathActual = urlPath.replace(new RegExp(`^\/?${apiScope}`), '');

        const matchedFixture = fixtures.find(fixture => {
            const [ fixtureUrlPath ] = fixture;
            return path.join('/', fixtureUrlPath) === path.join('/', urlPath);
        })

        if (!matchedFixture) {
            if (apiScope) {
                throw new HttpError.NotImplemented(
                    `${method} ${urlPathActual} not implemented`
                );
            } else {
                return await next();
            }
        }

        const [ _, fixtureOptions ] = matchedFixture;

        if (method === 'OPTION') { return responseCorsHeader(ctx); }

        log(logPrefix, method, urlPathActual);

        const { responseSwitches = [] } = fixtureOptions;

        const found = responseSwitches.find(({ conditions }) => {
            if (conditions === null) {
                return true;
            }
            if (typeof conditions === 'boolean') {
                return conditions;
            }
            return conditions.every(([actualPath, compare, check]) => {
                const boo = R.equals(R.path(actualPath, ctx), check);
                if (compare === '===') {
                    return boo
                } else if (compare === '!==') {
                    return !boo
                }
            })
        })

        if (!found) {
            throw new HttpError.NotImplemented(
                `${method} ${urlPathActual} default response not found`
            );
        }

        const { response } = found;

        ctx.response.body = response.responseBody || '';
        ctx.response.status = response.responseStatus || 200;
    }
};

function responseCorsHeader(ctx) {
    ctx.set('Access-Control-Allow-Credentials', true);
    ctx.set('Access-Control-Allow-Headers', 'authorization, content-type, x-name-ca-key, x-name-ca-signature, x-name-ca-timestamp, x-name-user-pk');
    ctx.set('Access-Control-Allow-Methods', 'OPTIONS,HEAD,GET,PUT,POST,DELETE,PATCH');
    ctx.set('Access-Control-Allow-Origin', '*');
}

async function readMockFixturesFrom(mockFixturePaths, options) {
    const {
        prefix = '',
        defaultConfig = null,
        onError = error => {
            log.error(chalk.red(error));
            return [];
        }
    } = options;

    const defaultConfigContent = await fsReadFileAsync(defaultConfig);
    const defaultConfigObject = JSON.parse(defaultConfigContent);

    return Promise.all(mockFixturePaths.map(
        (itemPath, index) => {
            const mockConfig = fsReadFileAsync(path.join(itemPath, '_config.json'))
                .catch(_ => defaultConfigContent);
            return globby(
                [path.join(itemPath, '*.json')],
                { ignore: [path.join(itemPath, '_*.json')] },
            ).then(filePaths => Promise.all(
                filePaths.map(filepath => fsReadFileAsync(filepath)
                    .then(contents => (
                        [contents, filepath, contents]
                    ))),
            )).then(files => mockConfig.then(configContents => {
                const config = tryJSON.parse(configContents, {});
                const configMerged = {
                    ...defaultConfigObject,
                    ...config,
                    constants: {
                        ...defaultConfigObject.constants || {},
                        ...config.constants || {},
                    }
                };
                return [configMerged, files.map(([fileContents]) => {
                    const fileContentsReplaced = fileContents
                        .toString()
                        .replace(/"{{(\w*)}}"/g, function(_, key) {
                            const value = R.path(['constants', key], configMerged);
                            if (value) {
                                return JSON.stringify(value);
                            }
                            return `null`;
                        });
                    return tryJSON.parse(fileContentsReplaced, [])
                })]
            }));
        },
    )).then((fixtures) => {
        return fixtures.map(([config, fixture]) => fixture.reduce((flatten, items = []) => {
            return [...flatten, ...items.map(([apiPath, ...etc]) => {
                return [path.join(prefix, config.prefix || '', apiPath), ...etc];
            })];
        }, [])).reduce((flatten, fixtures) => {
            return [...fixtures, ...flatten];
        }, []);
    }).then(fixtures => {
        // 合并同一个路由下的fixtureOptions, 处理responseSwitches
        const mapping = fixtures.reduce((result, fixture) => {
            const [ fixtureUrlPath, fixtureOptions ] = fixture;
            const last = result[fixtureUrlPath] || {};
            const { responseSwitches = [] } = fixtureOptions
            result[fixtureUrlPath] = {
                ...fixtureOptions,
                responseSwitches: [
                    ...(last.responseSwitches || []),
                    ...responseSwitches
                ]
            };
            return result;
        }, {});
        return Object.keys(mapping)
            .map(fixtureUrlPath => [fixtureUrlPath, mapping[fixtureUrlPath]]);
    }).catch(onError);
}
