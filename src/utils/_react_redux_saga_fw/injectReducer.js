import combineReducersWithDefault from '@store/combineReducersWithDefault';

function injectReducerFactory(store) {
    return function injectReducer(key, reducer) {
        if (Reflect.has(store.injectedReducers, key) && store.injectedReducers[key] === reducer) {
            return;
        }
        store.injectedReducers[key] = reducer;
        store.replaceReducer(combineReducersWithDefault(store.injectedReducers));
    };
}

export default function getInjectors(store) {
    return {
        injectReducer: injectReducerFactory(store)
    };
}
