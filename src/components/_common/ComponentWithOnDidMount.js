import React from 'react';

export default class ComponentWithOnDidMount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const { onDidMount = () => null } = this.props;
        onDidMount();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { props } = this;
        const { onDidUpdate = () => null } = props;
        onDidUpdate(props, prevProps);
    }

    render() {
        const {
            onDidMount,
            children,
            className,
            style,
            ...propsRest
        } = this.props
        return <div className={className} style={style}>
            {children}
        </div>;
    }
}
