import 'ignore-styles'; // 不处理require('xx.scss')这种文件 https://www.npmjs.com/package/ignore-styles
// client和server端通用的fetch
import 'isomorphic-unfetch';

import * as Loadable from 'react-loadable';
import * as bodyParser from 'koa-bodyparser';

import { preLoadComp } from './util/preLoadComp'
import { window } from './util/fakeObject/window'

// 兼容处理：为global添加window相关对象
global.window = window;
global.document = window.document;
global.navigator = window.navigator;

// preLoad all react modules for react-loadable
preLoadComp();

const start = async (app, {useDefaultProxy = false, useDefaultSSR = false}): Promise<void> => {

    await Loadable.preloadAll();

    if (!app) return;

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
        const { page } = require('./router');
        // page
        app.use(page.routes());
        app.use(page.allowedMethods());
    }
};

export {
    start
}
