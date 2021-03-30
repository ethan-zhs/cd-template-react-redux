import { combineReducers } from 'redux-immutable';
import defaultStore from './constants/defaultModels';

const {
    reducers: initialReducers = {}
} = defaultStore;

export default function createReducer(injectedReducers) {
    return combineReducers({
        ...initialReducers,
        ...injectedReducers
    });
}
