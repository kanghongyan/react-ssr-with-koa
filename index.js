require('ignore-styles'); // 不处理require('xx.scss')这种文件 https://www.npmjs.com/package/ignore-styles
require('babel-polyfill');
// client和server端通用的fetch
require('isomorphic-unfetch');

const Loadable = require('react-loadable');
const bodyParser = require('koa-bodyparser');
const performance = require('./src/middleware/performance');
const router = require('./src/router');

// 添加global对象
// todo: 兼容现有组件，后续需要删掉
global.document = require('./src/fakeObject/document');
global.window = require('./src/fakeObject/window');
global.navigator = window.navigator;

require('./dist/util/preLoadComp')();

const start = async (app, {useDefaultProxy = false, useDefaultSSR = false}) => {

    await Loadable.preloadAll();

    if (!app) return;

    // performance
    app.performance = () => {
        app.use(performance())
    };

    // favicon
    app.favicon = () => {
        app.use(router.favicon.routes());
    };

    if (useDefaultProxy) {
        // bodyParser
        app.use(bodyParser());
        app.use((ctx, next) => {
            // 开启了bodyparser
            // 约定，向req中注入_body for "proxyToServer"
            ctx.req._body = ctx.request.body;
            return next();
        });
    }

    if (useDefaultSSR) {
        // page
        app.use(router.page.routes());
        app.use(router.page.allowedMethods());
    }
};

module.exports = start;
