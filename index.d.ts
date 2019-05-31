// export default  start

import * as Koa from "koa";

declare namespace ReactSSRWithKoa {
    function start(app: Koa, option: {useDefaultProxy: boolean, useDefaultSSR: boolean}): Promise<void>;

    function proxyToServer(): Promise<any>;

    namespace logger {
        function init(ins: {info: () => {}, error: () => {}}): void;
        function info(): void;
        function error(): void
    }

    class Html {
        constructor(ctx: Koa.Context, page: string)  //构造函数
        init(option: {ssr?: boolean}): Html
        injectInitialData(data: {dataProps: object, routeProps: object}): Html
        render(customData?: object): Promise<void>
    }
}


export = ReactSSRWithKoa


