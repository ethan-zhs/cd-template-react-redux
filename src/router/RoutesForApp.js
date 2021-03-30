import * as R from 'ramda';
import React from 'react';
import { Spin } from 'antd';
import { Switch, Route, Redirect } from 'react-router';
import { wrapLoginAuth, wrapHomeAuth } from './routes/wrapAuthRoutes';
import asyncComponent from './asyncComponent';
// import LoginPage from '@containers/Login';
// import RootLayoutContent from '@components/_layout/RootLayoutContent/index.js';
import commonRoutes from './routes/commonRoutes';
import pathToRegexp from 'path-to-regexp';
import getMenuSiderNav, { findFirsRoutePathInMenuVisible } from '@constants/menuSiderNav';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import modelAccount from '@models/account';
import modelGlobal from '@models/global';
// import LayoutHeaderRightUserInfo from '@components/_shared/LayoutHeaderRightUserInfo/index.js';
import classNameLess from './RoutesForApp.less';
import { createModuleInjectorBy } from '@utils/_react_redux_saga_fw/createModel';

const RootLayoutContent = asyncComponent({
    loader: () => import('@components/_layout/RootLayoutContent/index.js')
});

const LayoutHeaderRightUserInfo = asyncComponent({
    loader: () => import('@components/_shared/LayoutHeaderRightUserInfo/index.js')
});

const RootHomeAuth = connect(createStructuredSelector({
    ...modelAccount.stateToSelectors(['getUserInfoMenu', 'isProcessingLogout', 'userInfo', 'checkUserPermsByKey']),
    ...modelGlobal.stateToSelectors(['isSiderNavCollapsed'])
}), {
    toogleSiderNavCollapsed: modelGlobal.sagaToActionDispatch('toogleSiderNavCollapsed')
})(wrapHomeAuth(props => {
    const {
        authFailedRedirect,
        getUserInfoMenu = _ => [],
        isSiderNavCollapsed,
        toogleSiderNavCollapsed,
        isProcessingLogout,
        userInfo,
        checkUserPermsByKey
    } = props;

    if (authFailedRedirect) return authFailedRedirect;
    return <Spin wrapperClassName={classNameLess.spinPendingLayoutContent} spinning={isProcessingLogout}>
        <RootLayoutContent
            {...props}
            contentHeader={<LayoutHeaderRightUserInfo history={props.history}/>}
            menuSiderNav={getMenuSiderNav(getUserInfoMenu, userInfo.toJS(), checkUserPermsByKey)}
            isSiderNavCollapsed={isSiderNavCollapsed}
            toogleSiderNavCollapsed={toogleSiderNavCollapsed}
            // checkMenuItemIsVisible={checkUserPermsByKey}
        />
    </Spin>;
}));

function WrapComponentWithAuth(pattern, Component, options = {}) {
    @createModuleInjectorBy(null, {
        mapStateToProps: {
            ...modelAccount.stateToSelectors(['checkUserPermsByKey', 'userInfo'])
        }
    })
    class WrappedComponentWithAuth extends React.Component {
        render() {
            const {
                userInfo,
                checkUserPermsByKey
            } = this.props;
            const checkPass = checkUserPermsByKey;
            if (typeof options.permissionUserInfo === 'function') {
                if (!options.permissionUserInfo(userInfo)) {
                    return <Redirect to={findFirsRoutePathInMenuVisible(checkUserPermsByKey)}/>;
                }
            }
            if (typeof options.permissionTags === 'function') {
                if (options.permissionTags(checkPass)) {
                    return <Component {...this.props}/>;
                }
                return <Route key={pattern} path="*" render={_ => {
                    if (options.isRedirectFirstMenuVisible) {
                        return <Redirect to={findFirsRoutePathInMenuVisible(checkUserPermsByKey)}/>;
                    }
                    return <Redirect to={'/empty'} />;
                }} />;
            }
            if (R.isNil(options.permissionTags) || !Array.isArray(options.permissionTags)) {
                return <Component {...this.props}/>;
            }
            if (options.permissionTags.every(checkPass)) {
                return <Component {...this.props}/>;
            }
            return <Route key={pattern} path="*" render={_ => {
                if (options.isRedirectFirstMenuVisible) {
                    return <Redirect to={findFirsRoutePathInMenuVisible(checkUserPermsByKey)}/>;
                }
                return <Redirect to={'/empty'} />;
            }} />;
        }
    }

    return WrappedComponentWithAuth;
}

const commonRoutesWithComponent = commonRoutes.map(([pattern, ComponentToLoad, props], i) => {
    return [pattern, WrapComponentWithAuth(pattern, asyncComponent({
        loader: ComponentToLoad,
        props: {
            ...props,
            getPathnameCurrentRoute: pathToRegexp.compile(pattern)
        }
    }), props), props];
});

const RoutesLoginPageAsync = wrapLoginAuth(asyncComponent({
    loader: () => import('@containers/Login')
}));

class RouteSwitch extends React.Component {
    render() {
        return (
            <Switch>
                {commonRoutesWithComponent.map(([pattern, Component], i) => {
                    return <Route key={pattern} path={pattern} exact component={Component} />;
                })}
                <Route path="*" render={_ => <Redirect to={'/home'} />} />
            </Switch>
        );
    }
}

export default (class extends React.Component {
    // componentDidMount() {
    //     console.log('didMount')
    // }
    render() {
        const {
            propsSwitch = {}
        } = this.props;

        const getRoutesActual = () => [
            <Route key={'login'} path="/login" component={RoutesLoginPageAsync}/>,
            <Route key={'*'} path="/*" render={props => {
                return <RootHomeAuth {...props}>
                    <RouteSwitch/>
                </RootHomeAuth>;
            }}/>
        ];

        return <Switch {...propsSwitch}>
            {getRoutesActual()}
        </Switch>;
    }
});
