import * as R from 'ramda';
import { createModel, updateState } from '@utils/_react_redux_saga_fw/createModel';
import delay from '@utils/delay';
import { getX, putX2 } from '@utils/xhr';
import moment from 'moment';

export const EVENT_MESSAGES_POLLING_START = 'messages@EVENT_MESSAGES_POLLING_START';

export const EVENT_MESSAGES_POLLING_STOP = 'messages@EVENT_MESSAGES_POLLING_STOP';

export const MESSAGE_TYPE_TO_NAME = {
    0: '发布任务',
    1: '发布任务抄送',
    2: '汇报任务',
    3: '汇报任务抄送'
};

function getPollingMessagesStatus({ put, cancelled, call, select }) {
    // console.log('getPollingMessages...');
    // eslint-disable-next-line require-yield
    return function* () {
        try {
            while (true) {
                const isLogin = yield select(
                    state => state.getIn(['account', 'isLogin'])
                );
                if (!isLogin) {
                    yield delay(30000);
                    // eslint-disable-next-line no-continue
                    continue;
                }

                const { data = 0 } = yield call(getX('/v1/sysnotification/new'), null);

                const countUnreadMessageLast = yield select(
                    state => state.getIn(['message', 'countUnreadMessage'])
                );

                const wasCountUnreadMessageGrow = yield select(
                    state => state.getIn(['message', 'wasCountUnreadMessageGrow'])
                );

                if (data) {
                    // const { resultList } = yield call(getX('/api/v1/user/message'), null);
                    yield updateState(put, {
                        // listMessages: normalizeResultList(resultList),
                        countUnreadMessage: data || 0,
                        wasCountUnreadMessageGrow:
                            wasCountUnreadMessageGrow || data > countUnreadMessageLast,
                    });
                }
                yield delay(20000);
            }
        } catch (error) {
            console.error(error);
            if (error.preventDefaultMessage) {
                error.preventDefaultMessage();
            }
        } finally {
            yield cancelled();
        }
    };
}

function resolveData(data) {
    return data.map(item => {
        return {
            ...item,
            created_at_timestamp: moment(item.created_at, 'YYYY-MM-DD HH:mm:ss').valueOf()
        };
    });
}

const DELTA_PAGE = 10;

function* fetchHeadListMessages({ payload } = {}, { call, put, select }) {
    yield updateState(put, { isLoadingListMessages: true });
    const response = yield call(getX('/v1/sysnotification'), {
        $params: {
            per_page: DELTA_PAGE,
            // eslint-disable-next-line radix
            page: 1
        }
    });
    const { total, per_page, current_page, data } = response.data;
    yield updateState(put, {
        listMessages: resolveData(data),
        currentPageSize: data.length, // +per_page,
        currentPage: +current_page || 1,
        currentTotal: +total || 0,
        wasCountUnreadMessageGrow: false,
        ...(data.length < per_page) && {
            isHasMoreMessages: false
        }
    });
    yield updateState(put, { isLoadingListMessages: false });
}

