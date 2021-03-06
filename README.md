# react-ssr-with-koa

* 使用generate-earth (beta) 创建react-ssr项目

* 引入react-ssr-with-koa (alpha) ssr工具包

* 使用earth-scripts@2.x (beta) 打包工具


## Html

#### 与koa配合

使用start方法，在server端预先加载好异步组件。

start(app, option)，如果option内配置为true，则在app上挂载一些中间件，详见以下说明


说明：

| option | 类型 | 说明 | 默认值 |
| ------ | ------ | ------ | ------ | 
| useDefaultProxy | bool | 使用自带的接口代理工具。为true时，在app上挂载body-parser中间件 | false |
| useDefaultSSR | bool | 为true时，在app上挂载/pageName路由，并对page下的所有页面开启ssr，访问地址 host:port/pageName。 | false |


使用方式：
```
const { start } = require('react-ssr-with-koa');
const Koa = require('koa');

const app = new Koa();

start(app, {useDefaultProxy: true, useDefaultSSR: true})
    .then(() => {
       // custom server
    })

```

#### config/ssr.js

server端react入口文件配置，仅打包react代码。由earth-scripts读取，并编译打包到build/server下

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

server端react入口

routeConfig参见react-router-config使用方式

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

#### Html

ssr核心方法。获取初始数据、生成html

```

    const { Html } = require('react-ssr-with-koa');


    // koa router
    router.get("/index*", async (ctx, next) => {

        const PAGE = 'index';

        const htmlObj = new Html(ctx, PAGE)
            .init({
                ssr: true,
            })
            // 如果不在这里传入initialData
            // 可在组件static getInitialProps()方法里直接return数据
            // 优先使用getInitialProps方法获取数据
            // 使用redux情况下，需要在indexSSR组件中获取数据，见示例
            // .injectInitialData({
                // routeProps: {     // routeConfig中配置的组件对应的数据
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



## WrapperForContainer

高阶组件。包装需要获取数据的container组件，提供在server和client端通用的获取数据的方法。被包装的组件初始数据可以从props.initialData上拿到,不需要手动从window上拿。

WrapperForContainer({name: string}})(Container)

说明：

| option | 类型 | 说明 | 默认值 |
| ------ | ------ | ------ | ------ | 
| name | string | 路由组件的name，用于获取该组件对应的数据 | undefined |

getInitialProps方法仅在server端执行。

由于这些组件是client、server端通用，为了不将仅在server端执行的代码打包到client端，可在这些代码前后加入标识`// #if process.env.IS_SERVER === true` `// #endif`


使用方式：

```
import { Wrapper } from 'react-ssr-with-koa'
// #if process.env.IS_SERVER === true
import only-server-used-modules from 'only-server-used-modules'
// #endif

class My extends React.Component {

    // #if process.env.IS_SERVER === true
    static async getInitialProps() {
        // todo: server在这里请求数据
        return 'my data from server'
    }
    // #endif
    ...
    
    render() {
        return (
            <div>{this.props.initialData}</div>
        )
    }
}

export default Wrapper({name: 'My'})(My)

```


## template/page.html

[ejs语法](https://ejs.co/)模版文件夹，每个page对应一个html


说明：

| 参数 | 类型 | 说明 | 默认值 |
| ------ | ------ | ------ | ------ | 
| stringMarkup | string | ssr时，React.renderToString()后的结果 | '' |
| preloadState | string | ssr时，window上挂载的数据  | '' |
| css | string | 页面需要引用的css |  |
| js | string | 页面需要引用的js |  |
| flexibleStr | string | 

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
    <script>
        <%- flexibleStr %>
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

#### logger

工具方法（可选）：打日志。可以自定义logger


日志路径：

development： rootProject/log/

production: /opt/nodejslog

日志文件名：

app.log.info-2019-01-01  app.log.error-2019-01-01

```
// 自定义logger必须实现info和error方法
const myLogger = {
    info: () => {},
    error: () => {}
}
const { logger } = require('react-ssr-with-koa');
// 参数为空，则使用默认logger
logger.init(myLogger)

// 使用
logger.info('my data');
logger.error('error')
```

#### proxyToServer

工具方法（可选）：接口代理


```

const { proxyToServer } = require('react-ssr-with-koa');

router.all('/:channel/:other*', async (ctx, next) => {

    const proxyOption = {
        selfHandleResponse: true, // 处理java 500
        target: `${proxyHost}/${ctx.url}`,
    };

    await proxyToServer(ctx, proxyOption)
           .catch((e) => {
                console.log(e)
            });;
});

```
