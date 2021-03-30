/**
 * 基础工具方法
 * @module baseUtils
 */

const R = require('ramda');
const RA = require('ramda-adjunct');
const R_ = require('ramda-extension');
const L = require('lodash');

// compose 组合函数执行
export const composeEnhance = R.compose;

export const { isFunction, contained } = RA;

const { containsAll: containsAll_, containsAny: containsAny_ } = R_;

export const { debounce } = L;

export const containsAll = R.flip(containsAll_);
export const containsAny = R.flip(containsAny_);

export const { equals, propSatisfies, flatten } = R;


/**
 * 安全地 JSON.parse 
 * @param {object|array} obj 需要 JSON.parse 的对象/数组
 * @param {object|array} defaultTo JSON.parse 失败时的回退对象/数组
 */
export const safeParse = (obj, defaultTo = {}) => {
    try {
        return JSON.parse(obj);
    } catch (err) {
        return defaultTo;
    }
};

/**
 * 空值时返回默认值数组
 * @param {array|null|undefined} arr - 数组
 * @param {array} defaultTo - 数组默认值
 */
export const safeArray = (arr, defaultTo = []) =>
    R.ifElse(
        R.anyPass([RA.isEmptyArray, RA.isNotArray]),
        R.always(defaultTo),
        R.identity
    )(arr);

/**
 * 空值时返回默认字符串
 * @param {string|null|undefined} str - 字符串
 * @param {string} defaultTo - 字符串默认值
 */
export const safeString = (str, defaultTo = '') =>
    R.ifElse(
        R.anyPass([RA.isEmptyString, RA.isNotString]),
        R.always(defaultTo),
        R.identity
    )(str);

/**
 * 空值时返回默认数字
 * @param {number|null|undefined} num - 数字
 * @param {number} defaultTo - 数字默认值
 */
export const safeNumber = (num, defaultTo = 0) =>
    R.ifElse(
        R.anyPass([RA.isNaN, RA.isNotNumber]), // => 未处理 Infinity 的情况
        R.always(defaultTo),
        R.identity
    )(num);

/**
 * 空值时返回默认值对象
 * @param {object|null|undefined} arr - 对象
 * @param {object} defaultTo - 对象默认值
 */
export const safeObject = (obj, defaultTo = {}) =>
    R.ifElse(
        R.anyPass([R.equals({}), RA.isNotObj]),
        R.always(defaultTo),
        R.identity
    )(obj);

export const isNilOrEmptyObject = obj => R.anyPass([R.equals({}), R.isNil]);

/**
 * 空值时返回默认值
 * @param {any} value - 值
 * @param {any} defaultTo - 默认值
 */
export const safeDefault = (value, defaultTo = {}) =>
    R.ifElse(
        R.anyPass([R.isNil, R.isEmpty, Number.isNaN]),
        R.always(defaultTo),
        R.identity
    )(value);

/**
 * 安全地深路径取值, 避免多层 undifined 判断
 * @param {object|array} value - 要 len 取值的对象或数组
 * @param {array} lens - 取值路径数组
 */
export const safeLens = (value, lens) => R.view(R.lensPath(lens), value);

export const { isNil } = R;

export const isNotNil = R.compose(
    R.not,
    R.isNil
);

export function transformTreeData(
    data,
    parentId = 0,
    { idName = 'id', parentIdName = 'parentId', childrenName = 'children' }
    = { idName: 'id', parentIdName: 'parentId', childrenName: 'children' }
) {
    const tree = [];
    let temp;
    for (let i = 0; i < data.length; i++) {
        if (data[i][parentIdName] === parentId) {
            const obj = data[i];
            temp = transformTreeData(data, data[i][idName], { idName, parentIdName });
            if (temp.length > 0) {
                obj[childrenName] = temp;
            }
            tree.push(obj);
        }
    }
    return tree;
}

export function flattenTreeData(data, children = 'children') {
    let result = data;
    safeArray(data).forEach(item => {
        if (item && item[children]) {
            result = [...result, ...flattenTreeData(item[children])];
            delete item[children];
        }
    });
    return safeArray(result);
}

/**
 * 全大写下划线字符串转驼峰
 * 
 * @func
 * @param {string} Upper 全大写字符串
 * @return {string} 驼峰字符串
 * 
 * @example
 * const C1 = 'CC_STRING';
 * const C2 = 'CC_string';
 * const C3 = 'CC';
 * camelString(C1) // => 'ccString'
 * camelString(C2) // => 'ccString'
 * camelString(C3) // => 'cc'
 * 
 */
export function camelString(Upper) {
    const _tmpString = Upper.split('_');
    const camelStringArr = [];

    _tmpString.map((item, i) => {
        let newItem = item.toLowerCase();
        if (i) {
            newItem =
                newItem.substring(0, 1).toUpperCase() +
                newItem.substring(1, newItem.length);
        }
        camelStringArr.push(newItem);
        return void 0;
    });
    return camelStringArr.join('');
}

