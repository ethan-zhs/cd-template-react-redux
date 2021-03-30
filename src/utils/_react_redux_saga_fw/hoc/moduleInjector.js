import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import hoistNonReactStatics from 'hoist-non-react-statics';
import getReducerInjectors from '@utils/_react_redux_saga_fw/injectReducer';
import getSagaInjectors from '@utils/_react_redux_saga_fw/injectorSaga';
import ImmutableComponentWrapper from './ImmutableComponentWrapper';
import { createStructuredSelector } from 'reselect';

const getDispatch = self => (
    self.props.contextStore ?
        self.props.contextStore.dispatch :
        self.context.store.dispatch
);

export default ({
    authKey, // => authKey
    key, // => saga && reducer's name
    reducer, // => reducer
    saga, // => saga
    sagaMode, // => saga mode
    connectOpt = {}, // => connect(mapStateToProps, mapDispatchToProps)
    // cssModule,
    toJS = true, // => immutable toJS
    asyncData = [], // => prefetch api
    clearData = [], // => clear actions
    models = [], // => actions && state models,
    beforeEjectSaga = _ => null
}) => WrappedComponent => {
    class ModuleInjector extends Component {
        static WrappedComponent = WrappedComponent;
        static contextTypes = {
            store: PropTypes.object.isRequired
        };
        static displayName = `withModule(${WrappedComponent.displayName ||
        WrappedComponent.name ||
        'Component'})`;
        constructor(props, ctx) {
            super(props, ctx);
            // console.warn(
            //     `${ModuleInjector.displayName}'s props && context`,
            //     props,
            //     ctx
            // );
            this.state = { moduleInjectedComponent: _ => null, ctx };
        }
        injectorReducerAndSaga(store) {
            this.reducerInjectors = getReducerInjectors(store);
            this.sagaInjectors = getSagaInjectors(store);
            const { injectSaga } = this.sagaInjectors;
            const { injectReducer } = this.reducerInjectors;
            saga && injectSaga(key, { saga, sagaMode }, this.props);
            reducer && injectReducer(key, reducer);
        }

        componentDidMount() {
            // console.warn('module injector did mount');
            this.injectorReducerAndSaga(this.props.contextStore || this.state.ctx.store);
            this.mapStateAndDispatchToPropsEnhance();
            this.setState({ moduleInjectedComponent: this.componentConsume() });
            this.asyncDataModelsEnhance();
            this.asyncDataEnhance();
        }

        async componentWillUnmount() {
            const { mapDispatchToProps = {} } = connectOpt;
            const dispatch = getDispatch(this);
            const { getEjectSaga } = this.sagaInjectors;
            const ejectSaga = getEjectSaga();
            await beforeEjectSaga(
                Object.keys(mapDispatchToProps).reduce((result, key) => {
                    const action = mapDispatchToProps[key];
                    result[key] = (...args) => dispatch(action(...args));
                    return result;
                }, {})
            );
            saga && ejectSaga(key);
            this.clearDataModelEnhance();
            this.clearDataEnhance();
        }

        clearDataEnhance(asyncFns) {
            (asyncFns || clearData).forEach(clearFn =>
                (this.props.contextStore
                    ? this.props.contextStore.dispatch(clearFn())
                    : this.context.store.dispatch(clearFn()))
            );
        }
        clearDataModelEnhance() {
            models.forEach(model => {
                model.clearData && this.clearDataEnhance(model.clearData);
            });
        }
        asyncDataEnhance(asyncFns) {
            (asyncFns || asyncData).forEach(asyncFn =>
                (this.props.contextStore
                    ? this.props.contextStore.dispatch(asyncFn())
                    : this.context.store.dispatch(asyncFn()))
            );
        }

        asyncDataModelsEnhance() {
            models.forEach(model => {
                model.asyncData && this.asyncDataEnhance(model.asyncData);
            });
        }

        mapStateAndDispatchToPropsEnhance() {
            let connectOptState = connectOpt.mapStateToProps || {};
            let connectOptDispatch = connectOpt.mapDispatchToProps || {};

            models.forEach(model => {
                const { mapStateToProps, mapDispatchToProps } = model;

                if (mapStateToProps) {
                    connectOptState = {
                        ...connectOptState,
                        ...model.mapStateToProps
                    };
                }

                if (mapDispatchToProps) {
                    connectOptDispatch = {
                        ...connectOptDispatch,
                        ...model.mapDispatchToProps
                    };
                }
            });


            if (typeof connectOpt.mapStateToProps !== 'function') {
                connectOpt.mapStateToProps = createStructuredSelector(
                    connectOptState
                );
            }
            connectOpt.mapDispatchToProps = connectOptDispatch;
        }

        componentConsume = () => {
            const enhancers = [];
            if (connectOpt) {
                const {
                    mapStateToProps,
                    mapDispatchToProps = null
                } = connectOpt;
                enhancers.push(
                    connect(
                        mapStateToProps,
                        mapDispatchToProps
                    )
                );
            }
            if (toJS) {
                enhancers.push(ImmutableComponentWrapper);
            }

            if (enhancers.length) {
                const ConnectedComponent = compose(...enhancers)(
                    WrappedComponent
                );
                return props => <ConnectedComponent {...props} />;
            }
            return props => <WrappedComponent {...props} />;
        };

        render() {
            const extendProps = {
                ...(this.props.match && this.props.match.params),
                authKey
            };
            return this.state.moduleInjectedComponent({
                ...this.props,
                ...extendProps
            });
        }
    }
    return hoistNonReactStatics(ModuleInjector, WrappedComponent);
};
