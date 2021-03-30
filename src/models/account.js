import * as R from 'ramda';
import { delay } from 'redux-saga';
import { createModel, updateState } from '@utils/_react_redux_saga_fw/createModel';

function* updateAccountUserInfo(userInfo, { put }) {
    const { resultList } = userInfo;
    yield updateState(put, {
        userInfo: { ...userInfo },
        checkUserPermsByKey: key => R.includes(key, resultList)
    });
}

export default createModel({
    namespace: 'account',
    state: {
        isProcessingLogin: false,
        isProcessingLogout: false,
        isLogin: false,
        userInfo: {},
        checkUserPermsByKey: _ => false
    },
    sagas: {
        * login({ payload }, { call, put }) {
            yield updateState(put, { isProcessingLogin: true });
            try {
                yield call(delay, 500);
                const userInfo = { name: 'userName', resultList: ['auth_key_1', 'auth_key_2'] };
                yield updateAccountUserInfo(userInfo, { put });
                yield updateState(put, { isLogin: true });
            } finally {
                yield updateState(put, { isProcessingLogin: false });
            }
        },
        * logout({ payload }, { call, put }) {
            yield updateState(put, { isProcessingLogout: true });
            try {
                yield call(delay, 500);
                yield updateState(put, { userInfo: {}, checkUserPermsByKey: R.F, isLogin: false });
            } finally {
                yield updateState(put, { isProcessingLogout: false });
            }
        },
        * getAccountInfo({ payload }, { call, put }) {
            yield updateState(put, { isProcessingLogout: true });
            try {
                yield call(delay, 500);
                const userInfo = { name: 'userName', resultList: ['auth_key_1', 'auth_key_2'] };
                yield updateAccountUserInfo(userInfo, { put });
                yield updateState(put, { isLogin: true });
            } finally {
                yield updateState(put, { isProcessingLogout: false });
            }
        }
    }
});
