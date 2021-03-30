## 开发

#### 基本的npm命令

`npm run start-dev` 启动开发环境服务

`npm run start-dev -- -p=5001` 启动开发环境服务, 并指定端口

`npm run start-dev -- --ssl-port=5002 -p=5001` 启动开发环境服务, 包括https服务, 并指定端口

#### src目录说明

- assets/ 静态资源文件, 全局css文件
- components/ 组件目录
    - _assets/ 资源组件, svg图标等
    - _common/ 通用组件
    - _layout/ 页面布局
    - _shared/ 页面间的通用组件
    - _sharedCurrentProject/ 有十分具体的业务逻辑，依赖具体数据状态的组件
- constants/ 存放常量的目录
- containers/ 页面组件目录, **组件名称按照浏览器路由路径命名**
- models/ 全局的状态model存放的目录
- router/ 路由定义的目录
- services/ 可以把一些请求方法存放在这
- store/ 初始化定义redux store目录
- utils/ 工具模块/函数

#### 页面代码组织

可参考模板内的样例页面`src/containers/PageA`和`src/containers/PageB`

一般情况下，一个页面可以对应一个model。例如在页面目录包括一个`index.js`和`model.js`

通过`createModel`创建一个model，这个函数的主要功能是把参数中的`state`和`sagas`进行处理，

`createModel`会返回一个包括`{ saga, reducer }`的对象。

在这个过程中会自动生成对应的`selector`、`action`和`reducer`，不需要再手动定义这三者（通常来说这三种数据不应包括具体的逻辑）。

返回的`model`可以直接作为参数传递到`moduleInjector`方法中。

**.container/PageA/model.js**
```javascript
import { createModel, updateState } from '@utils/redux/createModel';

export default createModel({
    namespace: 'containers/PageA',
    state: {
        // isRequesting: false, // 尽量不要把界面相关的状态存放在state
        list: []
    },
    sagas: {
        * getList({ payload }, { put }) {
            yield updateState(put, { list: [1, 2, 3] });
        }
    }
});
```

`'@utils/redux/createModel`已经进一步封装简化了`moduleInjector`，

通过`@createModuleInjectorBy`可以将model和页面绑定。

页面中可以通过`props`直接访问同名的字面值或方法。

**.container/PageA/index.js**
```javascript
import { createModuleInjectorBy } from '@utils/redux/createModel';
import model from './model'

@createModuleInjectorBy(model)
class Page extends React.Component {
    componentDidMount() {
        this.props.getList(/* 参数会传入到 payload 中 */);
    }
    render() {
        return <div>{this.props.list.map(i => <span key={i}>{i}</span>)}</div>;
    }
}
```

如果需要引用全局`model`的state或者sagas，可以在后续参数中传入，例子如下

```javascript
import modelAccount from '@models/account'

@createModuleInjectorBy(model, {
    mapStateToProps: {
        ...modelAccount.stateToSelectors(['userInfo'])
    },
    mapDispatchToProps: {
        ...modelAccount.sagaToActionDispatches(['login', 'logout', 'getAccountInfo'])
    }
})
class LoginPage extends React.Component {
    //...
}
```

#### FAQ常见疑问解答

- 1.如何发起请求?

    `@utils/callApi`(`src/utils/callApi/index.js`)这个模块中已经添加了一些封装好的柯里化请求方法，如下：

    - `getX`: `(url, urlData)`
        - `[1]url`可以传入url或者url模板，例如: `/get/userData/:userId`
        - `[2]urlData`传入编译url模板的数据，例如: `getX('/get/userData/:userId', { userId: 1 })`
        - `[2]urlData`可以通过$params属性传入query，例如: `getX('/get/userData/:userId', { userId: 1, $params: { abc: 1 } })`
    - `deleteX`: `(url, urlData)`
    - `postX2`: `(url, bodyData)`
    - `postX3`: `(url, urlData, bodyData)`
        - `[3]bodyData`传递到payload中的数据，默认会转为JSON字符串
    - `putX2`: `(url, bodyData)`
    - `putX3`: `(url, urlData, bodyData)`

    柯里化的函数需要传递完所有参数才会执行，传完参数之前会返回一个余下参数的函数
    
```javascript
getX('/get/userData/:userId')({ userId: 1 });

getX('/get/userData/:userId', { userId: 1 });

// 1) 通过这种机制可以预先定义并且方便重用函数。
// 2) 在sagas中yield call的第一个参数应该传入定义url模板参数的请求方法即可, 如下:
    
function* someSagaMethod() {
    yield call(getX('/get/userData/:userId'), { userId: 1 });
}
```

## jekins构建任务

jekins构建任务中，构建前的准备过程，可以直接执行`tools/buildPrepare.sh`即可。

可以传入参数

`-f`: 重置并重新安装node_modules

`-r`: `npm install`的安装源，如有需要，可以指定npm官方或者taobao源。

```shell
sh tools/buildPrepare.sh -f -r=$registryNpm
npm run build
```
