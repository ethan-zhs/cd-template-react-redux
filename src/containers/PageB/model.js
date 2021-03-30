import { createModel, updateState } from '@utils/_react_redux_saga_fw/createModel';

export default createModel({
    namespace: 'containers/PageB',
    state: {
        // isRequesting: false, // 尽量不要把界面相关的状态存放在state
        listForTable: []
    },
    sagas: {
        * getListForTable({ payload }, { put }) {
            yield updateState(put, {
                listForTable: [
                    { id: 0, title: 'aaaa' },
                    { id: 1, title: 'bbbb' },
                    { id: 2, title: 'cccc' },
                    { id: 2, title: 'dddd' },
                    { id: 2, title: 'eeee' },
                ]
            });
        }
    }
});

