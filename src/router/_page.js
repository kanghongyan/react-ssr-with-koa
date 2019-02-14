const Router = require('koa-router');
const html = require('../../dist/html');


module.exports = (page) => {

    const router = new Router();

    router.get(['/', '/*'],
        // page middleware
        async (ctx, next) => {

            const htmlObj = new html(ctx, page)
                .init({
                    ssr: true,
                });

            await htmlObj.render().catch((e) => {
                console.log(e)
                console.log('page get file error')
            });

        }
    );

    return router
};