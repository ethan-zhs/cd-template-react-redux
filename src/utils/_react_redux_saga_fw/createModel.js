/* eslint-disable no-shadow */
import * as R from 'ramda';
import co from 'co';
import { createKeyModule, action } from '@utils/_react_redux_saga_fw/createAction';
import * as effects from 'redux-saga/effects';
import { takeLatest, put } from 'redux-saga/effects';
import { fromJS } from 'immutable';
import { createScopedSelectorMapping } from '@utils/_react_redux_saga_fw/createScopedSelector';
import moduleInjector from './hoc/moduleInjector';

/**
 * 调用 updateState Action 更新 reducer 中的状态
 * @param payload
 * @param put
 * @return {IterableIterator<*>}
 */
// eslint-disable-next-line no-shadow
export function* updateState(put, payload = {}) {
    return yield put({ type: 'updateState', payload });
}

const wrapSagaKey = key => `saga_${key}`;

const wrapMutationKey = key => `mutation_${key}`;

export function* dispatch(dispatchAction, payload) {
    if (typeof dispatchAction !== 'function') {
        throw new TypeError('dispatch only accept a function with return a action');
    }
    const promise = dispatchAction(payload)(_ => null);
    yield put(promise.getAction());
    return yield promise;
}

/**
 * 创建一个 model, 返回一个包括 { saga, reducer } 的冻结对象
 * @param model
 * @return {Readonly<{sagaToAction: (*|(function(*, *, *): *)), getSagaFunctionsMapping: (function(*): U), sagaToActions: (function(*): *), getSagaFunctionsArray: (function(*): *[]), sagaToActionDispatches: (function(*): *), SAGA_KEYS: ReadonlyArray<string>, stateToSelectors: (function(*=)), INITIAL_STATE: any, STATE_KEYS: ReadonlyArray<string>, reducer: reducer, saga: Function, key: *, sagaToActionDispatch: sagaToActionDispatch}>|any}
 */
