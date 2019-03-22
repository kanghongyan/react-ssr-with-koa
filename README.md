# react-ssr-with-koa

generate-earth (beta) react-ssr项目

react-ssr-with-koa (alpha)

earth-scripts@2.x (beta)


## template

[ejs](https://ejs.co/)模版文件夹，每个page对应一个html


说明：

| 参数 | 类型 | 说明 | 默认值 |
| ------ | ------ | ------ | ------ | 
| stringMarkup | string | ssr时，React.renderToString()后的结果 | '' |
| preloadState | string | ssr时，window上挂载的数据  | '' |
| css | string | 页面需要引用的css |  |
| js | string | 页面需要引用的js |  |

注：这几个参数使用*<%-*语法，不需要转译


```

// page1.js

<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,shrink-to-fit=no,user-scalable=0, viewport-fit=cover">
    <meta name="theme-color" content="#000000">
    <meta content="yes" name="apple-mobile-web-app-capable"/>
    <meta content="black" name="apple-mobile-web-app-status-bar-style"/>
    <meta name="format-detection" content="telephone=no"/>
    <title>收银台服务及业务委托协议</title>
    <script>
        window.PointerEvent = void 0
    </script>
    <%- css %>
    <%- preloadState %>
</head>
<body>
<div id="root"><%- stringMarkup %></div>
<%- js %>
</body>
</html>

```

通过在ssr render()方法中传递对象，可以在模版中注入自定义数据

```
ssr方法：

ssrObject.render({myData: 12333})


template：

<% myData %>

```


## config/ssr.js

ssr入口文件。由earth-scripts读取，并编译打包。

```
例如：入口文件名为indexSSR

module.exports = {
    appEntry: {
        "pageA": path.resolve('src/pages/pageA/indexSSR'),
        "pageB": path.resolve('src/pages/pageB/indexSSR/A')
    },
};

```

#### indexSSR 

```
import React, { Component } from 'react'
import {createStore} from 'redux';
import {Provider} from 'react-redux'
import reducers from './reducers/index'
import { StaticRouter } from 'react-router-dom'


import App from './containers/App'
import routeConfig from './containers/routeConfig';


// only for ssr
class AppSSR extends Component {

    /**
     * 可选。用redux时必选。
     * 创建store，并赋值给ctx.reduxStore
     * ctx即koa里的ctx
     *
     * @param ctx
     * @return {Promise<*>}
     */
    static async getInitialStore(ctx) {

        // 每次请求都必须创建一个新的store实例
        ctx.reduxStore = createStore(reducers, {});
        
    }

    // 可选。如果路由组件需要server端获取初始数据，需传入routeConfig。方便server端根据path拿到对应的路由组件
    static routeConfig = routeConfig;
    // 必选。需要传入根App组件
    static App = App



    render () {


        const {
            basename,
            location,
            context
        } = this.props;

        const { initialData, store } = this.props;

        return (

            <Provider store={store}>
                <StaticRouter
                    basename={basename}
                    location={location}
                    context={context}
                >
                    <App/>
                </StaticRouter>
            </Provider>


        )

    }

}


export default AppSSR

```

### dist/WrapperForContainer

高阶组件。包装需要获取数据的container组件，提供在server和client端通用的获取数据的方法。被包装的组件初始数据可以从props.initialData上拿到,不需要手动从window上拿。

WrapperForContainer({name: xx, type: xx}})(Container)

说明：

| option | 类型 | 说明 | 默认值 |
| ------ | ------ | ------ | ------ | 
| type | string | 路由组件or顶级App组件 | app |
| name | string | type='route'时，路由组件的name，用于获取该组件对应的数据 | undefined |


使用方式：

```
class My extends React.Component {

    static async getInitialProps() {
        // todo: server在这里请求数据
        return 'my data from server'
    }
    
    ...
    
    render() {
        return (
            <div>{this.props.initialData}</div>
        )
    }
}

export default Wrapper({name: 'My', type: 'route'})(My)

```

### server side

#### server端入口文件

server入口方法

说明：

| option | 类型 | 说明 | 默认值 |
| ------ | ------ | ------ | ------ | 
| useDefaultProxy | bool | 使用自带的接口代理工具。为true时，在app上挂载body-parser中间件 | false |
| useDefaultSSR | bool | 为true时，在app上挂载/pageName路由，并对page下的所有页面开启ssr，访问地址 host:port/pageName。 | false |


```
const start = require('react-ssr-with-koa');
const Koa = require('koa');

const app = new Koa();

start(app, {useDefaultProxy: true, useDefaultSSR: true})
    .then(() => {
       // custom server
    })

```

#### dist/html

ssr核心方法

```
    // koa router
    router.get("/index*", async (ctx, next) => {

        const PAGE = 'index';

        const htmlObj = new html(ctx, PAGE)
            .init({
                ssr: true,
            })
            // 如果不在这里传入initialData
            // 可在组件static getInitialProps()方法里直接return数据
            // 每种数据的获取方式只能选择其中一种方式，不能混用
            // 使用redux情况下，需要在indexSSR组件中获取数据，见示例
            // .injectInitialData({
                // pageProps: 'fffff',    // 根组件(App)下的数据
                // routeProps: {     // 路由组件下的数据
                //     siteDetail: {
                //         serverData: 'my inject data'
                //     }
                // }
            // })

        await htmlObj.render().catch((e) => {
                logger.error(e);
            }
        );
    });
```

#### dist/logger

工具方法（可选）：打日志。可以自定义logger

```
// 自定义logger必须实现info和error方法
const myLogger = {
    info: () => {},
    error: () => {}
}
const logger = require('react-ssr-with-koa/dist/logger');
// 参数为空，则使用默认logger
logger.init(myLogger)

app.use(xxxxx)
```

#### dist/proxyToServer

工具方法（可选）：接口代理

*接口转发，不处理response*

```

router.all('/:channel/:other*', async (ctx, next) => {

    const appProxy = new Proxy2Server(ctx.req, ctx.res);

    const proxyOption = {
        selfHandleResponse: false,
        target: `${proxyHost}/${ctx.url}`,
    };

    await appProxy.asyncTo(proxyOption, ctx)
           .catch((e) => {
                console.log(e)
            });;
});

```

*接口转发，简单处理response。仅适用于单接口改动*

```
router.post('/api/*', async (ctx, next) => {
    ctx.respond = false;

    // 在res上挂载app_proxyRes,拿到response时会调用这个方法
    // 这里可以拿到返回值并做简单的处理
    res.app_proxyRes = (dataObj, send) => {
        send(dataObj)
    };

    const appProxy = new Proxy2Server(ctx.req, ctx.res);

    const proxyOption = {
        selfHandleResponse: true,
        target: `${def.proxy.payment}/${proxyPath}`
    };
    appProxy.to(proxyOption, ctx);
});
```