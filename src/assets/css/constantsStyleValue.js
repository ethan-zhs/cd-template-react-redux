import * as R from 'ramda';
import antdModifyVarsRaw from './antd_modifyvars';
import camelCase from 'camel-case';

export default Object.keys(antdModifyVarsRaw).reduce((result, key) => {
    return R.assoc(camelCase(key), antdModifyVarsRaw[key], result);
}, {});
