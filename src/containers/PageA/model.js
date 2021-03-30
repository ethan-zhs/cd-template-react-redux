import { createModel, updateState } from '@utils/_react_redux_saga_fw/createModel';

export default createModel({
    namespace: 'containers/PageA',
    state: {
        // isRequesting: false, // 尽量不要把界面相关的状态存放在state
        list: []
    },
    sagas: {
        * getList({ payload }, { put }) {
            yield updateState(put, { list: [1, 2, 3] });
        }
    }
});

