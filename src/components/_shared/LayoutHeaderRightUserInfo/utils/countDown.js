import { delay } from 'redux-saga';
import { createCacheStorage } from '@utils/cacheStorage';

const cacheStorage = createCacheStorage(30 * 60 * 1000, '--COUNT_DOWN--');

const tasksCountdown = {};

// const IS_DEBUG = true;

export function getCountdownTaskByKey(key, duration, step = 1000, initialStarted = null) {
    const KEY_STEP = `${key}_countdown_timestamp_step`;
    const KEY_START = `${key}_countdown_timestamp_start`;
    if (tasksCountdown[key]) return tasksCountdown[key];
    const callbacksOnStep = [];
    let isShouldContinue = true;
    let lastCountdownPassed = initialStarted ? Date.now() - initialStarted : 0;
    const task = (async _ => {
        cacheStorage.setItem(KEY_START, initialStarted || Date.now());
        // eslint-disable-next-line no-restricted-syntax
        for (const fn of callbacksOnStep) fn(0);
        while (lastCountdownPassed < duration) {
            // IS_DEBUG && console.log('count down on step...');
            if (!isShouldContinue) break;
            // eslint-disable-next-line no-restricted-syntax
            for (const fn of callbacksOnStep) {
                fn(lastCountdownPassed);
            }
            cacheStorage.setItem(KEY_STEP, Date.now());
            // eslint-disable-next-line no-await-in-loop
            await delay(step);
            // eslint-disable-next-line
            lastCountdownPassed = lastCountdownPassed + step;
        }
        cacheStorage.removeItem(KEY_START);
        cacheStorage.removeItem(KEY_STEP);
        tasksCountdown[key] = null;
        // IS_DEBUG && console.log('count down done...');
    })();
    tasksCountdown[key] = task;
    task.onStep = fn => {
        callbacksOnStep.push(fn);
        return task;
    };
    task.cancel = _ => {
        isShouldContinue = false;
        // IS_DEBUG && console.log('count down canceled');
    };
    return task;
}

export function cancelCountdownTaskByKey(key) {
    const task = tasksCountdown[key];
    if (!task) return;
    task.cancel();
}

export function getCountdownTaskExistedByKey(key, duration, step = 1000) {
    if (tasksCountdown[key]) return tasksCountdown[key];
    const KEY_START = `${key}_countdown_timestamp_start`;
    const lastStarted = +cacheStorage.getItem(KEY_START);
    if (!lastStarted || Date.now() - lastStarted >= duration) {
        cacheStorage.removeItem(KEY_START);
        return null;
    }
    return getCountdownTaskByKey(key, duration, step, lastStarted);
}
