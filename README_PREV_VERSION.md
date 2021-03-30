# react-redux-boilerplate

## Main Libaries
* [react v16](http://facebook.github.io/react/index.html)
* [redux](https://redux.js.org/)
* [react-router v4](https://reacttraining.com/react-router/web/guides/philosophy)
* [react-router-redux](https://www.npmjs.com/package/react-router-redux)
* [react-redux](https://github.com/reactjs/react-redux)
* [redux-saga](https://redux-saga.js.org/)
* [immutable](http://facebook.github.io/immutable-js/)

## features

0. [css-modules静默配置(暂时废弃)](#css-modules)

1. 路由
    * [统一路由配置](#config)
    * [代码分割及懒加载](#code-spilt) 
    * [鉴权](#auth)
    * [history](#history)
    * [路由阻挡](#history-block)

2. 模块机制
    * [模块](#module)
    * [注册与注入](#inject)

3. [Higher Order Component](#hoc)

4. 方便的配置
    * [alias](#alias)
    * [快速创建container/component](#fast)

5. 测试
    * [jest](#jest)
    * [enzyme](#enzyme)

6. 请配合chrome插件食用
    * [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?utm_source=chrome-app-launcher-info-dialog)
    * [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?utm_source=chrome-app-launcher-info-dialog)

7. Reference
    * [react-boilerplate](https://github.com/react-boilerplate/react-boilerplate)
    * [redux-auth-wrapper](https://github.com/mjrussell/redux-auth-wrapper)
    * [react-router-config](https://www.npmjs.com/package/react-router-config)

8. [pwa](#pwa)
   * [workbox](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)
   * [pwacompat](https://github.com/GoogleChromeLabs/pwacompat)
   * [service-worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

9. [依赖分析](#analyz)
    * [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)


---
## 0. css-modules静默配置(暂时废弃)
### <span id="css-module">css-module</span>
> 已加入[babel-plugin-react-css-modules](https://github.com/gajus/babel-plugin-react-css-modules)自动转换
```
import foo from './foo1.css';
import bar from './bar1.css';

// Imports "a" CSS module from ./foo1.css.
<div styleName="foo.a"></div>;

// Imports "a" CSS module from ./bar1.css.
<div styleName="bar.a"></div>;

// or
import './bar.css';

<div styleName="a"></div>;
```


## 1. 路由
### <span id="config">统一路由配置</span>
> 统一文件配置方便总览便于查找与维护

```
// ./src/routes/index.js
import App from '../container/App;
import PageA from './container/PageA;
import subA from './container/SubA;
import PageB from './container/PageB;

const routes = [
    {
        path: '/',
        component: Root,
        routes: [
            {
                path: '/pageA/:id',
                component: PageA,
                exact: true
                routes: [
                    {
                        path: '/subA',
                        component: subA
                    }
                ]
            },
            {
                path: '/pageB/:id',
                component: PageB
            }
        ]
    }
]

// ./src/container/App
// 需要内嵌子router的父router
import renderRoute from '../routes/renderRoutes;

const App = (props) => {
    render() {
        const { route } = props; // 组件会自动被注入route对象
        return (
            <div>
                {renderRoute(route.routes)}
            </div>
        )
    }
}
```

> 头部与导航栏

```
// ./src/routes/index.js
{
        path: '/',
        component: Root,
        routes: [
            {
                path: '/pageA/:id',
                component: PageA,
                layout: {
                    hasNav: false // 控制左侧导航栏，默认true
                    hasHeader: true // 控制头部header展示，默认true
                },
                routes: [
                    {
                        path: '/subA',
                        component: subA
                    }
                ]
            },
            {
                path: '/pageB/:id',
                component: PageB
            }
        ]
    }
```


### <span id="code-spilt">代码分割及懒加载</span>
> 利用webpack做代码分割

```
// ./src/routes/index.js

// 引入异步加载高阶组件
import AsyncRouteComponent from './AsyncRouteComponent';

const routes = [
    {
        component: Root,
        path: '/',
        routes: [
            {
                component: AsyncRouteComponent({ loader: () => import('../containers/PageA') }),
                path: '/pageA/:id'
            }
        ]
    }
];
```

> **method: AsyncRouteComponent({ loader: Function, Placeholder: React.Component }): Component**

* loader: 异步加载函数，es6 module/cmd require返回值, 
可统一用import, () => import('pageA')

* Placeholder: 组件加载中的占位组件（默认使用了公共组件<Spin />）

* 使用此方法，在进入路由时，会产生一个占位组件，同时加载组件并渲染。
webpack会自动分割。

## <span id="history">History</span>
> 在config中引入的组件会被注入以下对象，详细可参考[react-router文档](https://github.com/ReactTraining/react-router)
```
history, // 组件内可用来做路由跳转, history.push
location, // 当前url信息
match,  //做组件与路由的match
route  //配置表中填写的参数

// 主动跳转
class A extends React.Component {
    handleClick() {
        this.props.history.push('/aaa');
    }
}

//鉴权式跳转
import { Route, Redirect } from 'react-router-dom';

class A extends React.Component {
    render() {
        if (!this.props.auth) {
            return <Route render={props => <Redirect to="/aaa" />}/>;
        } 
        return <div>asdasd</div>
    }
}


```
组件外使用[history](https://github.com/ReactTraining/history)：
```
import { history } from '../app'; // ./src/app

history.push('/');

```

### <span id="auth">鉴权</span>

```
// ./src/routes/AuthRoute.js
import React from 'react';
import PageShell from 'components/PageShell';
import createAuthRoute from './createAuthRoute';
import { login } from 'globalData/account/actions';

// 创建授权高阶组件
const HomeAuth = createAuthRoute({
    // 通过授权的选择器
    authedSelector: state => state.getIn(['global', 'account', 'logined']),
    // 查询授权中（可选）
    authenticatingSelector: state => state.getIn(['global', 'account', 'isRequesting']),
    // 查询授权中展示的组件（可选）
    AuthenticatingComponent: PageShell,
    // 查询授权action（可选）
    authAction: login.request,
    // 授权失败跳转
    authFailedRedirect: () => '/login',
    // 查询授权中展示的组件（可选, 与授权失败跳转冲突，优先级低）
    AuthenFailedComponent: <Fail />,
    // 组件名称
    wrappedName: 'withHomeAuth'
});

// ./src/routes/index.js
{
        component: HomeAuth(Root), // higher order component
        path: '/',
        ...

```
### <span id="history-block">路由阻挡</span>
```
// 组件方式，UI样式为浏览器默认
import { Prompt } from 'react-router';

<Prompt
  when={formIsHalfFilledOut}
  message="Are you sure you want to leave?"
/>

// 编程方式，无UI，开发者自行设计
const unlock = this.props.history.block(); // 锁定url无法改变
unlock(); // 解锁
```

## 2. 模块
### <span id="module">模块</span>
> 模块在redux中以key为名储存全局state，且一般含有对应的sagas。

### <span id="inject">注册与注入</span>
> 除了原有的手动注册reducer, saga外，本模板提供了方便的注册与注入方法

> 全局注册reducer, saga（支持unmount取消）, 与redux connect(若有connectOpt)，自动转换immutable.toJS

**1. 生产reducer/saga的container，需要提供key做绑定**

```
// ./src/container/PageA
...
// 引入注入组件
import moduleInjector from 'hoc/moduleInjector';
// 引入reducer
import reducer from './reducer';
// 引入sagas
import saga from './sagas';
import { createStructuredSelector } from 'reselect';
import { selectList } from './selectors';
import { getList } from './actions';
import styles from './index.css';

const mapStateToProps = createStructuredSelector({
    list: selectList()
});

@moduleInjector({ 
    key: 'PageA', // reducer与saga的key
    reducer, 
    saga,
    connectOpt: { // connect参数
        mapStateToProps,
        mapDispatchToProps: {
            getList: getList.request
        }
    }
})
class PageA extends Component {
    ...
```

**2. 消费reducer store的container也可以采用原有的connect**

```
// 新的可选用法
@moduleInjector({
    connectOpt: {
        mapStateToProps,
        mapDispatchToProps
    }
}) // connect & immutable toJS
class PageA  extends Component {...}


// 或者原有用法
@connect(mapStateToProps, mapDispatchToProps)
@ImmutableComponentWrapper    // immutable toJS
class PageA  extends Component {...}
```

**moduleInjector({ [key: String, reducer: Function, saga: Function, connectOpt: Object, sagaMode: Number, toJS: Boolean, cssModule: Object] })**

> * key: 模块key
> * reducer/saga: 对应的模块reducer和saga
> * connectOpt: 参数等同于react-redux的connect(mapStateToProps, mapDispatchToProps)(Component)
> * sagaMode: 默认为0
>   * 0: 组件unmount时取消saga，重载时重启saga
>   * 1: 后台守护，不会取消saga
>   * 2: 只使用一次，组件unmount时取消saga，组件重载时也不会重启saga
> * toJS: 把immutablejs转成普通js再传入组件, 默认true

## <span id="hoc">Higher Order Component</span>
> 添加hoc文件夹用于存放HOC组件

> 本模板的route, module等多处使用HOC

> 请善用[HOC](https://reactjs.org/docs/higher-order-components.html#___gatsby)提高代码可读性


## 方便的设置
### <span id="alias">alias</span>

> 节省路径记忆负担（同时会丢失ide重定向）

```
// webpack
resolve: {
    alias: {
        public: path.resolve(__dirname, '../src/statics'),
        components: path.resolve(__dirname, '../src/components'),
        containers: path.resolve(__dirname, '../src/containers'),
        constants: path.resolve(__dirname, '../src/constants'),
        globalData: path.resolve(__dirname, '../src/global'),
        utils: path.resolve(__dirname, '../src/utils'),
        hoc: path.resolve(__dirname, '../src/hoc'),
        services: path.resolve(__dirname, '../src/services')
    }
},

// somewhere
import { login } from 'globalData/account/actions';
```

### <span id="fast">快速创建container/component (可优化)</span>

```
    $ npm run ncom <component-name> // 创建component模板
    $ npm run con <container-name> // 创建container模板

    // 模板源代码在 utils/templates
```
## 测试

### <span id="jest">jest</span>

1. [Document of jest](https://facebook.github.io/jest/docs/en/getting-started.html)

```
    $ npm test
```

### <span id="enzyme">enzyme</span>

[Document of enzyme](http://airbnb.io/enzyme/docs/api/render.html)

### <span id="pwa">pwa</span>

支持多终端显示桌面图标，支持离线加载站点

