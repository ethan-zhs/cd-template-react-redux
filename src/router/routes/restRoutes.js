import * as R from 'ramda';

export default [
    ['/developing', _ => import('../../containers/PageBlankDeveloping'), {
        menuName: '开发中',
        menuTargetPath: '/developing',
        permissionTags: R.T,
    }]
];
