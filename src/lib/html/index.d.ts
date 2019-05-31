import * as Koa from "koa";
import * as React from "react";

declare class Html {
    constructor(ctx: Koa.Context, page: string)  //构造函数
    init(option: {ssr?: boolean}): Html
    injectInitialData(data: {dataProps: object, routeProps: object}): Html
    render(customData?: object): Promise<void>
}

export {
    Html
}
