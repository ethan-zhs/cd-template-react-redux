import * as R from 'ramda';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';
import MD5 from 'crypto-js/md5';
import tryQueryString from '../string-helper/tryQueryString';

/**
 * [获得异步header]
 * @param  {[string]} method     [description]
 * @param  {[string]} requestUrl [description]
 * @param  {[string]} bodyStream [description]
 * @param headerPatch
 * @return {[object]} headers [description]
 */
export function createHeader(method, requestUrl, bodyStream, headerPatch = {}) {
    const timestamp = Date.now(); // new Date().getTime();
    const key = '70981584112739525284900983877058';
    const secret = 'aEWYTPmg4zbio2l8WCjnL8DYqBzKrFfkeEGxQIYFfZx8ePddNTJCWBNHysOpseYe';
    // const key = '43744430744753676437482361540617';
    // const secret = 'JK9AsDNYcY70BvoWArlJRfDifSiBn5qlguTHfhnwvDEjuEgIEkHLiv4JcSQFmCRZ';

    // let headers = {};

    let md5 = '';
    let contentMD5 = '';
    let requestUrlFinal = requestUrl;
    let bodyStreamRaw = bodyStream;

    // bodyStream = { account: '13556006668', verificationCode: '123123' };
    // timestamp = 1598248907521;

    if (bodyStream) {
        if (typeof bodyStream === 'object') {
            bodyStreamRaw = JSON.stringify(bodyStream);
        }
        if (method === 'GET' || method === 'DELETE') {
            bodyStreamRaw = '';
            const requestUrlQuery = tryQueryString.parse(R.nth(1, requestUrl.split('?')));
            if (typeof bodyStream === 'object') {
                requestUrlFinal = requestUrl + '?' + Object.keys({
                    ...requestUrlQuery,
                    ...bodyStream
                })
                    .reduce((result, item, index) => {
                        return result + (index > 0 ? '&' : '') + item + '=' + bodyStream[item];
                    }, '');
            }
        }
        // console.log('bodyStreamRaw', bodyStreamRaw)
        md5 = MD5(bodyStreamRaw);
        contentMD5 = Base64.stringify(md5);
    }

    const stringToSigned = `${method}\n${requestUrlFinal}\n${timestamp}\n${contentMD5}`;

    // console.log('stringToSigned is \n\n', bodyStream, stringToSigned);

    const sign = Base64.stringify(HmacSHA256(stringToSigned, secret));

    const headers = {
        'Content-Type': 'application/json',
        'X-NAME-Ca-Key': key,
        'X-NAME-Ca-Timestamp': timestamp,
        'X-NAME-Ca-Signature': sign,
    };

    if (headerPatch.client) {
        headers['X-NAME-CLIENT'] = headerPatch.client;
    }
    if (headerPatch.appVersion) {
        headers['X-NAME-APP-VERSION'] = headerPatch.appVersion;
    }
    if (headerPatch.userId && +headerPatch.userId !== 0) {
        headers['X-NAME-USER-PK'] = headerPatch.userId;
    }
    if (headerPatch.deviceId) {
        headers['X-NAME-DEVICE-ID'] = headerPatch.deviceId;
    }
    // const loginUserAccount = localStorage.getItem('loginUserAccount');
    // if (loginUserAccount) {
    //     headers['X-NAME-USER-ACCOUNT'] = loginUserAccount;
    // }
    if (headerPatch.token) {
        headers.Authorization = 'Bearer ' + headerPatch.token;
    }

    return headers;
}
