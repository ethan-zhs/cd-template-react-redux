import { createModel, updateState } from '@utils/_react_redux_saga_fw/createModel';

export default createModel({
    namespace: 'containers/PageA/sub',
    state: {
        // isRequesting: false, // 尽量不要把界面相关的状态存放在state
        detail: 'detail'
    },
    sagas: {
        * getDetail({ payload }, { put }) {
            yield updateState(put, { detail: 'detail...' });
        }
    }
});

