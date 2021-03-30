/* eslint-disable quote-props */
import * as R from 'ramda';
import { Icon } from 'antd';
import createMenuItemDataFromRoute from '@components/_layout/RootSiderNav/utils/createMenuItemDataFromRoute';
import React from 'react';
import getRouteItemByMenuName from '@components/_layout/RootSiderNav/utils/getRouteItemByMenuName';
import ensureArray from '@utils/type-helper/ensureArray';
import pathToRegexp from 'path-to-regexp';

export const indent = 30;

export const isCollapseable = true;

function IconHome() {
    return <svg width="1em" height="1em" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="首页优化" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="首页-20200302" transform="translate(-31.000000, -279.000000)">
                <g id="leftboard">
                    <g id="ico_homepage" transform="translate(31.000000, 279.000000)">
                        <polygon id="Clip-2" points="0.00195121951 0.011691475 11.9883089 0.011691475 11.9883089 11.9837781 0.00195121951 11.9837781"/>
                        <path d="M4.58578644,1.41421356 C5.36683502,0.633164979 6.63316498,0.633164979 7.41421356,1.41421356 L7.41421356,1.41421356 L9.81537598,3.81537598 L11.1464466,5.14644661 C11.2402148,5.2402148 11.2928932,5.36739176 11.2928932,5.5 C11.2928932,5.77614237 11.0690356,6 10.7928932,6 L10.7928932,6 L10.5,6 L10.5,11 C10.5,11.5522847 10.0522847,12 9.5,12 L2.5,12 C1.94771525,12 1.5,11.5522847 1.5,11 L1.5,6 L1.20710678,6 C1.07449854,6 0.94732158,5.94732158 0.853553391,5.85355339 C0.658291245,5.65829124 0.658291245,5.34170876 0.853553391,5.14644661 L0.853553391,5.14644661 L2.24157715,3.75842285 Z M8.5,7.5 C8.22385763,7.5 8,7.72385763 8,8 L8,10 C8,10.2761424 8.22385763,10.5 8.5,10.5 C8.77614237,10.5 9,10.2761424 9,10 L9,8 C9,7.72385763 8.77614237,7.5 8.5,7.5 Z" id="形状结合" fill="currentColor"/>
                    </g>
                </g>
            </g>
        </g>
    </svg>;
}

const MAPPING_MENU_NAME_TO_MENU_ICON = {
    '首页': _ => <Icon style={{ fontSize: 14 }} component={IconHome}/>,
    // '报告中心': _ => <Icon style={{ fontSize: 14 }} component={IconMenuReportCenter}/>,
    // '数据中心': () => (<Icon style={{ fontSize: 14 }} component={IconMenuData}/>),
};

const userMenuAll = [
    {
        'name': '数据中心',
        'list': [
            { 'name': '页面A' },
            { 'name': '页面B' },
            { 'name': '用户数据' },
            { 'name': '内容数据' },
            { 'name': '技术数据' }
        ]
    },
    {
        'name': '内容中心',
        'list': [
            { 'name': '县融内容管理' },
            { 'name': '县融选题管理' },
            { 'name': '内容渠道管理' }
        ]
    },
    { 'name': '开发中' },
    { 'name': '任务中心' }
];

function isVisibleMenuOfRouteData(routeData, userInfo, checkUserPermsByKey) {
    if (typeof routeData.permissionUserInfo === 'function') {
        if (!routeData.permissionUserInfo(userInfo)) {
            return false;
        }
    }

    if (typeof routeData.permissionTags === 'function' && !routeData.permissionTags(checkUserPermsByKey)) {
        return false;
    }

    if (
        Array.isArray(routeData.permissionTags) &&
        routeData.permissionTags.some(tag => !checkUserPermsByKey(tag))
    ) {
        return false;
    }

    return true;
}

export default function getMenuSiderNav(_, userInfo, checkUserPermsByKey) {
    const menuSiderNav = ensureArray(userMenuAll).map((itemMenu = {}) => {
        const { name, list = [] } = itemMenu;

        const menuIcon =
            MAPPING_MENU_NAME_TO_MENU_ICON[name] || (() => null);

        if (R.isEmpty(list)) {
            const routeItem = getRouteItemByMenuName(name);
            if (!routeItem) {
                return null;
            }
            const [regexpTargetPath, ___, routeData] = routeItem;
            const {
                // menuIcon = _ => null,
                menuName,
            } = routeData;

            if (!isVisibleMenuOfRouteData(routeData, userInfo, checkUserPermsByKey)) {
                return null;
            }
            return [menuIcon, menuName, null, routeData.menuTargetPath, pathToRegexp(regexpTargetPath)];
        }

        return [menuIcon, name, null, list.map(itemSubMenu => {
            const routeItemSubMenu = getRouteItemByMenuName(itemSubMenu.name);
            if (!routeItemSubMenu) return null;
            const [regexpTargetPath, ____, routeDataSubMenu] = routeItemSubMenu;

            if (!isVisibleMenuOfRouteData(routeDataSubMenu, userInfo, checkUserPermsByKey)) {
                return null;
            }

            return [routeDataSubMenu.menuName, null, routeDataSubMenu.menuTargetPath, pathToRegexp(regexpTargetPath)];
        }).filter(Boolean)];
    }).filter(Boolean);

    if (R.isEmpty(menuSiderNav)) {
        return Object.freeze([
            [_ => <Icon style={{ fontSize: 14 }} type="home"/>, '首页', null, '/home'],
        ]);
    }

    // console.log('menuSiderNav', menuSiderNav);

    return Object.freeze([
        ...createMenuItemDataFromRoute([[ '/home']], checkUserPermsByKey).map(item => [
            MAPPING_MENU_NAME_TO_MENU_ICON[item[0]] || (() => null),
            ...item
        ]),
        ...menuSiderNav,
        ...createMenuItemDataFromRoute([
            ['/report-center'],
            ['/setting-user-role']
        ], checkUserPermsByKey).map(item => [
            MAPPING_MENU_NAME_TO_MENU_ICON[item[0]] || (() => null),
            ...item
        ])
    ]);
}

const DEFAULT_EMPTY_ROUTE = '/empty';

export function findFirsRoutePathInMenuVisible(checkUserPermsByKey) {
    const menu = getMenuSiderNav(null, null, checkUserPermsByKey);
    const firstMenu = menu.find(item => {
        const itemInfo = R.nth(3, item);
        return !!itemInfo && !R.isEmpty(itemInfo);
    });
    if (!firstMenu) {
        return DEFAULT_EMPTY_ROUTE;
    }
    const itemInfoFirstMenu = R.nth(3, firstMenu);
    // console.log('itemInfoFirstMenu', itemInfoFirstMenu)
    if (Array.isArray(itemInfoFirstMenu)) {
        if (Array.isArray(R.head(itemInfoFirstMenu))) {
            return R.nth(2, R.head(itemInfoFirstMenu)) || DEFAULT_EMPTY_ROUTE;
        }
        return R.nth(3, itemInfoFirstMenu) || DEFAULT_EMPTY_ROUTE;
    }
    return itemInfoFirstMenu || DEFAULT_EMPTY_ROUTE;
}
