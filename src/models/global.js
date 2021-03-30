import { createModel, updateState } from '@utils/_react_redux_saga_fw/createModel';
import { takeLatest, takeEvery } from 'redux-saga/effects';

export default createModel({
    namespace: 'global',
    state: {
        isSiderNavCollapsed: false,
        mobilePaddingTop: 0,
        remToPx: () => 0
    },
    sagas: {
        * toogleSiderNavCollapsed({ payload }, { call, put }) {
            yield updateState(put, {
                isSiderNavCollapsed: payload.isCollapsed
            });
        },
        * setMobilePaddingTop({ payload }, { call, put }) {
            yield updateState(put, { mobilePaddingTop: payload });
        },
        * setRemToPx({ payload }, { call, put }) {
            yield updateState(put, { remToPx: payload });
        }
    },
    getGeneratorTakeSagas: (_, mappingSagaFunctions) => {
        const {
            // eslint-disable-next-line no-shadow
            ...mappingSagaFunctionsRest
        } = mappingSagaFunctions;

        const arraySagaFunctions = Object.keys(mappingSagaFunctionsRest)
            .map(key => mappingSagaFunctionsRest[key]);

        return function* () {
            // eslint-disable-next-line no-restricted-syntax
            for (const { keyForAction, fn } of arraySagaFunctions) {
                yield takeLatest(keyForAction, fn);
            }
        };
    }
});
