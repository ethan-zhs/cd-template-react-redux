import { createModel } from '@utils/_react_redux_saga_fw/createModel';

// 对于仅引用全局model的组件，可以通过这个model用来占位(createModuleInjectorBy的第一个参数)，
// 不要添加任何业务逻辑在这个文件里面
export default createModel({
    namespace: 'noop',
    state: {},
    sagas: { * noop() {} }
});
