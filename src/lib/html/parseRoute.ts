import { matchPath, Router } from 'react-router-dom'

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


// copy from react-router-config matchRoutes
function matchRoutes(routes: routeItem[], pathname: string, /*not public API*/ branch = []): matchedRoutes[] {
    routes.some(route => {
        const match = route.path
            ? matchPath(pathname, route)
            : branch.length
                ? branch[branch.length - 1].match // use parent match
                : Router.computeRootMatch(pathname); // use default "root" match

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


    // 获取初始数据。getInitialProps优先级大于injectInitialData
    const promises = matchedRoute.map(async ({ route, match }) => {

        if (isStop) {
            return Promise.resolve(null)
        }

        const comp = await getRouteComp(route.component);
        const compName = comp.displayName || comp.name;
        _tempRouteComp.push(comp);

        const initialData = comp.getInitialProps
            ? comp.getInitialProps(ctx, match)
            : Promise.resolve(defaultInitialData[compName]);

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
};


export {
    matchRoutes,
    getRouteInitialData
};
