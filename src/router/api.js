const Router = require('koa-router');
const router = new Router();

const apiRouter = require('./_api');


module.exports = ({
                      prefix = 'api',
                      apiProxyBefore = () => {},
                      apiProxyReceived = () => {}
}) => {

    // proxy api
    router.use(`/${prefix}`, apiRouter({apiProxyBefore, apiProxyReceived, prefix}).routes());

    return router
};