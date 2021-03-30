import dateFormat from 'dateformat';
import CryptoJS from 'crypto-js';
// import crypto from 'crypto'
import axios from 'axios';
import moment from 'moment';
// import SparkMD5 from 'spark-md5';

// console.log(moment === window.moment, CryptoJS === window.CryptoJS)

function dateFormatForOss (nowDate) {
    return dateFormat(nowDate, 'UTC:ddd, dd mmm yyyy HH:MM:ss \'GMT\'');
    // const format = 'ddd, DD MMM YYYY HH:MM:ss';
    // return moment(nowDate).locale('en').utcOffset(0).format(format) + ' GMT';
}

function getFileName (file, md5, ossType) {
    const pos = file.name.lastIndexOf('.');
    const now = Date.parse(new Date()) / 1000;
    let suffix = '';
    if (pos !== -1) {
        suffix = file.name.substring(pos);
    }
    const ossTypeStrlen = (ossType || '').length || 0;
    const md5Short = String(md5).substr(8, 16 - ossTypeStrlen) +
    (ossType || '');
    return md5Short + now + suffix;
}

// eslint-disable-next-line prefer-destructuring
// const ComposeOss = window['ComposeOss_1.0.0']; // window.ComposeOss;

function readChunked (file, chunkCallback, endCallback) {
    const fileSize = file.size;
    const chunkSize = 1 * 1024 * 1024; // 4MB
    let offset = 0;

    const reader = new FileReader();
    reader.onload = function () {
        if (reader.error) {
            endCallback(reader.error || {});
            return;
        }
        offset += reader.result.byteLength;
        // callback for handling read chunk
        // TODO: handle errors
        chunkCallback(reader.result, offset, fileSize);
        // console.log('offset, fileSize', reader.result)
        if (offset >= fileSize) {
            endCallback(null);
            return;
        }
        readNext();
    };

    reader.onerror = function (err) {
        endCallback(err || {});
    };

    function readNext () {
        const fileSlice = file.slice(offset, offset + chunkSize);
        reader.readAsArrayBuffer(fileSlice);
    }

    readNext();
}

// https://bugjia.net/200227/424180.html
function arrayBufferToWordArray (ab) {
    const i8a = new Uint8Array(ab);
    const a = [];
    for (let i = 0; i < i8a.length; i += 4) {
        a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
    }
    return CryptoJS.lib.WordArray.create(a, i8a.length);
}

async function getMD5 (blob, cbProgress) {
    return new Promise((resolve, reject) => {
        const md5CryptoJS = CryptoJS.algo.MD5.create();
        const md5HexCryptoJS = CryptoJS.algo.MD5.create();
        // const md5 = crypto.createHash('md5')
        // const md5Hex = crypto.createHash('md5')
        readChunked(blob, (chunk, offs, total) => {
            md5CryptoJS.update(arrayBufferToWordArray(Buffer.from(chunk, 'utf8')));
            md5HexCryptoJS.update(arrayBufferToWordArray(Buffer.from(chunk, 'utf8')));
            // md5.update(Buffer.from(chunk, 'utf8'))
            // md5Hex.update(Buffer.from(chunk, 'utf8'))
            if (cbProgress) {
                cbProgress(offs / total);
            }
        }, err => {
            if (err) {
                reject(err);
            } else {
                const hashCryptoJS = md5CryptoJS.finalize();
                // const toResolveNode = { string: md5Hex.digest('hex'), base64: md5.digest('base64') }
                const toResolveCryptoJS = {
                    string: hashCryptoJS.toString(CryptoJS.enc.Hex),
                    base64: hashCryptoJS.toString(CryptoJS.enc.Base64)
                };
                // console.log('using toResolveCryptoJS', toResolveNode, toResolveCryptoJS)
                resolve(toResolveCryptoJS);
            }
        });
    });
}

function signature (stringToSign, token) {
    // eslint-disable-next-line no-shadow
    // let sign = crypto.createHmac('sha1', token.AccessKeySecret)
    // sign = sign.update(Buffer.from(stringToSign, 'utf8')).digest('base64')

    const hash = CryptoJS.HmacSHA1(stringToSign, token.AccessKeySecret);

    // console.log(sign, hash.toString(CryptoJS.enc.Base64))

    return hash.toString(CryptoJS.enc.Base64);
}

