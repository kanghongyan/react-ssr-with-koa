const React = require('react');
const ReactDOMServer = require('react-dom/server');
// const multiStream = require('multistream');
// const stringStream = require('string-to-stream');
const Loadable = require('react-loadable');

// const cheerio = require('cheerio');
const getAppForPage = require('./getAppForPage');
const logger = require('../logger');
const maxMem = require('../../def').maxMem;
const getInitialData = require('./getInitialData');
const enhanceApp = require('./enhanceApp');
const getScripts = require('../util/getScripts');
const getCss = require('../util/getCss');
const { matchRoutes, getRouteInitialData } = require('../util/parseRoute');
const getTpl = require('./getTplForPage')


const osBusy = require('../util/osCheck');

// const enableReaderStream = (() => (+React.version.split('.')[0] === 16))();

// todo: renderToNodeStream react-loadable cannot support
const ReactDomRenderMethod = (() => {
    // if (enableReaderStream) {
    //     return ReactDOMServer.renderToNodeStream
    // } else {
    //     return ReactDOMServer.renderToString
    // }
    return ReactDOMServer.renderToString
})();



/**
 * const htmlObj = new Html(req, page)
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

        let App = null;
        try {
            App = getAppForPage(this.page);
        } catch (e) {
            App = require('./MissingComp');
            logger.error(e.stack)
        }

        if (!App.App) {
            App.App = () => {}
        }

        // save option
        this.option = option;
        this.app = App;


        return this
    }


    injectInitialData(data) {
        if (!this.option.ssr) return this;

        this.initialData.pageProps = data.pageProps || {};
        this.initialData.routeProps = data.routeProps || {};

        return this
    }



    async render(customData = {}) {

        const ctx = this.ctx;

        // 内存占用大于300M时关闭ssr
        // todo: 判断负载过高用内存？？
        if (process.env.NODE_ENV !== 'development') {
            const _osBusy = osBusy({maxMem: maxMem});
            if (_osBusy) {
                logger.info(`mem usage: ${_osBusy}`);
                this.option.ssr = false;
            }
        }


        const { ssr } = this.option;

        // !ssr
        if (!ssr) {
            ctx.set('Content-Type', 'text/html; charset=utf-8');
            ctx.status = 200;
            ctx.body = await this.__generateTpl('', customData);

            return
        }


        this.app = await this.__enhanceApp(this.app);


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
            ctx.redirect(this.routerContext.url, 302)
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
    async __generateTpl (pageMarkup = '', customData = {}) {
        const scripts = getScripts(this.page, this.modules);
        const css = getCss(this.page);

        let fullHtml = '';

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


    /**
     * 包装App，获取初始数据
     * @param App
     * @return {Promise<*>}
     * @private
     */
    async __enhanceApp(App) {

        // getInitialStore
        App.getInitialStore && await App.getInitialStore(this.ctx);

        // get InitialData from <App/>
        this.initialData.pageProps = Object.keys(this.initialData.pageProps).length ? this.initialData.pageProps : await getInitialData(App, this.ctx);
        this.__PRELOADED_STATE__.pageProps = this.initialData.pageProps;

        // get InitialData from route Component
        const routeConfig = App.routeConfig ? App.routeConfig : null;
        if (routeConfig) {
            const pathname = this.ctx.request.path.replace(`/${this.page}`, '');
            const matchedRoute = matchRoutes(routeConfig, pathname);
            this.initialData.routeProps = await getRouteInitialData(this.ctx, matchedRoute, this.initialData.routeProps);
            this.__PRELOADED_STATE__.routeProps = this.initialData.routeProps;
        }

        // get InitialData from store
        if (this.ctx.reduxStore && this.ctx.reduxStore.getState) {
            this.__PRELOADED_STATE__.store = this.ctx.reduxStore.getState();
        }

        const EnhancedApp = enhanceApp({
            initialData: this.initialData.pageProps,
            basename: this.page,
            location: this.req.url,
            context: this.routerContext,
            store: this.ctx.reduxStore
        })(App);
        // const EnhancedApp = App;

        return EnhancedApp
    }

    /**
     * reactDom.renderToString()
     * ReactDomRenderMethod(App)
     * @return {*}
     * @private
     */
    __getPageMarkup() {

        const App = this.app;


        return ReactDomRenderMethod(
            <Loadable.Capture report={moduleName => this.modules.push(moduleName)}>
                <App/>
            </Loadable.Capture>
        );
    }

    // /**
    //  * 没有redux
    //  * ReactDomRenderMethod(App)
    //  * @return {*}
    //  * @private
    //  */
    // __getPageMarkup() {
    //
    //     return ReactDomRenderMethod(
    //         this.__appWithRouter()
    //     );
    // }


    // __appWithRouter() {
    //     const App = this.app;
    //
    //     return (
    //         <Loadable.Capture report={moduleName => this.modules.push(moduleName)}>
    //             <StaticRouter
    //                 basename={`/${this.page}`}
    //                 location={this.req.url}
    //                 context={this.routerContext}
    //             >
    //                 <App/>
    //             </StaticRouter>
    //         </Loadable.Capture>
    //     )
    // }


    // old-render
    // get html
    // const html = await readFile(this.page).catch((err) => {
    //     console.error('GET FILE ERROR: ' + err);
    // });

    //  this._$html = cheerio.load(html || '');

    // /**
    //  * 异步获取html
    //  * @return {*}
    //  * @private
    //  */
    // get __initHtml() {
    //
    //     if (this._$html) return this._$html;
    //
    //     return (async () => {
    //         const html = await readFile(this.page).catch((err) => {
    //             console.error('GET FILE ERROR: ' + err);
    //         });
    //
    //
    //         this._$html = cheerio.load(html || '');
    //         return this
    //     })()
    // }


    // /**
    //  * !ssr时直接输出
    //  * @private
    //  */
    // __renderToString() {
    //     this.ctx.set('Content-Type', 'text/html; charset=utf-8');
    //     this.ctx.status = 200;
    //     this.ctx.body = this._$html.html()
    // }

    // /**
    //  * ssr时stream输出
    //  * @param pageMarkup
    //  * @private
    //  */
    // __renderToStream(pageMarkup = ' ') {
    //
    //     const scripts = getScripts(this.page, this.modules);
    //
    //     const stream = typeof pageMarkup === 'string' ? stringStream(pageMarkup) : pageMarkup;
    //     const ctx = this.ctx;
    //     const _$ = this._$html;
    //
    //
    //     // 将initState塞进head
    //     const initState = `window.__PRELOADED_STATE__ = ${JSON.stringify(this.__PRELOADED_STATE__).replace(/</g, '\\\u003c')}`
    //     this._$html('head').append(`<script>${initState}</script>`);
    //     // 移除root
    //     _$('#root').remove();
    //
    //
    //     const  htmlWriter = new pageStream({
    //         head: `<!DOCTYPE html><html>${_$('head').html()}<body><div id='root'>`,
    //         // footer: `</div>${_$('body').html()}</body></html>`
    //         footer: `</div>${scripts.map((s) => `<script type="text/javascript" src="${s}"></script>`).join('\n')}</body></html>`
    //     });
    //
    //
    //     if (this.routerContext.url) {
    //         ctx.redirect(this.routerContext.url, 302)
    //     } else {
    //         ctx.set('Content-Type', 'text/html; charset=utf-8');
    //         ctx.status = 200;
    //         ctx.body = stream.pipe(htmlWriter)
    //     }
    //
    //
    //     // todo: 以下方式压测时会有Error: read ECONNRESET错误
    //     /*ctx.set('Content-Type', 'text/html; charset=utf-8');
    //     ctx.status = 200;
    //
    //     try {
    //         ctx.body = multiStream(
    //             [
    //                 stringStream(`<!DOCTYPE html><html>${_$('head').html()}<body><div id='root'>`),
    //                 stream,
    //                 stringStream(`</div>${_$('body').html()}</body></html>`)
    //             ]
    //         )
    //     } catch (e) {
    //         console.log(e);
    //         ctx.body = 'html parse failed'
    //     }*/
    //
    //
    //
    // }


}

module.exports = Html;

