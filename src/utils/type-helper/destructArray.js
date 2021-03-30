import * as R from 'ramda';

export default function (targetArray = [], keys) {
    if (!Array.isArray(targetArray)) return {};
    return targetArray.reduce((result, item, index) => {
        const key = keys[index] || index;
        if (R.isNil(key)) return result;
        return {
            ...result,
            [key]: item
        };
    }, {});
}
