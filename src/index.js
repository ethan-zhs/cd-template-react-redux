import 'core-js/features/array/includes';
import 'core-js/features/object/values';
import 'core-js/features/symbol';
import 'core-js/features/map';
import 'core-js/features/set';
// import 'core-js/features/weak-map';
// import 'core-js/features/weak-set';
import { render } from 'react-dom';
import React from 'react';

// antd
import { Col, Row, Modal, Slider, Layout, Menu, Pagination, message, Button } from 'antd';
import cn from 'antd/lib/locale-provider/zh_CN';
import 'antd/lib/style/index.less';
import 'moment/locale/zh-cn';

// eslint-disable-next-line no-unused-expressions
typeof Col; typeof Row; typeof Modal; typeof Slider; typeof Layout; typeof Menu;
// eslint-disable-next-line no-unused-expressions
typeof Pagination;

// styles
import '@assets/css/global.less'; // global

import App from './App';

const div9999 = document.createElement('div');

div9999.style.cssText = 'position: fixed; z-index: 99999; top: 0; left: 0; width: 100%;';
document.body.appendChild(div9999);

message.config({
    getContainer() { return div9999; }
});

// function preventDefaultStopPropagation(e) {
//     e.preventDefault();
//     e.stopPropagation();
// }

// document.addEventListener('touchstart', preventDefaultStopPropagation, { passive: false });
// document.addEventListener('touchmove', preventDefaultStopPropagation, { passive: false });
document.body.style.setProperty('overscroll-behavior-x', 'none');

render(<App locale={cn}/>, document.getElementById('app'));

const ua = window.navigator.userAgent;
const isIE = /MSIE|Trident/.test(ua);

if (isIE) {
    const removeMsgForIE = message.warning({
        content: <span>您正在使用落后的IE内核浏览器访问本页面，为了更好的体验，建议切换到<strong className={'color-primary'}>极速模式</strong>或<strong className={'color-primary'}>更换浏览器</strong><Button size={'small'} type={'primary'} style={{ marginLeft: 5 }} onClick={() => removeMsgForIE()}>知道了</Button></span>,
        duration: 9999999999999
    });
}

// process.env.NODE_ENV === 'development' && register(); // register Service Worker