function authorization (method, resource, subres, headers, token) {
    const ossHeaders = {};
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in headers) {
        const lkey = key.toLowerCase().trim();
        if (lkey.indexOf('x-oss-') === 0) {
            ossHeaders[lkey] = ossHeaders[lkey] || [];
            ossHeaders[lkey].push(String(headers[key]).trim());
        }
    }

    const ossHeadersList = [];
    Object.keys(ossHeaders).sort().forEach((key) => {
        ossHeadersList.push(key + ':' + ossHeaders[key].join(','));
    });
    const params = [
        method.toUpperCase(),
        headers['Content-Md5'] || '',
        headers['Content-Type'] || '',
        headers['x-oss-date'],
        ...ossHeadersList
    ];
    let resourceStr = '';
    resourceStr += resource;

    const subresList = [];
    if (subres) {
        if (typeof subres === 'string') {
            subresList.push(subres);
        } else {
            // eslint-disable-next-line guard-for-in,no-restricted-syntax
            for (const k in subres) {
                const item = subres[k] ? k + '=' + subres[k] : k;
                subresList.push(item);
            }
        }
    }

    if (subresList.length > 0) {
        resourceStr += '?' + subresList.join('&');
    }
    params.push(resourceStr);
    const stringToSign = params.join('\n');
    const auth = 'OSS ' + token.AccessKeyId + ':';
    console.log('stringToSign', stringToSign);
    return auth + signature(stringToSign, token);
}

async function getHeaders (md5, options, nowDate = new Date().getTime(), token) {
    const headers = {
        'x-oss-date': dateFormatForOss(nowDate)
    };
    headers['Content-Type'] = options.mime || 'application/x-www-form-urlencoded';
    if (token.SecurityToken) {
        headers['x-oss-security-token'] = token.SecurityToken;
    }
    if (options.content) {
        headers['Content-Md5'] = md5;
    }
    if (!token.bucket) {
        throw new Error('token.bucket not exists!');
    }
    const authResource = `/${token.bucket}/${options.object || ''}`;
    headers.authorization = authorization(options.method, authResource, options.subres, headers, token);
    return headers;
}

function getUrlDefault (options, token) {
    let resourceStr = '';
    const subresList = [];
    if (options.subres) {
        if (typeof options.subres === 'string') {
            subresList.push(options.subres);
        } else {
            // eslint-disable-next-line guard-for-in,no-restricted-syntax
            for (const k in options.subres) {
                const item = options.subres[k] ? k + '=' + options.subres[k] : k;
                subresList.push(item);
            }
        }
    }
    if (subresList.length > 0) {
        resourceStr += '?' + subresList.join('&');
    }
    // eslint-disable-next-line no-useless-concat
    return 'https://' + token.bucket + '.' + token.region + '.aliyuncs.com' + '/' + options.object + resourceStr;
}

export default function createOssUploader (ossType, host, token, options) {
    const {
        progress = () => null,
        getUrl = getUrlDefault,
        getFilePathName = fileName => fileName,
        getFileMime = () => 'application/octet-stream',
        byPassMd5 = md5 => md5.base64
    } = options;

    return async function upload (file) {
        const md5 = await getMD5(file);

        const fileName = getFileName(file, md5.string, ossType);

        // eslint-disable-next-line no-unreachable
        const params = {
            object: getFilePathName(fileName, token),
            method: 'PUT',
            file: file,
            mime: getFileMime(file.name),
            content: true
        };

        const requestData = {
            url: getUrl(params, token),
            method: 'PUT',
            // ----->
            // NOTICE: 此处需要通过分片读取的方式计算文件md5，避免文件过大导致浏览器内存泄漏崩溃
            headers: await getHeaders(byPassMd5(md5), params, Date.now(), token)
        };

        console.log('requestData', requestData);

        let cancel = () => {
            throw new Error('not canceled');
        };

        // eslint-disable-next-line no-shadow
        const task = axios({
            method: requestData.method,
            url: requestData.url,
            headers: {
                accept: '*/*',
                ...requestData.headers
            },
            data: params.file,
            onUploadProgress: function (progressEvent) {
                // Do whatever you want with the native progress event
                const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                progress({ progress: percent });
            },
            // ----->
            // NOTICE: 此处获得axios提供的取消方法，可以取消上传请求
            // eslint-disable-next-line no-shadow
            cancelToken: new axios.CancelToken((thatCancel) => {
                cancel = thatCancel;
            })
        });

        let abort = () => {
            throw new Error('not abort');
        };

        const taskCancelable = new Promise((resolve, reject) => {
            task.then(() => {
                // console.log('requestFinish', requestData.url);
                resolve({
                    name: fileName,
                    sourceLink: `${host}/${params.object}`
                });
            }).catch(reject);

            abort = () => {
                // console.log('requestAborted', requestData.url);
                cancel();
                reject(Object.assign(new Error('aborted'), {
                    isAborted: true
                }));
            };
        });

        // eslint-disable-next-line no-unreachable
        return {
            abort: () => abort(),
            promise: () => taskCancelable
        };
    };
}