/**
 * 驼峰字符串转下划线
 * 
 * @func
 * @param {String} camel 驼峰字符串
 * @param {Boolean} upper 是否全大写下划线
 * @returns {String} 下划线字符串
 * 
 * @example
 * const c1 = 'ccString';
 * const c2 = 'CcString';
 * const c3 = 'cc';
 * underlineString(c1); // => CC_STRING
 * underlineString(c2); // => CC_STRING
 * underlineString(c3); // => CC
 */
export function underlineString(camel, upper = true) {
    const underline = camel
        .replace(/([A-Z])/g, '_$1')
        .replace(/^_/, '');
    return upper ? underline.toUpperCase() : underline.toLowerCase();
}

/**
 * 超过5位的数字转成带W单位，保留两位小数的数字
 * @param {string|number} num - 待转换数字
 * @returns {string} 处理过后带单位的字符串
 */
export function numFormat(num, len = 0) {
    const unitW = 'W';
    const unitY = '亿';
    const n = num.toString();

    const parseN = parseInt(n, 10);

    if (n.length >= 9) {
        if (parseN % 100000000 == 0) {
            return (
                parseN / 100000000 +
                '<span style="font-size: 25px;position:relative;bottom: 3px;">' +
                unitY +
                '</span>'
            );
        }
        if (parseN % 100000000 >= 90000000 && parseN % 10000000 >= 50000000) {
            return (
                parseInt(parseFloat(parseN / 100000000).toFixed(1), 10) +
                '<span style="font-size: 25px;position:relative;bottom: 3px;">' +
                unitY +
                '</span>'
            );
        }
        return (
            parseFloat(parseN / 100000000).toFixed(1) +
            '<span style="font-size: 25px;position:relative;bottom: 3px;">' +
            unitY +
            '</span>'
        );
    } else if (n.length >= 5) {
        if (parseN % 10000 == 0) {
            return (
                parseN / 10000 +
                '<span style="font-size: 30px;">' +
                unitW +
                '</span>'
            );
        }
        if (parseN % 10000 >= 9000 && parseN % 1000 >= 500) {
            return (
                parseInt(parseFloat(parseN / 10000).toFixed(1), 10) +
                '<span style="font-size: 30px;">' +
                unitW +
                '</span>'
            );
        }
        return (
            parseFloat(parseN / 10000).toFixed(1) +
            '<span style="font-size: 30px;">' +
            unitW +
            '</span>'
        );
    }
    return parseFloat(n);
}

/**
 * 获取时间字符串
 * */
export function dateTransform(time, bool) {
    if (!time) {
        return void 0;
    }
    const date = new Date(time);
    const year = date.getFullYear();
    const month =
        date.getMonth() + 1 < 10
            ? '0' + (date.getMonth() + 1)
            : date.getMonth() + 1;
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const hours =
        date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minutes =
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const mills =
        date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    const str =
        '' +
        year +
        '-' +
        month +
        '-' +
        day +
        ' ' +
        hours +
        ':' +
        minutes +
        ':' +
        mills;
    const str2 = '' + year + '-' + month + '-' + day;
    if (!bool) {
        return str;
    }
    return str2;
}

/**
 * 去除字符串两边空格
 * @param {string} str - 待处理字符串
 * @returns {string} str - 去除两边空格的字符串
 */
export const trimSpace = str => R.trim(str);

/**
 * 将数据处理成树形下拉选择框所接受的数据结构
 * @param {array} treeData - 数组元数据
 * @param {string} title - 展示属性名
 * @param {string} value - 传值属性名
 * @param {string} children - 子数组属性名
 * @returns 返回树形结构数据
 */
export const treeSelectorAdapter = (
    rawData,
    { title = 'title', value = 'value', key = value, children = 'children' }
) =>
    safeArray(rawData).map(data => ({
        title: data[title],
        value: data[value],
        key: data[key],
        children: treeSelectorAdapter(data[children], { title, value, key, children })
    }));

/**
 * 计算更新时间
 * @param {Date} time - 时间戳
 * @returns calTime - timeAfter: 距离时间, timeDate: 时间格式 (yyyy-mm-dd hh:mm:ss)
 */
export function calUpdateTime(time) {
    // Date.prototype.format = function(fmt) {
    const format = function (timeDate, fmt) {
        const o = {
            'M+': timeDate.getMonth() + 1, // 月份
            'd+': timeDate.getDate(), // 日
            'h+': timeDate.getHours(), // 小时
            'm+': timeDate.getMinutes(), // 分
            's+': timeDate.getSeconds(), // 秒
            'q+': Math.floor((timeDate.getMonth() + 3) / 3), // 季度
            S: timeDate.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                (timeDate.getFullYear() + '').substr(4 - RegExp.$1.length)
            );
        }
        Object.keys(o).forEach(k => {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length == 1
                        ? o[k]
                        : ('00' + o[k]).substr(('' + o[k]).length)
                );
            }
        });
        return fmt;
    };

    const nowDate = new Date();
    const timeDate = new Date(
        time.toString().indexOf('-') >= 0 ? time.replace(/-/gi, '/') : time
    );
    let timeAfter = parseInt(Math.abs(nowDate - timeDate) / 1000 / 60, 10);
    if (timeAfter < 60) {
        timeAfter = (timeAfter <= 0 ? 1 : timeAfter) + '分钟前';
    } else if (timeAfter >= 60 && timeAfter < 24 * 60) {
        timeAfter = parseInt(timeAfter / 60, 10) + '小时之前';
    } else {
        timeAfter = parseInt(timeAfter / 60 / 24, 10) + '天前';
    }

    return {
        timeDate: format(timeDate, 'yyyy-MM-dd hh:mm:ss'),
        timeDateStr: format(timeDate, 'yyyy-MM-dd'),
        timeAfter: timeAfter
    };
}