export function createModel(model) {
    const {
        namespace, // 命名空间
        state = {}, // 初始的 state 对象
        mutations = { // mutations 自定义的修改 state 的方法，功能类似 switch case 里的代码块
            // 默认有一个名为 updateState 的 mutations 处理所有的状态更新, 所以一般情况下并需要自定义 mutation
            // 如果有需要该对象里应设置以下函数, 第一个参数是当前的state, 返回值是下一个state
            // function setFoo(lastState, payload) {
            //    return lastState.set('foo', payload)
            // }
        },
        sagas = { // sagas 应该仅包含一个或多个 generator 函数方法
            // 该对象体类似 dva 框架中的 effects
            // function* fetchBar({ payload }, { put, ...<redux-saga/effects> }) {
            //    const responseData = yield call(requestBar, ...);
            //    yield put({ type: 'updateState', payload: { responseData } });
            // }
        },
        getGeneratorTakeSagas = (_, mappingSagaFunctions) => {
            const arraySagaFunctions = Object.keys(mappingSagaFunctions)
                .map(key => mappingSagaFunctions[key]);
            return function* () {
                // eslint-disable-next-line no-restricted-syntax
                for (const { keyForAction, fn } of arraySagaFunctions) {
                    yield takeLatest(keyForAction, fn);
                }
            };
        }
    } = model;

    const { commonAction } = createKeyModule(namespace);

    const initialState = fromJS(state);

    const initialStateKeys = Object.keys(state);

    const intlSelect = createScopedSelectorMapping(namespace);

    // step1, create reducers mutations and actions

    const intlMutations = {
        ...mutations,
        // eslint-disable-next-line no-shadow
        updateState(state = initialState, nextState = {}) {
            if (!nextState) {
                return state;
            }
            return state.merge(nextState);
        }
    };

    const MUTATION_KEYS = Object.keys(intlMutations);

    const mutationSwitch = MUTATION_KEYS.reduce((result, type) => {
        const fn = intlMutations[type];
        if (typeof fn !== 'function') return result;
        return [
            ...result,
            [type, commonAction(wrapMutationKey(type)), fn]
        ];
    }, []);

    // eslint-disable-next-line no-shadow
    const reducer = function(state = initialState, action) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [_, type, fn] of mutationSwitch) {
            if (action.type === type) {
                return fn(state, action?.payload);
            }
        }
        return state;
    };

    // step2, create saga actions

    const SAGA_KEYS = Object.keys(sagas);

    const placeholderCallback = (error, toReturn) => {
        // if (error) throw error;
        return toReturn;
    };

    const mappingSagaFunctionsCommon = {};

    const mappingSagaFunctions = SAGA_KEYS.reduce((mapping, key) => {
        const gfn = sagas[key];
        if (typeof gfn !== 'function') return mapping;
        const keyForAction = commonAction(wrapSagaKey(key));
        const sagaFunc = (function* ({ payload, __callback = placeholderCallback } = {}) {
            try {
                return __callback(null, yield gfn(
                    { payload },
                    {
                        ...effects,
                        // eslint-disable-next-line no-shadow
                        * put(action) {
                            // eslint-disable-next-line no-shadow
                            const { type, payload } = action;
                            if (R.includes(type, MUTATION_KEYS)) {
                                return yield put({ type: commonAction(wrapMutationKey(type)), payload });
                            }
                            return yield put(action);
                        },
                        // eslint-disable-next-line no-shadow
                        dispatch
                    }
                ));
            } catch (error) {
                return __callback(error);
            }
        });
        mapping[keyForAction] = { key, keyForAction, fn: sagaFunc };
        mappingSagaFunctionsCommon[key] = { key, keyForAction, fn: sagaFunc };
        return mapping;
    }, {});

    const arraySagaFunctions = Object.keys(mappingSagaFunctions)
        .map(key => mappingSagaFunctions[key]);

    // const saga = function* () {
    //     // eslint-disable-next-line no-restricted-syntax
    //     for (const { keyForAction, fn } of arraySagaFunctions) {
    //         yield takeLatest(keyForAction, fn);
    //     }
    // };
    const saga = getGeneratorTakeSagas({ ...effects }, mappingSagaFunctionsCommon);

    const stateToSelectors = (keys = []) => intlSelect(keys);

    // const mutationToDispatches = keys => mutationSwitch.reduce((result, [propKey, key]) => {
    //     if (R.includes(propKey, keys)) {
    //         result[propKey] = key;
    //     }
    //     return result;
    // });

    const createDispatchesByKey = key => payload => dispatch => {
        let dispatchedAction = null;
        // eslint-disable-next-line no-new
        const promise = new Promise((resolve, reject) => {
            dispatchedAction = action(
                key,
                {
                    // eslint-disable-next-line
                    payload, __callback: (error, toReturn) => {
                        if (error) return reject(error);
                        resolve(toReturn);
                        return toReturn;
                    },
                },
            );
            dispatch(dispatchedAction);
        });
        Object.defineProperty(promise, 'getAction', {
            enumerable: false,
            configurable: false,
            value: _ => dispatchedAction
        });
        return promise;
    };

    const sagaToAction = R.curry((propKey, payload) => {
        return {
            type: commonAction(wrapSagaKey(propKey)),
            payload
        };
    });

    const sagaToActionDispatch = propKey => {
        const keyForAction = commonAction(wrapSagaKey(propKey));
        const item = mappingSagaFunctions[keyForAction];
        if (item) {
            return createDispatchesByKey(keyForAction);
        }
        return _ => dispatch => Promise.reject(
            `saga function '${propKey}' didn't implemented in the model '${namespace}'`
        );
    };

    const sagaToActions = keys => keys.reduce((result, propKey) => {
        result[propKey] = payload => ({
            type: commonAction(wrapSagaKey(propKey)),
            payload
        });
        return result;
    }, {});

    const sagaToActionDispatches = keys => keys.reduce((result, propKey) => {
        const keyForAction = commonAction(wrapSagaKey(propKey));
        const item = mappingSagaFunctions[keyForAction];

        if (item) {
            result[propKey] = createDispatchesByKey(keyForAction);
        } else {
            result[propKey] = _ => dispatch => Promise.reject(
                `saga function '${propKey}' didn't implemented in the model '${namespace}'`
            );
        }
        return result;
    }, {});

    // 为了避免使用者外部修改这种潜在的情况，返回的对象必须冻结
    return Object.freeze({
        key: namespace, // 唯一命名空间
        saga, // saga函数
        reducer, // reducer函数
        // mutationToDispatches, // 把 mutation 映射成对应的 action
        // sagaToDispatches
        sagaToActionDispatches, // 把 saga 映射成对应的 dispatch action
        sagaToActionDispatch,
        sagaToAction,
        sagaToActions,
        // stateToProps, // 把 state 的 key 映射成为 select
        stateToSelectors, // 把 state 的 key 映射成为 select
        getSagaFunctionsArray: _ => ([...arraySagaFunctions]), // 获取所有单个 saga 的 function 以数组形式
        getSagaFunctionsMapping: _ => ({ ...mappingSagaFunctionsCommon }), // 获取所有已经 saga 的 function 以映射表形式
        // ------
        // 初始化的 state
        INITIAL_STATE: fromJS(state),
        // 初始 state 的所有 key, 通过 model.stateToSelectors(model.STATE_KEYS) 获取所有 state 的映射
        // ALL_STATE_KEYS: Object.freeze([...initialStateKeys]), // 弃用@deprecated, 请使用STATE_KEYS
        STATE_KEYS: Object.freeze([...initialStateKeys]),
        SAGA_KEYS: Object.freeze([...SAGA_KEYS]),
    });
}

/**
 * 返回一个moduleInjector包裹的装饰器
 */
export function createModuleInjectorBy(model, {
    mapStateToProps = null,
    mapDispatchToProps = null,
    beforeEjectSaga = _ => null
} = {}) {
    const result = Component => moduleInjector({
        ...model,
        beforeEjectSaga,
        connectOpt: {
            mapStateToProps: {
                ...model && model.stateToSelectors(model.STATE_KEYS),
                ...mapStateToProps
            },
            mapDispatchToProps: {
                ...model && model.sagaToActionDispatches(model.SAGA_KEYS),
                ...mapDispatchToProps
            },
        }
    })(Component);

    Object.assign(result, model);

    return result;
}
