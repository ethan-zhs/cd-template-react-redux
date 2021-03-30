import { routerReducer } from 'react-router-redux';
import modelAccount from '@models/account';
import modelGlobal from '@models/global';
import modelMessage from '@models/message';

function combineModels(models, defaultModel) {
    return models.reduce(
        (combined, model) => ({
            sagas: { ...combined.sagas, [model.key]: model.saga },
            reducers: { ...combined.reducers, [model.key]: model.reducer }
        }),
        { sagas: { ...defaultModel.sagas }, reducers: { ...defaultModel.reducers } }
    );
}

export default combineModels([
    modelAccount,
    modelGlobal,
    modelMessage,
    // modelXXX
    // modelXXX2
], {
    reducers: {
        routing: routerReducer,
    }
});
