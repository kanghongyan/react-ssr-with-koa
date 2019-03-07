# react-ssr-with-koa

react-ssr-with-koa (alpha)

earth-scripts@2.x (beta)


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

    // 可选。如果路由组件需要server端获取初始数据，需传入routeConfig
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
                    <App routeConfig = {routeConfig}/>
                </StaticRouter>
            </Provider>


        )

    }

}


export default AppSSR

```

#### dist/WrapperForContainer

高阶组件。包装需要获取数据的container组件，提供在server和client端通用的获取数据的方法。被包装的组件初始数据可以从props.initialData上拿到。

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

#### index.js

server入口方法

```
const start = require('react-ssr-with-koa');
const Koa = require('koa');

const app = new Koa();

start(app, {useDefaultProxy: true, useDefaultSSR: false})
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

#### dist/proxyToServer

工具方法：接口代理

#### dist/logger

工具方法：打日志