import * as R from 'ramda';
import React, { Component } from 'react';
import { createPortal } from 'react-dom';

const isNotNil = R.compose(R.not, R.isNil);

export const portalRoot = document.getElementById('portal');

export default ({ id } = {}) => WrappedComponent => {
    class PortalInjector extends Component {
        static WrappedComponent = WrappedComponent;
        static displayName = `withPortal(${WrappedComponent.displayName ||
            WrappedComponent.name ||
            'Component'})`;
        constructor(props) {
            super(props);
            this.el = document.getElementById(id) || document.createElement('div');
            if (isNotNil(id)) {
                this.el.id = id;
            }
        }
        componentDidMount() {
            portalRoot.appendChild(this.el);
        }
        componentWillUnmount() {
            portalRoot.removeChild(this.el);
        }
        render() {
            const { forwardedRef, ...props } = this.props;
            return createPortal(
                <WrappedComponent ref={forwardedRef} {...props} />,
                this.el
            );
        }
    }
    return React.forwardRef((props, ref) => (
        <PortalInjector forwardedRef={ref} {...props} />
    ));
};

