import React, { Component } from 'react';
import RootLayout from '../RootLayout';
import RootSiderNav from '../RootSiderNav';
import stylesLess from './index.less';

// const WIDTH_SIDER_NAV = 200;

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // isSiderNavCollapsed: false
        };
    }
    // handleSiderNavChangeCollapsed = isCollapsed => {
    //     this.setState({
    //         isSiderNavCollapsed: isCollapsed
    //     });
    // }
    render() {
        const {
            history,
            children = [],
            contentHeader = null,
            menuSiderNav,
            checkMenuItemIsVisible,
            isSiderNavCollapsed,
            toogleSiderNavCollapsed
        } = this.props;

        return (
            <RootLayout
                contentHeader={contentHeader}
                outerBeforeContent={<RootSiderNav
                    className={stylesLess.rootSider}
                    classNameMenu={stylesLess.rootSiderNav}
                    history={history}
                    menuSiderNav={menuSiderNav}
                    checkMenuItemIsVisible={checkMenuItemIsVisible}
                    isSiderNavCollapsed={isSiderNavCollapsed}
                    toogleSiderNavCollapsedAction={toogleSiderNavCollapsed}
                />}
            >
                <div className={[stylesLess.contentMain, isSiderNavCollapsed ? stylesLess.noPadding : ''].join(' ')}>
                    {children}
                </div>
            </RootLayout>
        );
    }
}

export default Layout;
