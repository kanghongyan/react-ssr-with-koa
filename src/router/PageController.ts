import { RouterUse, Request, FindPage, BindThis} from './decorater'
import {Html} from '../lib/html';
import { pagesMap } from '../def'

debugger

enum METHOD {
    GET = 'get',
    POST = 'post'
}



@RouterUse(Object.keys(pagesMap).map(p => `/${p}`))
class PageController {

    page: string;


    @Request({url: ['/', '/*'], method: METHOD.GET})
    @FindPage
    @BindThis
    async render(ctx) {
        const htmlObj = new Html(ctx, this.page)
            .init({
                ssr: true,
            });

        await htmlObj.render().catch((e) => {
            console.log(e);
            console.log('page get file error')
        });

        console.log(ctx.status);

        return
    }
}

export {
    PageController
}
