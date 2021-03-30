import React from 'react';

export default function asyncComponent({ loader, props, Placeholder }) {
    // let component = null;
    return class AsyncComponent extends React.Component {
        constructor(props) {
            super(props);
            this.state = { component: null };
            this.load();
            // console.log('constructor AsyncComponent');
        }
        componentDidMount() {
            this.mounted = true;
        }
        componentWillUnmount() {
            this.mounted = false;
        }
        load() {
            loader().then((m) => {
                const component = m.default || m;
                if (this.mounted) {
                    this.setState({ component });
                } else {
                    this.state.component = component; // eslint-disable-line
                }
            });
        }
        render() {
            const { component: Component } = this.state;
            const isValidComponent = typeof Component === 'function';
            if (isValidComponent) {
                return <Component {...this.props} {...props}/>;
            }
            if (!isValidComponent && Component !== null) {
                console.warn('AsyncComponent', 'invalid component', Component);
            }
            if (Placeholder) {
                return <Placeholder {...this.props}/>;
            }
            return null;
        }
    };
}
