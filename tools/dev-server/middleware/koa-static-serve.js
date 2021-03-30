'use strict';
import { resolve } from 'path';
import assert from 'assert';
import send from 'koa-send';

export default (root, options) => {
    const { shouldThrow404 = false } = options;
    
    return async function serve (ctx, next) {
        let done = false

        assert(root, 'root directory is required to serve files')

        options.root = resolve(root)

        if (ctx.method === 'HEAD' || ctx.method === 'GET') {
            try {
                done = await send(ctx, ctx.path, options)
            } catch (err) {
                if (shouldThrow404 && err.status === 404) {
                    throw err
                }
                if (err.status !== 404) {
                    throw err
                }
            }
        }

        if (!done) {
            await next()
        }
    }
}
