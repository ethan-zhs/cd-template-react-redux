import * as R from 'ramda';

const HANDLES_COMMON_ERROR = [
    [({ code, status }) => {
        return `${code}` === '80001' && `${status}` === '403';
    }, {
        message: '当前账号没有该操作权限'
    }],
    [({ code, status, error }) => {
        return [code, status].every(R.isNil) && typeof error.defaultMessageOkTextCallback === 'function';
    }, ({ error }) => ({
        message: error.defaultMessageText || '网络异常，请检查你的网络',
        okText: '稍后再试',
        callback: async ({ history }) => {
            await error.defaultMessageOkTextCallback();
        }
    })],
    [({ code, status }) => {
        return [code, status].every(R.isNil);
    }, {
        type: 'confirm',
        message: '网络异常，请检查你的网络',
        okText: '刷新页面',
        cancelText: '返回',
        callback: ({ history }) => {
            if (R.path(['location', 'pathname'], history) === '/login') {
                return;
            }
            window.location.href = '/home';
        }
    }]
];

export default function () {
    return [
        [({ code, status, responseRaw }) => {
            // console.log('responseRaw', code, status, responseRaw);
            return (`${code}` === '60015' && `${status}` === '403') ||
                (`${responseRaw?.data?.code}` === 'USER_ID_IS_NULL_ERR' &&
                    `${responseRaw?.data?.status}` === '500'
                ) || (
                `${responseRaw?.data?.code}` === 'LOGIN_EXPIRE' &&
                `${responseRaw?.data?.status}` === '501');
        }, {
            message: '登录已过期，请重新登录',
            okText: '重新登录',
            callback: ({ history }) => {
                localStorage.removeItem('loginUserJwt');
                localStorage.removeItem('loginUserId');
                localStorage.removeItem('loginUniqueId');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }],
        ...HANDLES_COMMON_ERROR
    ];
}
