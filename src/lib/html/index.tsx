import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server'
import * as Loadable from 'react-loadable'
import * as koa from 'koa'

import { getSSREntryForPage } from './getSSREntryForPage'
import { getInitialData } from './parseApp'
import { enhanceApp } from './enhanceApp'
import { matchRoutes, getRouteInitialData } from './parseRoute';
import { getTpl } from './getTplForPage'

import { logger } from '../logger'
import { getScripts, getCss } from '../../util/getAssets'


// const enableReaderStream = (() => (+React.version.split('.')[0] === 16))();

const ReactDomRenderMethod = (() => {
    // if (enableReaderStream) {
    //     return ReactDOMServer.renderToNodeStream
    // } else {
    //     return ReactDOMServer.renderToString
    // }
    return ReactDOMServer.renderToString
})();

// interface ServerApp {
//     getInitialStore?: any,
//     App: any,
//     routeConfig: object[]
// }

/**
 * const htmlObj = new Html(ctx, page)
 * .init({
 *     ssr: true/false,// 是否打开服务端渲染
 * })
 * // 如果不想在getInitialProps中请求数据，可以直接在这里给组件设置初始数据
 * {
 *     pageProps: {}, // 根组件
       routeProps: {  // 路由组件
            Home: {   // "Home"路由组件的名字
                data: xx   // 在server端可以通过props.data拿到xx
            }
       }
 * }
 * .injectInitialData()
 *
 * await htmlObj.render()
 */
class Html {

    readonly page: string;
    readonly req: koa.Request;
    readonly ctx: koa.Context;
    option: {
        ssr?: boolean
    };
    app: any;
    routerContext: {
        url?: string
    };
    modules: string[];
    initialData: {
        pageProps: object,
        routeProps: object
    };
    private __PRELOADED_STATE__: {
        pageProps: object,
        routeProps: object,
        store: object
    };

    constructor(ctx, page) {
        this.page = page;
        this.req = ctx.request;
        this.ctx = ctx;

        this.option = {};
        this.app = null;
        this.routerContext = {};
        this.modules = [];

        this.initialData = {
            pageProps: {},
            routeProps: {},
        };
        // 保存初始数据
        this.__PRELOADED_STATE__ = {
            pageProps: {},
            routeProps: {},
            store: {}
        };
    }

    /**
     * 初始化
     * @param option
     * {ssr: true|false}
     *
     * @return {Html}
     */
    init(option) {

        if (!option.ssr) {
            return this
        }

        const SSREntry = getSSREntryForPage(this.page);


        if (!SSREntry.App) {
            SSREntry.App = () => {}
        }

        // save option
        this.option = option;
        this.app = SSREntry;


        return this
    }

    /**
     * 向页面注入数据。可选
     * {
     *     pageProps: appComp的数据
     *     routeProps: {
     *         [routeCompName]: [routeCompInitialData]
     *     }
     * }
     * @param data
     */
    injectInitialData(data) {
        if (!this.option.ssr) return this;

        this.initialData.pageProps = data.pageProps || {};
        this.initialData.routeProps = data.routeProps || {};

        return this
    }


    /**
     * 渲染方法。生成html
     * @param customData
     */
    async render(customData = {}) {

        const ctx = this.ctx;
        const {ssr} = this.option;

        // !ssr
        if (!ssr) {
            ctx.set('Content-Type', 'text/html; charset=utf-8');
            ctx.status = 200;
            ctx.body = await this.__generateTpl('', customData);
            return
        }


        if (!await this.__getInitialData()) {
            return
        }

        this.app = enhanceApp({
            basename: this.page,
            location: this.req.url,
            context: this.routerContext,
            store: this.ctx.reduxStore
        })(this.app);


        // 不能为空字符串，stream会有问题
        // let pageMarkup = ' ';
        // todo: 引入tpl后不用stream
        let pageMarkup = '';

        try {
            pageMarkup = this.__getPageMarkup()
        } catch (e) {
            logger.error(e.stack);
            console.log('generate HTML error')
        }


        const fullHtml = await this.__generateTpl(pageMarkup, customData);


        if (this.routerContext.url) {
            ctx.redirect(this.routerContext.url, '302')
        } else {
            ctx.set('Content-Type', 'text/html; charset=utf-8');
            ctx.status = 200;
            ctx.body = fullHtml
        }

    }


