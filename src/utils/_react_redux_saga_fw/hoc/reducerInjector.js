import React, { Component } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import getInjectors from '@utils/_react_redux_saga_fw/injectReducer';

export default ({ key, reducer }) => (WrappedComponent) => {
    class ReducerInjector extends Component {
        constructor(props) {
            super(props);
            // contextStore需要从父组件传递过来
            const { injectReducer } = getInjectors(props.contextStore);
            injectReducer(key, reducer);
        }
        static WrappedComponent = WrappedComponent;
        static contextTypes = {
            store: PropTypes.object.isRequired
        };
        static displayName = `withReducer(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

        render() {
            return <WrappedComponent {...this.props}/>;
        }
    }
    return hoistNonReactStatics(ReducerInjector, WrappedComponent);
};
