const getTplByPage = require('../../context').getTplByPage;
const ejs = require('ejs');

const getTplForPage = (ctx, page, stringMarkup, preloadState, options) => {

    return new Promise((resolve, reject) => {

        const tpl = getTplByPage(page);

        if (tpl) {

            ejs.renderFile(tpl, {
                ...options,
                stringMarkup,
                preloadState
            }, {
                cache: false
            }, function(err, str){
                // str => Rendered HTML string
                err ? reject(err) : resolve(str)
            });

        } else {
            reject(`template file : ${tpl} is missing!`)
        }




    })

};

module.exports = getTplForPage;