    /**
     * 读tpl生成html文档
     * @param pageMarkup
     * @param customData
     * @return {string}
     * @private
     */
    async __generateTpl(pageMarkup = '', customData = {}): Promise<string> {
        const scripts: string[] = getScripts(this.page, this.modules);
        const css: string[] = getCss(this.page);

        let fullHtml: string = '';

        try {
            fullHtml = await getTpl(
                this.ctx,
                this.page,
                pageMarkup,
                this.option.ssr ? `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(this.__PRELOADED_STATE__).replace(/</g, '\\\u003c')}</script>` : '',
                {
                    ...customData,
                    js: scripts.map((s) => `<script type="text/javascript" src="${s}"></script>`).join('\n'),
                    css: css.map((s) => `<link href="${s}" rel="stylesheet">`).join('\n')
                }
            )
        } catch (e) {
            logger.error(e.stack)
        }

        return fullHtml
    }

    __assert(condition) {
        return async (...operation) => {
            for (let len = operation.length, i = 0; i < len; i ++) {
                if (condition()) {
                    await operation[i]()
                } else {
                    return false
                }
            }
            return true
        }
    }

    /**
     * use getInitialStore() set ctx.reduxStore
     * @param cb
     * @private
     */
    _initStore(cb?) {
        return async () => {
            this.app.getInitialStore && await this.app.getInitialStore(this.ctx);
            cb && cb()
        }
    }

    /**
     * App.getInitialProps(ctx)
     * @param cb
     * @private
     */
    _initAppData(cb?) {
        return async () => {
            this.initialData.pageProps = await getInitialData(this.app, this.ctx, this.initialData.pageProps);
            cb && cb(this.initialData.pageProps)
        }
    }

    /**
     * RouteContainer.getInitialProps(ctx, match)
     * @param cb
     * @private
     */
    _initRouteData(cb?) {
        return async () => {
            const routeConfig = this.app.routeConfig ? this.app.routeConfig : null;
            if (routeConfig) {
                const pathname = this.ctx.request.path.replace(`/${this.page}`, '');
                const matchedRoute = matchRoutes(routeConfig, pathname);
                this.initialData.routeProps = await getRouteInitialData(this.ctx, matchedRoute, this.initialData.routeProps);
                cb && cb(this.initialData.routeProps)
            }
        }
    }


    /**
     * 获取初始数据
     * @return {Promise<*>}
     * @private
     */
    async __getInitialData() {

        const next: boolean = await this.__assert(() => {
            return `${this.ctx.status}` === '404'
        })(
            this._initStore(),
            this._initAppData((data) => {
                this.__PRELOADED_STATE__.pageProps = data;
            }),
            this._initRouteData((data) => {
                this.__PRELOADED_STATE__.routeProps = data;
            }),
            () => {
                // get InitialData from store
                if (this.ctx.reduxStore && this.ctx.reduxStore.getState) {
                    this.__PRELOADED_STATE__.store = this.ctx.reduxStore.getState();
                }
            }
        );

        return next
    }

    /**
     * reactDom.renderToString()
     * ReactDomRenderMethod(App)
     * @return {*}
     * @private
     */
    __getPageMarkup(): string {

        const App = this.app;


        return ReactDomRenderMethod(
            <Loadable.Capture report={moduleName => this.modules.push(moduleName)}>
                <App/>
            </Loadable.Capture>
        );
    }

}

export {
    Html
}

