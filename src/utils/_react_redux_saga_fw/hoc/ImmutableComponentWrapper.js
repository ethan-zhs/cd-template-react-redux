import React, { Component } from 'react';
import { Iterable } from 'immutable';
import hoistNonReactStatics from 'hoist-non-react-statics';

// const isProd = process.env.NODE_ENV === 'production';

function ImmutableComponentWrapper(WrappedComponent) {
    class ImmutableToJS extends Component {
        static displayName = `withImmutableToJS(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
        render() {
            const KEY = 0;
            const VALUE = 1;
            const propsJS = Object.entries(this.props)
                .reduce((newProps, wrapperComponentProp) => {
                    newProps[wrapperComponentProp[KEY]] = 
                        Iterable.isIterable(wrapperComponentProp[VALUE]) 
                            ? wrapperComponentProp[VALUE].toJS()
                            : wrapperComponentProp[VALUE];
                    return newProps; 
                }, {});
            return <WrappedComponent {...propsJS} />;
        }
    }
    return hoistNonReactStatics(ImmutableToJS, WrappedComponent);
}

export default ImmutableComponentWrapper;
