require('ignore-styles'); // 不处理require('xx.scss')这种文件 https://www.npmjs.com/package/ignore-styles

// 添加global对象
global.document = document;
global.window = window;
global.navigator = window.navigator;


// client和server端通用的fetch
require('isomorphic-unfetch');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Loadable = require('react-loadable');


const logger = require('./lib/logger');
const performance = require('./middleware/performance');
const staticRouter = require('./middleware/static');
const router = require('./router');

const app = new Koa();

const main = async () => {
/*
    const webpack = require('webpack');
    const webpackClientConfig = require('earth-scripts/config/webpack.config.dev');
    const compiler = webpack(webpackClientConfig);

    app.use(require("koa-webpack-dev-middleware")(compiler, {
        logLevel: 'warn',
        noInfo: true,
        publicPath: webpackClientConfig.output.publicPath
    }));

    app.use(require("koa-webpack-hot-middleware")(compiler, {
        log: console.log,
        path: '/__webpack_hmr',
        heartbeat: 10 * 1000
    }));
*/

    app.proxy = true;


    // etag无法作用于Stream
    // Strings, Buffers, and fs.Stats are accepted
    // app.use(conditional());
    // app.use(etag());

    process.on('uncaughtException', (err) => {
        logger.error('uncaughtException' + err.stack);
        throw err
    });

    process.on('unhandledRejection', (err) => {
        logger.error('unhandledRejection' + err.stack);
    });

    await Loadable.preloadAll();


    // custom logic
    app.performance = () => {
        // performance
        app.use(performance())
    };


    // proxy api
    app.proxyApi = (option = {}) => {

        const emptyFun = async () => {};

        const proxyApi = router.api({
            prefix: option.prefix || 'api',
            apiProxyBefore: option.apiProxyBefore || emptyFun,
            apiProxyReceived: option.apiProxyReceived || emptyFun
        });

        // bodyParser
        app.use(bodyParser());
        app.use((ctx, next) => {
            // 开启了bodyparser
            // 约定，向req中注入_body for "proxyToServer"
            ctx.req._body = ctx.request.body;
            return next();
        });

        // api router
        app.use(proxyApi.routes());
        app.use(proxyApi.allowedMethods());
    };

    // custom logic
    app.init = ({
                    apiProxy = true,
                    defaultSSR = false
                }) => {

        // favicon
        app.use(router.favicon.routes());

        // todo: better
        if (defaultSSR) {
            // page
            app.use(router.page.routes());
            app.use(router.page.allowedMethods());
        }

        // staticRouter
        app.use(staticRouter())
    };

    return app
};


module.exports = main;