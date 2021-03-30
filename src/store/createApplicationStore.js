import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import { fromJS } from 'immutable';
import createSagaMiddleware from 'redux-saga';
import { routerReducer } from 'react-router-redux';
import combineReducersWithDefault from './combineReducersWithDefault';
import defaultStore from './constants/defaultModels';

const { sagas: initialSagas = {} } = defaultStore;

const isProd = process.env.NODE_ENV === 'production';

const sagaMiddleware = createSagaMiddleware();

const asyncDataPromiseConsumeMiddleware = ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
        return action(dispatch, getState);
    }
    return next(action);
};

function createApplicationStore(initialState = {}, history) {
    // console.log(`require('./middleware/logger')`, require('./middleware/logger'));

    const middleWares = isProd ? [
        asyncDataPromiseConsumeMiddleware,
        sagaMiddleware,
        routerMiddleware(history)
    ] : [
        asyncDataPromiseConsumeMiddleware,
        sagaMiddleware,
        routerMiddleware(history),
        // ...(process.env.REDUX_MIDDLEWARE_DISABLE_REDUX_LOGGER ?
        //   [] : [require('./middleware/logger').default])
    ];

    const enhancers = [
        applyMiddleware(...middleWares)
    ];

    const composeEnhancers =
        process.env.NODE_ENV !== 'production' &&
        typeof window === 'object' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
            ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                shouldHotReload: false
            })
            : compose;

    const store = createStore(
        combineReducersWithDefault(),
        fromJS(initialState),
        composeEnhancers(...enhancers)
    );

    store.runSaga = sagaMiddleware.run;
    const globalSagasKeys = Object.keys(initialSagas);
    globalSagasKeys.map(item => store.runSaga(initialSagas[item]));

    store.injectedReducers = {};
    store.injectedSagas = {};

    if (module.hot) {
        module.hot.accept('./combineReducersWithDefault.js', () => {
            store.replaceReducer(combineReducersWithDefault(store.injectedReducers));
        });
    }

    return store;
}

export default createApplicationStore;
