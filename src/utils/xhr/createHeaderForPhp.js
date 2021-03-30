import * as R from 'ramda';
import tryQueryString from '../string-helper/tryQueryString';

function varsSort(obj) {
    const opts = Object.keys(obj);
    opts.sort();
    let vars = '';
    opts.map((value, index) => {
        const data = obj[value];
        if (!(data instanceof Array) && data != undefined && data != null) {
            vars += (value + data);
        }
        return undefined;
    });
    // console.log('sign sort: ', vars);
    return vars;
}

function sha1(str) {
    const crypto = require('crypto'); // 加载crypto库
    const shasum = crypto.createHash('sha1');
    shasum.update(str, 'utf8');
    str = shasum.digest('hex');// ?
    return str;
}

function md5(str) {
    const crypto = require('crypto'); // 加载crypto库
    const md5Str = crypto.createHash('md5');
    md5Str.update(str, 'utf8');
    str = md5Str.digest('hex');// ?
    return str;
}

export function createSign(method, entryPoint, obj, token, timestamp, userId) {
    let str;
    const objParams = tryQueryString.parse(R.nth(1, entryPoint.split('?')));

    if (objParams) {
        str = varsSort({ ...objParams, ...obj });
    } else {
        str = varsSort(obj);
    }

    // console.log('sign create: ', token, userId, str, timestamp);
    return sha1(md5(token + userId + str + timestamp));
}

export function createHeader(method, entryPoint, obj, token, timestamp, userId, uniqueId) {
    const sign = createSign(method, entryPoint, obj, token, timestamp, userId);
    return {
        userId,
        sign,
        timestamp,
        uniqueId
    };
}
