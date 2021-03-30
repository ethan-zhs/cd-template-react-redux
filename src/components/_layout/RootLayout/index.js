import React, { Component } from 'react';
import { Icon, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import stylesLess from './index.less';
import constantsStyleValue from '@assets/css/constantsStyleValue';
import logo from '@assets/statics/images/GRTlogo@2x.png';
import { TITLE } from '@constants/text';

function ImgIconGDTV() {
    return <img style={{ /* width: '100%', */height: '100%' }} alt={''} src={logo}/>;
}

function IconGDTV (props) {
    return <Icon {...props} component={ImgIconGDTV}/>;
}

class Header extends React.Component {
    render() {
        return <div className={stylesLess.header} {...this.props}>
            <div className={stylesLess.headerContent}>
                {this.props.children}
            </div>
        </div>;
    }
}

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const {
            children = [],
            colorHeader = constantsStyleValue.whiteColor,
            colorHeaderTitle = constantsStyleValue.textColorBlack,
            contentHeader = null,
            outerBeforeContent = null,
        } = this.props;

        return (
            <React.Fragment>
                <Header style={{ backgroundColor: colorHeader }}>
                    <div className={stylesLess.headerContentTitle}>
                        <Tooltip visible={false} title={'打开首页'} placement={'right'}>
                            <Link
                                to={'/home'}
                                className={stylesLess.link}
                            >
                                <span>{TITLE}</span>
                            </Link>
                        </Tooltip>
                    </div>
                    <div className={stylesLess.headerContentRight}>
                        {contentHeader}
                    </div>
                </Header>
                <div className={stylesLess.wrapOuterBeforeContent}>
                    <div className={stylesLess.layout}>
                        {outerBeforeContent}
                    </div>
                </div>
                <div className={stylesLess.layout}>
                    {children}
                </div>
            </React.Fragment>
        );
    }
}

export default Layout;
