import * as R from 'ramda';
import React from 'react';
import { Breadcrumb, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { history } from '@src/App';
import styleLess from './index.less';

// function PrefixBreadcrumbItemDefault() {
//     return <React.Fragment>
//         <Icon type="left" className={styleLess.prefixDefault} />
//     </React.Fragment>;
// }

export default function (props) {
    const {
        dataSource = [],
        // findMatching = _ => true,
        className = '',
        classNameLastItem = '',
        renderPrefix = _ => null,
        style = {}
    } = props;

    // const found = dataSource.find(group => {
    //     const [key] = group;
    //     return findMatching(key);
    // });

    // let foundItems = [];
    // let foundKey = null;
    //
    // if (found) {
    //     // eslint-disable-next-line prefer-destructuring
    //     [foundKey, foundItems] = found;
    //     if (typeof foundItems === 'string') {
    //         foundItems = [found];
    //     }
    // }

    return <Breadcrumb style={style} className={[styleLess.component, className].join(' ')}>
        {dataSource.map((item, index) => {
            const prefix = index === 0 && typeof renderPrefix === 'function' && renderPrefix();
            const isLast = index === dataSource.length - 1;
            const classNameItem = isLast ? classNameLastItem : '';
            if (typeof item === 'string') {
                return <Breadcrumb.Item className={classNameItem} key={index}>{prefix}{item}</Breadcrumb.Item>;
            }
            if (Array.isArray(item) && R.is(String, item[0])) {
                const [name, linkProps] = item;

                if (!linkProps) {
                    return <Breadcrumb.Item className={classNameItem} key={index}>{prefix}{name}</Breadcrumb.Item>;
                }

                const { to, ...restLinkProps } = linkProps;

                const propTo = typeof to === 'function' ? to(item) : to;

                return <Breadcrumb.Item className={classNameItem} key={index}>
                    {propTo ?
                        <Link to={propTo} {...restLinkProps}>{prefix}{name}</Link> :
                        <a onClick={() => { index === 0 && history.goBack(); }}>{prefix}{name}</a>
                    }
                </Breadcrumb.Item>;
            }
            return <Breadcrumb.Item>...</Breadcrumb.Item>;
        })}
    </Breadcrumb>;
}
