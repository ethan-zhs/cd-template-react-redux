import * as R from 'ramda';
import axios from 'axios';
import getHeaders from './createHeaderForJava';
import { ApiBaseName } from './basename';
// import GLOBAL_ERROR from './constants/globalError';
import globalTips from './globalTips';
import path from 'path';
import { curry } from 'ramda';
import pathToRegexp from 'path-to-regexp';
import querystring from 'querystring';
import handelRequestError from '@constants/handelRequestError';
// import { createHeader } from './createHeaderForPhp';
import { createHeader } from './createHeaderForJava';

// const GLOBAL_ERROR = {
//     40006: {
//         message: '登录信息已过期，请重新登录',
//         code: 'LOGIN_EXPIRE',
//         type: 'info',
//         goLogin: true
//     },
//     40010: {
//         message: '当前账号没有该操作权限',
//         code: 'FORBIDDEN_ACTION'
//     }
// };
//
// function checkTips(res) {
//     return res ? globalTips(
//         GLOBAL_ERROR[res.errorCode] || {
//             message: res.errorMessage || '',
//             code: res.errorCode
//         }
//     ) : void 0;
// }

// /**
//  *  根据状态处理错误报文
//  * @param {status:number} http状态码
//  * @param {data: {errorCode: number, errorMessage: string}} 错误对象
//  */
// function handleResponseStatusError({ status, data }) {
//     return checkTips(data);
// }

// axios.interceptors.response.use((response) => {
//     return response;
// }, (error) => {
//     // Do something with response error
//     console.log('axios.interceptors.response error %O', error);
//     return Promise.reject(error.response);
// });

if (localStorage.getItem('loginUserJwt') === 'undefined') {
    localStorage.removeItem('loginUserJwt');
    localStorage.removeItem('loginUserId');
    localStorage.removeItem('loginUniqueId');
}

export default function callApi(entryPoint, method, header = {}, data = {}) {
    let contentType = 'application/x-www-form-urlencoded';
    const jwt = localStorage.getItem('loginUserJwt') || '';
    const userId = localStorage.getItem('loginUserId') || '';
    // const uniqueId = localStorage.getItem('loginUniqueId') || ''
    let headerIntl = {};
    method = method.toUpperCase();
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        contentType = 'application/json';
        // if (typeof data !== 'string' && typeof data === 'object') {
        //     data = JSON.stringify(data);
        //     console.log(data, '-------------------请求参数');
        // }
    }
    let keyValue = '';
    data &&
        Object.keys(data).forEach(item => {
            keyValue += item + '=' + data[item] + '&';
        });
    // const bodyStream = method === 'GET' || method === 'DELETE' ? '' : data;
    // const endpoint1 =
    //     method === 'GET'
    //         ? (ApiBaseName + entryPoint + '?' + keyValue).slice(0, -1)
    //         : ApiBaseName + entryPoint;

    // const timestamp = Date.now();
    // headerIntl = createHeader(method, entryPoint, data || {}, jwt, timestamp, userId, uniqueId);
    headerIntl = createHeader(method, ApiBaseName + entryPoint, data, {
        userId,
        token: jwt,
        client: 'WEB_PC'
    });

    headerIntl = { ...headerIntl };
    // const userPk = localStorage.getItem('loginUserId');
    headerIntl['Content-Type'] = contentType;

    const getHeader = typeof header === 'function' ?
        header : (_headerIntl) => ({ ..._headerIntl, ...header });

    const instance = axios.create({
        baseURL: ApiBaseName,
        headers: getHeader(headerIntl)
    });
    // 确保是promise对象
    return new Promise((resolve, reject) => {
        instance
            .request({
                url: entryPoint,
                method: method || 'POST',
                params: (method === 'GET' || method === 'DELETE') ? data || {} : void 0,
                data: (method !== 'GET' && method !== 'DELETE') ? data || {} : void 0
            })
            .then(response => {
                if (response && (response.status === 200 || response.status === 201)) {
                    // => res = {
                    //     config: [axios配置],
                    //     data: [axios数据],
                    //     headers: [axios请求头],
                    //     request: [XMLHttpRequest对象],
                    //     status: [http状态码],
                    //     statusText: [http信息]
                    // };
                    // => response = {
                    //     data,
                    //     getResponse: () => {
                    //         config, headers, request, status, statusText;
                    //     }
                    // };
                    const responseData = response.data || null;
                    // delete res.data;
                    // try {
                    //     Object.defineProperty(response, 'getResponse', {
                    //         configurable: false,
                    //         writable: false,
                    //         enumerable: false,
                    //         value: () => res
                    //     });
                    // } catch (err) {
                    //     console.warn(
                    //         'Oops.. Object.defineProperty getResponse failed. Checkout the HTTP Response if it\'s a no-object.'
                    //     );
                    // }

                    // if (responseData && responseData.status !== 200) {
                    //     throw Object.assign(new Error('Not 20X'), {
                    //         response: {
                    //             ...response,
                    //             data: { ...response.data, errorMessage: responseData.message }
                    //         }
                    //     });
                    // }

                    return resolve(responseData);
                }
                throw Object.assign(new Error('Not 20X'), { response });
            })
            .catch(err => {
                // if (
                //     err &&
                //     err.message &&
                //     err.message.toLowerCase() === 'network error'
                // ) {
                //     !options.noTips &&
                //         globalTips({
                //             message: '网络错误请重试' || '',
                //             code: 'GLOBAL_ERROR_NETWORK'
                //         });
                //     return reject({
                //         code: 'GLOBAL_ERROR_NETWORK',
                //         message: '网络错误',
                //         param: '',
                //         data: {}
                //     });
                // }

                // ---

                // => err = {
                //     config: [axios配置],
                //     request: [XMLHttpRequest对象],
                //     response: [axios数据],
                //          => {
                //              config, data, headers, request, status, statusText
                //          }
                //     message: [error信息],
                //     stack: [error堆]
                // }
                // => error => {
                //     config,
                //     request,
                //     response,
                //     message,
                //     stack,
                //     => (将 response 对象展开, 同时保留 response 对象)
                //     data,
                //     headers,
                //     status,
                //     statusText
                // }

                // ---

                // err.status = err.response && err.response.status;
                // err.data = err.response && err.response.data;
                // !options.noTips && handleResponseStatusError({ ...err });
                // err.headers = err.response && err.response.headers;
                // err.statusText = err.response && err.response.statusText;

                let isPreventDefaultMessage = false;
                // eslint-disable-next-line no-return-assign
                err.preventDefaultMessage = _ => (isPreventDefaultMessage = true);

                const errorResponse = { ...R.prop('response', err) };

                reject(err);

                Promise.resolve().then(_ => {
                    if (!isPreventDefaultMessage) {
                        const message = R.path(['data', 'errorMessage'], errorResponse);
                        const code = R.path(['data', 'errorCode'], errorResponse);
                        const { status } = errorResponse;
                        const propsGlobalTips = R.prop(1, R.find(
                            ([ fn = _ => false ]) => fn({
                                message,
                                code,
                                status,
                                error: err,
                                responseRaw: errorResponse
                            }),
                            handelRequestError()
                        )) || (_ => null);
                        return globalTips({
                            error: err,
                            message: R.path(['data', 'errorMessage'], errorResponse) || '',
                            code: R.path(['data', 'errorCode'], errorResponse) || '',
                            ...typeof propsGlobalTips === 'function' ?
                                propsGlobalTips({ error: err }) : propsGlobalTips
                        });
                    }
                });
            });
    });
}

