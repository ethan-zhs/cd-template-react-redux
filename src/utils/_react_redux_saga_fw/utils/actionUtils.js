import { underlineString } from './baseUtils';

// 构造对象action
export function action(type, payload = {}) {
    return { type, ...payload };
}

export function commonAction(type, module) {
    return module + '_' + type;
}

// => 根据驼峰字符串返回 key(驼峰) 和 Module(下划线)
//    和已经默认前置 Module 参数的 apiAction 和 commonAction 方法
export function createKeyModule(key) {
    const Module = underlineString(key);
    return {
        key,
        Module,
        commonAction: type => commonAction(type, Module)
    };
}
