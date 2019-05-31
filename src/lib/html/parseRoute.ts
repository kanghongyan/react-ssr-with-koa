// @ts-ignore
import { matchPath } from 'react-router-dom'

interface routeItem {
    component: any,
    path: string | [],
    strict?: boolean,
    exact?: boolean,
    [propName: string]: any
}

interface matchedRoutes {
    // todo: react-router-dom类型
    match: {
        path: string,
        url: string,
        isExact: boolean,
        params: object
    },
    route: routeItem
}


const getRouteComp = async (matchedRoute) => {
    const _comp = matchedRoute.preload ? await matchedRoute.preload() : {default: matchedRoute}
    return _comp.default
};


function matchRoutes(routes: routeItem[], pathname: string, /*not public API*/ branch = []): matchedRoutes[] {
    routes.some(route => {
        const match = route.path
            ? matchPath(pathname, route)
            : branch.length
                ? branch[branch.length - 1].match // use parent match
                : {}; // use default "root" match

        // todo: Router.computeRootMatch(pathname);
        // todo: react-router v3 not support

        if (match) {
            branch.push({ route, match });

            if (route.routes) {
                matchRoutes(route.routes, pathname, branch);
            }
        }

        return match;
    });

    return branch;
}

/**
 *
 * @param ctx
 * @param matchedRoute
 * @param defaultInitialData 直接从html()中传过来的初始数据
 * @return {Promise<void>}
 */
const getRouteInitialData = async (ctx, matchedRoute, defaultInitialData) => {

    let _tempRouteComp = [];
    let finalData = {};
    let isStop = false;

    // 已经传入初始数据
    if (defaultInitialData && Object.keys(defaultInitialData).length) {
        const promise = matchedRoute.map(async ({ route, match }) => {
            return  await getRouteComp(route.component);
        });
        const routeComp = await Promise.all(promise);

        routeComp.forEach((comp: any) => {
            const compName = comp.displayName || comp.name;
            const data = defaultInitialData[compName];

            if (data) {
                comp.defaultProps = {};
                comp.defaultProps['initialData'] = data;
                finalData[compName] = data
            }
        });

        return finalData
    }


    // 无初始数据，尝试从组件下getInitialProps中拿
    const promises = matchedRoute.map(async ({ route, match }) => {

        if (isStop) {
            return Promise.resolve(null)
        }

        const comp = await getRouteComp(route.component);
        _tempRouteComp.push(comp);

        const initialData = comp.getInitialProps
            ? comp.getInitialProps(ctx, match)
            : Promise.resolve(null);

        if (`${ctx.status}` !== `404`) {
            isStop = true
        }

        return initialData
    });


    const initialData = await Promise.all(promises);

    initialData.reduce((ret, next, i, arr): any => {
        const comp = _tempRouteComp[i];
        const compName = comp.displayName || comp.name;
        if (compName && initialData[i]) {
            finalData[compName] = next;
            comp.defaultProps = {};
            comp.defaultProps['initialData'] = initialData[i]
        }
    }, finalData);

    return finalData
}


export {
    matchRoutes,
    getRouteInitialData
};
