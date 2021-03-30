// dependence
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import createScopedSelector from '@utils/_react_redux_saga_fw/createScopedSelector';
// import { isFunction } from '@utils/baseUtils';

/**
 * 例子(1) 按钮展示控制
 * <Authorized
 *   authKeys={[
 *     ['canEdit', 'i_can_edit'],
 *     ['canRemove', 'i_can_remove']
 *   ]}
 *   render={({ canEdit, canRemove }) => {
 *     {canEdit && <Anything to='/xxx/edit'>编辑</Anything>}
 *     {canRemove && <React.Fragment>
 *         {canEdit && <span>|</span>}
 *         <Anything onClick={this.remove}>删除</Anything>
 *     </React.Fragment>}
 *   }/>
 */

/**
 * 例子(2) 子路由鉴权
 * 将这个组件包裹在页面根组件中
 * <Authorized
 *   authKeys={[
 *     ['canEdit', 'i_can_edit'],
 *     ['canAdd', 'i_can_add']
 *   ]}
 *   render={({ canEdit, canRemove }) => {
 *     <Switch>
 *        <Route path={'/xxx/add'} render={routeProps => {
 *          if (!canAdd) {
 *            return <Redirect to="/xxx"/>;
 *          }
 *          return <PageAdd/>;
 *        }}/>
 *        <Route path={'/xxx/edit'} render={routeProps => {
 *          if (!canEdit) {
 *            return <Redirect to="/xxx"/>;
 *          }
 *          return <PageEdit/>;
 *        }}/>
 *     </Switch>
 *   }/>
 */

const selectGlobalAccount = createScopedSelector(['account']);

/**
 * 鉴权组件
 */
@connect(createStructuredSelector({
    checkUserPermsByKey: selectGlobalAccount('checkUserPermsByKey')
}), {})
class Authorized extends PureComponent {
    static propTypes = {
        /** []<[prop, authKey]> 一个包含[prop, authKey]结构的数组  */
        authKeys: PropTypes.arrayOf(PropTypes.array),
        /** 渲染函数 */
        render: PropTypes.func,
        // /** 函数子组件 （children 和 render 可互换，传了其中一个另一个可不传）  */
        // children: PropTypes.func
    }
    render() {
        const {
            children = [],
            render = _ => null,
            checkUserPermsByKey = _ => true,
            authKeys = [],
            // ...props
        } = this.props;

        if (children.length > 0) {
            console.warn('<Authorized authKeys={[...]} render={...}/>, 请使用render属性来定义子节点');
        }

        const propsAuthKeysMapping = authKeys.reduce((mapping, pair) => {
            if (Array.isArray(pair)) {
                const [toProp, key = toProp] = pair;
                if (typeof key === 'string') {
                    mapping[toProp] = checkUserPermsByKey(key);
                } else if (typeof key === 'function') {
                    mapping[toProp] = key(k => checkUserPermsByKey(k));
                }
            }
            if (typeof pair === 'string') {
                const key = pair;
                mapping[key] = checkUserPermsByKey(key);
            }
            return mapping;
        }, {});

        // if (isFunction(children)) {
        //     // 不可以使用函数作为child, 应该使用render方法去渲染子组件
        //     return children({ ...propsAuthKeysMapping });
        // }

        // render只传递当前组件的功能props即可, 不需要传递props, 应在使用者当前的作用域自行处理
        return render({ ...propsAuthKeysMapping });
    }
}

export default Authorized;
