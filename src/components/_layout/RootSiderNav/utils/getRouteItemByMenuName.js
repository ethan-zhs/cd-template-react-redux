import * as R from 'ramda';
// import pathToRegexp from 'path-to-regexp';
import commonRoutes from '@router/routes/commonRoutes';

export default function getRouteItemByMenuName(menuName) {
    const found = R.find(
        ([_, __, withMenuName]) => R.propEq('menuName', menuName, withMenuName || {}),
        commonRoutes
    );
    return found || null;
}
