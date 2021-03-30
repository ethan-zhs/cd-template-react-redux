import * as R from 'ramda';
import restRoutes from './restRoutes';

// containers/xxx 里的目录名称要和url路径的名称保持一致
// 例如 /one-big-sheep 对应 containers/PageOnceBigSheep
const commonRoutes = [
    ['/home', _ => import('../../containers/Home/index.js'), {
        menuName: '首页',
        menuTargetPath: '/home',
        // permissionTags: ['index'],
        permissionTags: R.T,
        isRedirectFirstMenuVisible: true,
    }],
    ['/page-a/:type?/:id?', _ => import('../../containers/PageA/index.js'), {
        menuName: '页面A',
        permissionTags: R.T,
        menuTargetPath: '/page-a',
    }],
    ['/page-b', _ => import('../../containers/PageB/index.js'), {
        menuName: '页面B',
        permissionTags: R.T,
        menuTargetPath: '/page-b',
    }],
    ...restRoutes,
    ['/empty', _ => import('../../containers/PageEmpty')],
    // ...spreadRoutes
    // ...spreadRoutes
    // ...spreadRoutes
];

export default commonRoutes;
