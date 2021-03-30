## dev-server

### 目录结构

```
tests/
  fixtures-mock-backend-api/
  |  _default/ # 默认的响应mocking
tools/
  dev-server/
  |  credentials/
  |  middleware/
  |  |  mock-backend-api.js # 根据配置返回预设响应数据的中间件
  |  |  ...
  |
  |  utils/
  |  entry.js # 基于koa的dev-server入口
  |  entry-express.js # 基于express的dev-server入口(原server.js的功能)
```

### 相关npm启动命令

**启动express的dev-server**

通过`npm run start`可以启动原来的`server.js`提供的本地服务。

只是这个`server.js`目前移动到了`tools/dev-server/entry-express.js`这个路径下。

**启动koa的dev-server**
```
#启动基于koa的dev-server
npm run start-dev-koa

#启动基于koa的dev-server，启动本地模拟后端接口
npm run cross-env -- MOCKING_ENABLE=1 npm run start-dev-koa
```

环境变量`MOCKING_ENABLE=1`的时候，构建的代码会把服务端的请求转发到本地处理，如`http://localhost:5000/-mock-backend-api-`。

而且仅用`localhost`访问的时候才会转发到mocking。相关配置文件在`src/services/basename.js`。

默认只提供了`/newmngservice/v1/login`和`/newmngservice/v1/route`这两个接口的模拟数据。

请求`/newmngservice/v1/login`必须是以下信息，其他请求信息会返回一个`501`异常。
```
{
  "account": "mock",
  "password": "mock",
  "validateCode": "123123"
}
```

**添加其他fixtures**

除了默认配置之外，其他的接口按需要进行自定义配置。

相关配置文件请放置在`tests/fixtures-mock-backend-api`目录下，格式请参考`_default`里的文件，自定义的fixtures一般不需要提交到git版本控制。

启动的时候通过`--mock-fixtures`参数定义具体接口的返回数据和响应场景。

```
npm run cross-env -- MOCKING_ENABLE=1 npm run start-dev-koa -- --mock-fixtures tests/fixtures-mock-backend-api/zzm
```
