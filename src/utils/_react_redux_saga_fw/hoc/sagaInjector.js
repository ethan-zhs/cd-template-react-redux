import React, { Component } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import getInjectors from 'utils/injectorSaga';

export default ({ key, saga, mode }) => (WrappedComponent) => {
    class SagaInjector extends Component {
        constructor(props) {
            super(props);
            // contextStore需要从父组件传递过来
            const { injectSaga } = getInjectors(props.contextStore);
            injectSaga(key, { saga, mode }, this.props);
        }
        static WrappedComponent = WrappedComponent;
        static contextTypes = {
            store: PropTypes.object.isRequired
        };
        static displayName = `withSaga(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

        componentWillUnmount() {
            const { ejectSaga } = this.injectors;
            ejectSaga(key);
        }

        render() {
            return <WrappedComponent {...this.props}/>;
        }
    }
    return hoistNonReactStatics(SagaInjector, WrappedComponent);
};
