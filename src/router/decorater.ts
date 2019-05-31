import * as Router from 'koa-router'
const router = new Router();

interface ReqParam {
    url: string | string[],
    method: string
}

function BindThis(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (...args) => {
        await fn.apply(target, args)
    };
    return descriptor
}

function FindPage(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    // target.page = 'account';
    descriptor.value =  async (_router) => {
        const matchedRoute = _router._matchedRoute.match(/^\/([^\/]+)/);
        target.page = matchedRoute ? matchedRoute[1] : '';

        await fn(_router)
    };

    return descriptor

}


// 方法装饰器
function Request({url, method}: ReqParam) {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        const fn = descriptor.value;
        descriptor.value = function _Request (_router) {
            _router[method](url, async (ctx, next) => {
                console.log('request')
                await fn(ctx, next)
            })
        }

        // return descriptor
    }
}

// 类装饰器
function RouterUse(path: string[]) {
    let _router = new Router();
    return function (target: any) {


        const routeFun = () => {
            let _router = new Router();

            const reqList = Object.getOwnPropertyDescriptors(target.prototype);
            for (let v in reqList) {
                if (v !== 'constructor' && typeof reqList[v].value === 'function') {
                    const fn = reqList[v].value;
                    fn && fn(_router)
                }
            }

            return _router
        };

        path.forEach((_p) => {
            router.use(_p, routeFun().routes());
        });

        // router.use('/index', _router.routes());
        router.use('/index|account', _router.routes());
        router.use('/ee', async () => {
            console.log('ff')
        });


        // router.use(_router.allowedMethods());

    }
}

function initPageCtrl() {
    debugger
    // todo: 先写死
    require('./PageController');
    return router
}

export {
    Request,
    RouterUse,
    initPageCtrl,
    FindPage,
    BindThis
}