export default createModel({
    namespace: 'message',
    state: {
        countUnreadMessage: 0,
        isLoadingListMessages: false,
        isLoadingAppendListMessages: false,
        listMessages: [],
        currentPageSize: 0,
        currentPage: 0,
        currentTotal: 0,
        isHasMoreMessages: true,
        isCountUnreadMessageGrow: false
    },
    sagas: {
        * reviewTaskReplyPass({ payload }, { call, put }) {
            yield call(putX2(`/v1/taskreply/${payload.recordPk}`), {
                action: 'pass',
                verify_remark: payload.remark || ''
            });
        },
        * reviewTaskReplyDeny({ payload }, { call, put }) {
            yield call(putX2(`/v1/taskreply/${payload.recordPk}`), {
                action: 'notpass',
                verify_remark: payload.remark || ''
            });
        },
        * clear(_, { put }) {
            yield updateState(put, {
                countUnreadMessage: 0,
                isLoadingListMessages: false,
                isLoadingAppendListMessages: false,
                listMessages: [],
                currentPageSize: 0,
                currentPage: 0,
                currentTotal: 0,
                isHasMoreMessages: true,
                isCountUnreadMessageGrow: false
            });
        },
        fetchHeadListMessages,
        * fetchAppendListMessages({ payload } = {}, { call, put, select }) {
            const {
                currentPageSize: currentPageSizeLast,
                listMessages: listMessagesLast,
                wasCountUnreadMessageGrow,
                isHasMoreMessages,
                isLoadingAppendListMessages
            } = yield select(
                state => state.getIn(['message']).toJS()
            );

            // console.log('isLoadingAppendListMessages', isLoadingAppendListMessages);

            if (isLoadingAppendListMessages) {
                return false;
            }

            if (wasCountUnreadMessageGrow) {
                return yield fetchHeadListMessages({ payload }, { call, put, select });
            }

            if (!isHasMoreMessages) {
                return false;
            }

            yield updateState(put, { isLoadingAppendListMessages: true });

            // console.log(listMessagesLast.length, Math.floor(listMessagesLast.length / DELTA_PAGE) + 1);

            const response = yield call(getX('/v1/sysnotification'), {
                $params: {
                    per_page: DELTA_PAGE,
                    // eslint-disable-next-line radix
                    page: Math.floor(listMessagesLast.length / DELTA_PAGE) + 1
                }
            });
            const { total, per_page, current_page, data: dataPatch = [] } = response.data;

            const data = [
                ...listMessagesLast,
                ...dataPatch
            ];

            yield updateState(put, {
                listMessages: resolveData(data),
                currentPageSize: data.length, // +per_page,
                // currentPage: +current_page || 1,
                currentTotal: +total || 0,
                ...(data.length < currentPageSizeLast + DELTA_PAGE) && {
                    isHasMoreMessages: false,
                    wasCountUnreadMessageGrow: false
                }
            });
            yield updateState(put, { isLoadingAppendListMessages: false });
        },
        * getSysNotificationDetail({ payload }, { call, put }) {
            const response = yield call(getX(`/v1/sysnotification/${payload.recordPk}`), null);
            const { data = 0 } = yield call(getX('/v1/sysnotification/new'), null);
            yield updateState(put, {
                // listMessages: normalizeResultList(resultList),
                countUnreadMessage: data || 0
            });
            return {
                ...response?.data?.detail,
                notification_type: response?.data?.notification_type
            };
        },
        * _runPollingMessagesStatus(_, effects) {
            const { take, fork, cancel } = effects;
            while (yield take(EVENT_MESSAGES_POLLING_START)) {
                const task = yield fork(getPollingMessagesStatus(effects));
                yield take(EVENT_MESSAGES_POLLING_STOP);
                yield cancel(task);
            }
        },
        * putReadTaskMessage({ payload }, { call, put }) {
            yield call(putX2(`/v1/tasktarget/${payload.targetPk}?action=read`), null);
        },
        * putReceivedTaskMission({ payload }, { call, put }) {
            yield call(putX2(`/v1/tasktarget/${payload.targetPk}?action=receive`), null);
        },
        * putRefuseAssistMission({ payload }, { call }) {
            yield call(putX2(`/v1/tasktarget/${payload.targetPk}?action=refuse`), null);
        },
        * putAcceptAssistMission({ payload }, { call }) {
            yield call(putX2(`/v1/tasktarget/${payload.targetPk}?action=receive`), null);
        },
    },
    getGeneratorTakeSagas({ fork, takeLatest, takeEvery }, mappingSagaFunctions) {
        return function* () {
            const {
                _runPollingMessagesStatus,
                fetchAppendListMessages,
                ...resetSagaFunctions
            } = mappingSagaFunctions;
            yield fork(_runPollingMessagesStatus.fn);
            const restFunctions = R.values(resetSagaFunctions);
            // eslint-disable-next-line no-restricted-syntax
            for (const { keyForAction, fn } of restFunctions) {
                yield takeLatest(keyForAction, fn);
            }
            yield takeEvery(fetchAppendListMessages.keyForAction, fetchAppendListMessages.fn);
        };
    }
});
