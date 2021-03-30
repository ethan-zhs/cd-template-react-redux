import React, { Component } from 'react';

export default initialState => WrappedComponent => {
    class VarsInjector extends Component {
        static displayName = `withVars(${WrappedComponent.displayName ||
            WrappedComponent.name ||
            'Component'})`;
        constructor(props) {
            super(props);
            this.state = initialState;
        }
        render() {
            const { forwardedRef, ...props } = this.props;
            return (
                <WrappedComponent
                    ref={forwardedRef}
                    vars={this.state}
                    setVars={state => this.setState(state)}
                    {...props}
                />
            );
        }
    }
    return React.forwardRef((props, ref) => (
        <VarsInjector forwardedRef={ref} {...props} />
    ));
};
