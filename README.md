



# react-ssr-with-koa

react ssr

### config/ssr.js

标识ssr入口App文件。

如果有用到react-router，则需要手动写indexSSR入口文件

如果没有用到react-router，则传入项目根App即可

```
module.exports = {
    appEntry: {
        "pageA": path.resolve('src/pages/pageA/indexSSR'),
        "pageB": path.resolve('src/pages/pageB/containers/App')
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
     * 每一个page都有一个getInitialProps，用于获取初始数据或一些初始化操作
     * ctx即koa里的ctx
     *
     * @param ctx
     * @return {Promise<*>}
     */
    static async getInitialProps(ctx) {

        ctx.reduxStore = createStore(reducers, {});
        // fetch or something
        // return出的数据可以在render中的this.props中拿到
        // todo: server在这里请求数据
        // 在这里拿到server的数据
        return {
            a: 123
        }
    }

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
                    <App
                        initialData = {initialData}
                        routeConfig = {routeConfig}
                    />
                </StaticRouter>
            </Provider>


        )

    }

}


export default AppSSR

```