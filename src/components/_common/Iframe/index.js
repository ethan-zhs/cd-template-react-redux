import React from 'react';
import { Spin } from 'antd';
import styleLess from './index.less';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoadingIframe: false };
        this.refWrapper = React.createRef();
        this.lastIframeElement = null;
    }
    _mayUpdateIframeElement = src => {
        if (this.lastIframeElement && this.lastIframeElement.contentWindow &&
            typeof this.lastIframeElement.contentWindow.removeEventListener === 'function') {
            this.lastIframeElement.contentWindow.removeEventListener('message', this._byPassMessage, false);
        }
        this.setState({ isLoadingIframe: true });
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', src);
        iframe.setAttribute('width', '100%');
        iframe.setAttribute('height', '100%');
        iframe.setAttribute('style', 'border: none;overflow: hidden;');
        iframe.setAttribute('scrolling', 'no');
        this.refWrapper.current.appendChild(iframe);
        iframe.onload = _ => {
            this.setState({ isLoadingIframe: false });
            try {
                iframe.contentWindow.addEventListener('message', this._byPassMessage, false);
            } catch (error) {
                // console.log('error', error);
            }
        };
        this.lastIframeElement = iframe;
    }
    _byPassMessage = event => {
        const { onMessage = _ => null } = this.props;
        onMessage(event, _ => {
            if (this.refWrapper.current) {
                this.refWrapper.current.innerHTML = '';
                this._mayUpdateIframeElement(this.props.src);
            }
        });
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.src !== this.props.src) {
            this._mayUpdateIframeElement(this.props.src);
        }
    }
    componentDidMount() {
        this._mayUpdateIframeElement(this.props.src);
    }
    componentWillUnmount() {
        this.refWrapper.current.innerHTML = '';
        if (this.lastIframeElement && this.lastIframeElement.contentWindow &&
            typeof this.lastIframeElement.contentWindow.removeEventListener === 'function') {
            this.lastIframeElement.contentWindow.removeEventListener('message', this._byPassMessage, false);
        }
    }
    render() {
        const {
            tag = 'div',
            src = null,
            children = [],
            onMessage = _ => null,
            ...propsRest
        } = this.props;

        const {
            isLoadingIframe
        } = this.state;

        return React.createElement(
            tag, { ...propsRest }, <Spin
                wrapperClassName={styleLess.spinWidth100Height100}
                spinning={isLoadingIframe}>
                <div ref={this.refWrapper}/>
            </Spin>
        );
    }
}
