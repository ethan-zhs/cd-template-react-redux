import * as R from 'ramda';
import pathToRegexp from 'path-to-regexp';
import commonRoutes from '@router/routes/commonRoutes';

const commonRoutesPatterned = commonRoutes.map(([targetPathPattern, _, props]) => ([pathToRegexp(targetPathPattern), props]));

export default (targetPaths, checkUserPermsByKey = _ => true) => {
    return targetPaths.map(([targetPath, targetData = null]) => {
        // eslint-disable-next-line no-unused-vars
        const found = R.find(([regexp]) => regexp.test(targetPath), commonRoutesPatterned);
        const [regexpTargetPath, props] = found || [];
        if (props) {
            if (typeof props.permissionTags === 'function' && !props.permissionTags(checkUserPermsByKey)) {
                return null;
            }
            if (Array.isArray(props.permissionTags) && props.permissionTags.some(tag => !checkUserPermsByKey(tag))) {
                return null;
            }
            return [props.menuName || targetPath, targetData, targetPath, regexpTargetPath];
        }
        return null;
    }).filter(Boolean);
};
