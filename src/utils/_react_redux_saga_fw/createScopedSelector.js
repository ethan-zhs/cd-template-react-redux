import * as R from 'ramda';
import { createSelector } from 'reselect';

export default function createScopedSelector(scopeName) {
    const selectSettingManageRolesEdit = () => state => (
        Array.isArray(scopeName) ?
            state.getIn(scopeName) : state.get(scopeName)
    );
    return key => createSelector(
        selectSettingManageRolesEdit(),
        localState => {
            if (typeof R.prop('get', localState) !== 'function') return null;
            return localState.get(key);
        }
    );
}

export function createScopedSelectorMapping(scopeName) {
    const select = createScopedSelector(scopeName);
    return keys => keys.reduce((result, key) => {
        let propKey;
        let selectKey;
        if (typeof key === 'string') {
            propKey = key;
            selectKey = key;
        } else if (Array.isArray(key)) {
            [propKey, selectKey] = key;
        }
        if (typeof propKey !== 'string' || typeof selectKey !== 'string') {
            return result;
        }
        result[propKey] = select(selectKey);
        return result;
    }, {});
}

