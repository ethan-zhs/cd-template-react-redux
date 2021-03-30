// import createReducer from '../reducers';

const RESTART_ON_REMOUNT = 0;
const DAEMON = 1;
const ONCE_TILL_UNMOUNT = 2;
// const modes = [RESTART_ON_REMOUNT, DAEMON, ONCE_TILL_UNMOUNT];

function injectSagaFactory(store) {
    return function injectSaga(key, descriptor = {}, args) {
        const newDescriptor = { ...descriptor, mode: descriptor.mode || RESTART_ON_REMOUNT };
        const { saga, mode } = newDescriptor;

        let hasSaga = Reflect.has(store.injectedSagas, key);

        if (process.env.NODE_ENV !== 'production') {
            const oldDescriptor = store.injectedSagas[key];
            if (hasSaga && oldDescriptor.saga !== saga) {
                oldDescriptor.task && oldDescriptor.task.cancel();
                hasSaga = false;
            }
        }

        if (!hasSaga || (hasSaga && mode !== DAEMON && mode !== ONCE_TILL_UNMOUNT)) {
            const lastDescriptor = store.injectedSagas[key];
            const { task: lastTask } = lastDescriptor || {};
            if (lastTask && lastTask.isRunning()) {
                console.warn('saga key:', key, 'already running as a task, duplicated task is stoped');
                lastTask.cancel(); // 避免重复启动多个saga;
            }
            store.injectedSagas[key] = { ...newDescriptor, task: store.runSaga(saga, args) };
        }
    };
}

function getEjectSagaFactory(store) {
    return function getEjectSaga(key) {
        if (Reflect.has(store.injectedSagas, key)) {
            const descriptor = store.injectedSagas[key];
            const { task } = descriptor;
            if (descriptor.mode !== DAEMON) {
                return _ => { task && task.isRunning() && task.cancel(); };
            }
        }
        return _ => null;
    };
}

export default function getInjectors(store) {
    return {
        injectSaga: injectSagaFactory(store),
        getEjectSaga: getEjectSagaFactory(store)
    };
}
