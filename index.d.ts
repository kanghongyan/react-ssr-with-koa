// export default  start

import * as Koa from "koa";

declare namespace Ns_MainExport {
    interface Html {
        new (ctx: Koa.Context, page: string)
        init(option: {ssr?: boolean}): Html
        injectInitialData(data: {pageProps?: object, routeProps?: object}): Html
        render(customData?: object): Promise<void>
    }

    interface reactSsrWithKoa {
        start(app: Koa, option: {useDefaultProxy: boolean, useDefaultSSR: boolean}): Promise<void>;

        proxyToServer(ctx: Koa.Context, option: object): Promise<any>;

        logger: {
            init(ins?: {info: () => {}, error: () => {}}): void;
            info(msg?): void;
            error(msg?): void;
        };

        Html: Html;
    }
}


declare const MainExport: Ns_MainExport.reactSsrWithKoa;

export = MainExport;



declare module 'react-ssr-with-koa' {
    export = MainExport
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



