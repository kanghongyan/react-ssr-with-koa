const page = require('./page');

const Router = require('koa-router');
const faviconRouter = new Router();



faviconRouter.get('/favicon.ico', (ctx, next) => {
    ctx.status = 200;
    ctx.body = ''
});



module.exports = {
    page,
    favicon: faviconRouter
};