import * as R from 'ramda';
import path from 'path';
import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router-dom';
import { indent, isCollapseable } from '@src/constants/menuSiderNav';
import styleLess from './index.less';

function getCommonKey(name, index) {
    return name + '_' + index;
}

function isSamePath(pathA, pathB) {
    if (typeof pathA !== 'string' || typeof pathB !== 'string') {
        return false;
    }
    const pathANormalized = path.join('/', pathA || '');
    const pathBNormalized = path.join('/', pathB || '');
    return pathANormalized === pathBNormalized;
}

function getDefaultMenuKeys(menuSiderNav, history) {
    const { location } = history;
    const { pathname } = location;

    let openKeys = [];
    let selectedKeys = [];

    const pathnameToCheck = R.path(['state', 'fromPathname'], location) || pathname;

    // console.log('menuSiderNav', menuSiderNav);

    menuSiderNav.find(([_, name, __, menuItemData, regexpTargetPathStandalone], i) => {
        if (Array.isArray(menuItemData)) {
            // eslint-disable-next-line no-shadow
            const [_, __, subMenuPath] = menuItemData.find(([_, __, subMenuPath, regexpTargetPath]) => {
                if (regexpTargetPath instanceof RegExp) {
                    return regexpTargetPath.test(pathnameToCheck);
                }
                if (typeof subMenuPath === 'string') {
                    return isSamePath(regexpTargetPath, pathnameToCheck);
                }
                return false;
            }) || [];
            if (!subMenuPath) { return false; }
            openKeys = [ getCommonKey(name, i) ];
            selectedKeys = [ subMenuPath ];
        }
        const menuPath = menuItemData;
        let isSame = false;
        if (regexpTargetPathStandalone instanceof RegExp) {
            isSame = regexpTargetPathStandalone.test(pathnameToCheck);
        } else {
            isSame = isSamePath(menuPath, pathnameToCheck);
        }
        if (!isSame) { return false; }
        selectedKeys = [ menuPath ];
        return true;
    });

    return { openKeys, selectedKeys };
}

function dispatchResize() {
    if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
        const evt = document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt);
    } else {
        window.dispatchEvent(new Event('resize'));
    }
}

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // isCollapsed: false

        };
    }
    componentDidMount() {
        const {
            openKeys = []
        } = getDefaultMenuKeys(this.props.menuSiderNav, this.props.history);
        this.setState({ currentOpenKeys: openKeys });
    }

    emitOnChangeCollapsed = async _ => {
        // await asyncSetState(this, {
        //     isCollapsed: !this.state.isCollapsed
        // });
        const { isSiderNavCollapsed, toogleSiderNavCollapsedAction = _ => null } = this.props;
        toogleSiderNavCollapsedAction({ isCollapsed: !isSiderNavCollapsed });
        setTimeout(_ => dispatchResize(), 201);
    }
    emitOnChangeCollapsedTrue = async _ => {
        // await asyncSetState(this, { isCollapsed: true });
        const { toogleSiderNavCollapsedAction = _ => null } = this.props;
        // console.log('emitOnChangeCollapsedTrue', this.state.isCollapsed);
        toogleSiderNavCollapsedAction({ isCollapsed: true });
        setTimeout(_ => dispatchResize(), 201);
    }
    render() {
        const {
            width = 210,
            className = '',
            classNameMenu = '',
            history,
            menuSiderNav = [],
            checkMenuItemIsVisible = _ => true,
            isSiderNavCollapsed
        } = this.props;

        const {
            openKeys: open_keys = [],
            selectedKeys = []
        } = getDefaultMenuKeys(menuSiderNav, history);

        const openKeys = R.isEmpty(open_keys) ? [getCommonKey(R.path([0, 1], menuSiderNav), 0)] : open_keys;

        const { wasClickedCurrentOpenKeysPath } = this.state;
        const wasClickedCurrentOpenKeys = wasClickedCurrentOpenKeysPath === history.location.pathname;
        let { currentOpenKeys = [] } = this.state;

        if (!wasClickedCurrentOpenKeys) {
            if (openKeys.some(R.compose(R.not, R.flip(R.includes)(currentOpenKeys)))) {
                currentOpenKeys = R.uniq([...currentOpenKeys, ...openKeys]);
            }
        }

        return <Layout.Sider
            className={[className, styleLess.aside].join(' ')}
            breakpoint='lg'
            width={width}
            trigger={null}
            collapsed={isSiderNavCollapsed}
            collapsedWidth={0}
            onBreakpoint={(broken) => {
                // console.log('onBreakpoint', broken);
                isCollapseable && broken && this.emitOnChangeCollapsedTrue();
            }}
            // collapsedWidth='0'
            // onBreakpoint={(broken) => { console.log(broken); }}
            // onCollapse={(collapsed, type) => { console.log(collapsed, type); }}
            // style={{ background: '#fff', position: 'fixed', height: 'calc(100% - 50px)', zIndex: 99 }}
        >
            <Scrollbars
                ref={(dom) => { this.scrollbars = dom; }}
                autoHide={true}
                autoHideTimeout={500}
            >
                <Menu
                    mode={'inline'}
                    collapsed='false'
                    className={[classNameMenu, styleLess.menu].join(' ')}
                    defaultOpenKeys={openKeys}
                    openKeys={currentOpenKeys}
                    onOpenChange={(nextOpenKeys) => {
                        this.setState({
                            currentOpenKeys: nextOpenKeys,
                            // wasClickedCurrentOpenKeys: true,
                            wasClickedCurrentOpenKeysPath: history.location.pathname
                        });
                    }}
                    selectedKeys={selectedKeys}
                    inlineIndent={indent}
                >
                    {menuSiderNav.map(([RenderIcon, name, checkIsVisible, menuItemPaths], i) => {
                        if (typeof checkIsVisible === 'function' && !checkIsVisible(checkMenuItemIsVisible)) {
                            return null;
                        }
                        const defaultKey = getCommonKey(name, i);
                        if (Array.isArray(menuItemPaths)) {
                            // eslint-disable-next-line no-shadow
                            const itemsSubMenu = menuItemPaths.map(([name, checkIsVisible, subMenuPath]) => {
                                // console.log(name, subMenuItemData, subMenuPath);
                                if (typeof checkIsVisible === 'function' &&
                                    !checkIsVisible(checkMenuItemIsVisible)) {
                                    return null;
                                }
                                return <Menu.Item key={subMenuPath}>
                                    <Link to={subMenuPath}>{name}</Link>
                                </Menu.Item>;
                            }).filter(Boolean);

                            if (R.isEmpty(itemsSubMenu)) return null;

                            return <Menu.SubMenu key={defaultKey} title={<React.Fragment>
                                <RenderIcon/>
                                <span>{name}</span>
                            </React.Fragment>}>
                                {itemsSubMenu}
                            </Menu.SubMenu>;
                        }
                        return <Menu.Item key={menuItemPaths}>
                            <Link to={menuItemPaths}>
                                <RenderIcon/><span>{name}</span>
                            </Link>
                        </Menu.Item>;
                    })}
                </Menu>
            </Scrollbars>
            {isCollapseable && <div className={styleLess.collapserWrapper}>
                <div className={styleLess.collapser} onClick={this.emitOnChangeCollapsed}>
                    <i className={[styleLess.iconArrow, isSiderNavCollapsed ? styleLess.inverse : ''].join(' ')}/>
                </div>
            </div>}
        </Layout.Sider>;
    }
}