/**
 * 获取今天开始或者今天结束的时间戳 */
export function dateTimesTamp(time, isToday) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const days = date.getDate();
    if (!isToday) {
        return new Date('' + year + '/' + month + '/' + days + ' 00:00:00').getTime();
    }

    return new Date('' + year + '/' + month + '/' + days + ' 23:59:59').getTime();
}

// 计算时间
export function calcuteTime(time) {
    if (time) {
        time = new Date(time);
        const _time = [
            time.getFullYear(),
            time.getMonth() >= 9 ? time.getMonth() + 1 : '0' + (time.getMonth() + 1),
            time.getDate() >= 10 ? time.getDate() : '0' + time.getDate()
        ];
        return _time.join('-');
    }
    return void 0;
}
/**
 * 获取当天时间 返回 时/分/秒
 * */
export function getClearTime(time) {
    if (!time) {
        return void 0;
    }
    if (typeof time === 'string') {
        return time;
    }
    
    const date = new Date(time);
    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return hours + ':' + minutes + ':' + seconds;
}

/**
 * 获取当天时间 返回 年/月/日
 * */
export function getClearDate(time) {
    if (typeof time === 'string') {
        return time;
    }
    
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const days = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate();
    return year + '/' + month + '/' + days + ' ';
}

/**
 * 对 fields 值进行转换处理
 * @param {object} values - fields 对象
 * @param {array} rulers - 转换规则数组
 * @param {string} ruler.name - field 字段名
 * @param {function} ruler.rule - field 处理函数 (注入 value, key, obj 参数)
 */
export const transformFields = (values, rulers) =>
    R.compose(
        R.mergeAll,
        R.mapObjIndexed(
            (value, key, obj) =>
                /* eslint-disable no-shadow */
                R.cond([
                    ...R.map(ruler => [
                        R.equals(ruler.name),
                        () => ruler.rule(value, key, obj)
                    ])(rulers),
                    [R.T, R.always(value)]
                ])(key)
            /* eslint-enable no-shadow */
        )
    )(values);

export const ifElseNil = (value, ifFn, elseFn) =>
    R.ifElse(R.isNil, ifFn, elseFn)(value);

/**
 * 数组去重 (根据属性)
 * @param {string} prop - 去重判定属性
 * @param {array} arr - 需要去重的数组
 */
export const uniqWithProp = (prop, arr) => R.uniqWith(R.eqProps(prop))(arr);

/**
 * 过滤并映射数组
 * @func
 * @param {array} data - 需要过滤后映射的数组
 * @param {function} filterFn - 过滤函数
 * @param {function} mapFn - 映射函数
 */
export const filterMap = (data, filterFn, mapFn) =>
    R.compose(
        R.map(mapFn),
        R.filter(filterFn)
    )(data);

/**
 * 根据数组顺序读取对象属性依次返回
 * @param {object} obj - 待属性排序对象
 * @param {array} arr - 字符串顺序数组
 */
export const findObjPropInOrder = (obj, arr, lensPath) => {
    const result = [];
    R.forEach(value => {
        if (obj[value]) {
            result.push(
                (lensPath ? R.view(R.lensPath(lensPath)) : R.identity)(
                    obj[value]
                )
            );
        }
    })(arr);
    return result;
};

// => 判断数组是否为空
export const isNilArray = arr => R.anyPass([R.isNil, R.equals([])])(arr);

// => 判断字符串是否为空
export const isNilString = str => R.anyPass([R.isNil, R.equals('')])(str);

// => 判断对象是否为空
export const isNilObject = obj => R.anyPass([R.isNil, R.equals({})])(obj);

// => 交换数组位置
export const swapPoiArray = (arr, i1, i2) => {
    const result = Array.from(arr);
    const [removed] = result.splice(i1, 1);
    result.splice(i2, 0, removed);
    return result;
};

// Promise
export const promiseEnhance = asyncFn => (...args) => {
    let r;
    let rj;
    const p = new Promise((res, rej) => {
        r = res;
        rj = rej;
    });
    asyncFn({ r, rj }, ...args);
    return p;
};


export const twinkleUrlRegExp = (url) => {
    // eslint-disable-next-line no-useless-escape
    return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(url);
};
