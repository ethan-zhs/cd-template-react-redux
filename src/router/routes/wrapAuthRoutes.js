// import PageShell from 'components/PageShell';
import React from 'react';
import { message, Spin } from 'antd';
import { Redirect, Route } from 'react-router';
import { connect } from 'react-redux';
import accountModel, { isWasLogin } from '@models/account';
import classNameLess from './wrapAuthRoutes.less';

const defaultAuth = {
    authedSelector: () => false,
    authFailedRedirect: () => null,
    AuthenticatingComponent: () => null,
    authenticatingSelector: () => false,
    authAction: null,
    // AuthenFailedComponent: null
};

const createAuthRoute = ({
    authedSelector = defaultAuth.authedSelector,
    authFailedRedirect = defaultAuth.authFailedRedirect,
    AuthenticatingComponent = defaultAuth.AuthenticatingComponent,
    authenticatingSelector = defaultAuth.authenticatingSelector,
    // AuthenFailedComponent = defaultAuth.AuthenFailedComponent,
    authAction = defaultAuth.authAction,
    afterAuthAction = _ => null,
    route,
    wrappedName = 'withAuth'
}) => (WrappedComponent) => {
    class AuthRoute extends React.Component {
        static displayName = `${wrappedName}(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
        constructor(props) {
            super(props);
            // console.log(route);
            this.judgeShouldAuthOrNot();
        }
        judgeShouldAuthOrNot = async () => {
            if (!this.props.authed && !this.props.authenticating && this.props.authAction) {
                // console.log('auth: ', this.props.authed, this.props.authenticating);
                // console.log('do auth');
                // this.state.isAuth to make sure the first time render not to redirect
                this.state = { isAuthing: true };
                try {
                    await this.props.authAction();
                } finally {
                    await afterAuthAction(this.props);
                    this.setState({ isAuthing: false });
                }
            } else {
                this.state = {
                    isAuthing: false
                };
            }
        }

        componentDidUpdate() {
            if (this.props.authenticating && this.state.isAuthing) {
                this.setState({ isAuthing: false });
            }
        }

        render() {
            const {
                authed,
                authenticating
            } = this.props;
            // console.log('render auth: ', authed, authenticating, authFailedRedirect(), this.props);
            if (this.state.isAuthing || authenticating) {
                return <AuthenticatingComponent {...this.props}/>;
            }
            return <WrappedComponent
                {...this.props}
                {...!authed && {
                    authFailedRedirect: <Route render={() => <Redirect to={authFailedRedirect()}/>}/>
                }}
            />;
        }
    }

    return connect(state => ({
        authenticating: authenticatingSelector(state),
        authed: authedSelector(state)
    }), authAction ? {
        authAction
    } : null)(AuthRoute);
};

export const wrapHomeAuth = createAuthRoute({
    authedSelector: state => (state.getIn(['account', 'isLogin'])),
    authenticatingSelector: state => state.getIn(['global', 'account', 'isRequesting']),
    AuthenticatingComponent: _ => <Spin className={classNameLess.spinPending} spinning={true}/>,
    authAction: accountModel.sagaToActionDispatch('getAccountInfo'),
    afterAuthAction: props => {
        // console.log('afterAuthAction', props, props.authed);
        if (!props.authed && isWasLogin) {
            // message.warn('登录信息已过期, 请重新登录!');
        }
    },
    authFailedRedirect: () => '/login',
    wrappedName: 'withHomeAuth'
});

export const wrapLoginAuth = createAuthRoute({
    authAction: accountModel.sagaToActionDispatch('getAccountInfo'),
    authedSelector: state => (
        !state.getIn(['account', 'isLogin'])
    ),
    authenticatingSelector: state => state.getIn(['global', 'account', 'isRequesting']),
    AuthenticatingComponent: _ => <Spin className={classNameLess.spinPending} spinning={true}/>,
    authFailedRedirect: () => '/home',
    afterAuthAction: props => {
        if (!props.authed && isWasLogin) {
            console.log();
        }
    },
    wrappedName: 'withLoginAuth'
});