/* eslint-disable no-unused-vars */
// 后台的服务名称
export const MNG = '';
/* eslint-enable no-unused-vars */

//
// requestX('POST', '/api/needs/header', {
//   headerData: {
//      'X-Special-Header': 'xxx'
//   }
// })
//
export const requestX = curry((method, apiPath, { urlData = {}, bodyData = null, headerData = null }) => {
    const [apiPathPathName, apiPathParams] = apiPath.split('?');
    let apiUrl = pathToRegexp.compile(`${MNG ? `/${MNG}` : ''}${path.join('/', apiPathPathName)}`)({
        ...urlData
    });
    const { $params = {} } = urlData || {};
    const strParamsQueryString = querystring.stringify({
        ...querystring.parse(apiPathParams),
        ...$params
    });
    if (strParamsQueryString) {
        apiUrl = `${apiUrl}?${strParamsQueryString}`;
    }
    return callApi(apiUrl, method, headerData, bodyData);
});

// GET 请求
/**
 * 使用方法示例:
 *    1) 不需要queryString的时候, 'v1/role/:roleId' 传入 { roleId: 1 } 会自动拼接为 'v1/role/1'
 *    2) 需要queryString的时候, 'v1/role/:roleId'
 *       传入 { roleId: 1, $params: { a: 1 } } 会自动拼接为 'v1/role/1?a=1'
 */
export const getX = curry(
    (apiPath, data) => {
        return requestX('GET', apiPath, { urlData: data /* , bodyData: data */ });
    }
);

// DELETE 请求
// 用法参考 getX
export const deleteX = curry(
    (apiPath, data) => {
        return requestX('DELETE', apiPath, { urlData: data });
    }
);

// POST 请求
export const postX2 = curry(
    (apiPath, data) => {
        return requestX('POST', apiPath, {
            urlData: {},
            bodyData: data
        });
    }
);

// POST 请求
export const postX3 = curry(
    (apiPath, urlData, data) => {
        return requestX('POST', apiPath, {
            urlData: urlData,
            bodyData: data
        });
    }
);

// PUT 请求
export const putX2 = curry(
    (apiPath, data) => {
        return requestX('PUT', apiPath, {
            urlData: {},
            bodyData: data
        });
    }
);

// PUT 请求
export const putX3 = curry(
    (apiPath, urlData, data) => {
        return requestX('PUT', apiPath, {
            urlData: urlData,
            bodyData: data
        });
    }
);
