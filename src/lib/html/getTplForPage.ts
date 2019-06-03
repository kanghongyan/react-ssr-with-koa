import * as ejs from 'ejs';
import * as fs from 'fs';

import { getTplByPage } from '../../context'
const flexibleStr = fs.readFileSync('node_modules/lm-flexible/build/changeRem-min.js', 'utf-8');

const getTpl = (ctx, page, stringMarkup, preloadState, options) => {

    return new Promise((resolve: (ret: string) => void, reject: (ret: string) => void) => {

        const tpl = getTplByPage(page);

        if (tpl) {

            ejs.renderFile(tpl, {
                ...options,
                flexibleStr,
                stringMarkup,
                preloadState
            }, {
                cache: false
            }, function(err, str){
                // str => Rendered HTML string
                err ? reject(err.stack) : resolve(str)
            });

        } else {
            reject(`template file : ${tpl} is missing!`)
        }




    })

};

export {
    getTpl
};
