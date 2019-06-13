// export default  start

import * as Koa from "koa";

declare module ReactSSRWithKoa {
    function start(app: Koa, option: {useDefaultProxy: boolean, useDefaultSSR: boolean}): Promise<void>;

    function proxyToServer(ctx: Koa.Context, option: object): Promise<any>;

    namespace logger {
        function init(ins: {info: () => {}, error: () => {}}): void;
        function info(): void;
        function error(): void
    }

    class Html {
        constructor (ctx: Koa.Context, page: string)
        init(option: {ssr?: boolean}): Html
        injectInitialData(data: {dataProps: object, routeProps: object}): Html
        render(customData?: object): Promise<void>
    }
}

declare module 'react-ssr-with-koa/WrapperForContainer' {
    function WrapperForContainer(option: {
        name: string,
        type: string
    }): () => {};

    export = WrapperForContainer
}

declare module 'react-ssr-with-koa/getStoreInitData' {
    function getStoreInitData(): object;

    export = getStoreInitData
}


export = ReactSSRWithKoa


