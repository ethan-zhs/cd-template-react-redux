import { createLogger } from 'redux-logger';
import { Iterable } from 'immutable';

const stateTransformer = (state) => {
    if (Iterable.isIterable(state)) {
        return state.toJS();
    }
    return state;
};

export default createLogger({
    stateTransformer
});
