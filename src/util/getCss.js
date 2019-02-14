const getManifest = require('../../context').getManifest;
const staticPath = require('../../def').staticPath;


const getCss = (page, asyncModules) => {


    // development
    if (process.env.NODE_ENV === 'development') {


        return []
    }
    // production
    else {

        let manifest =  getManifest();

        if (!manifest) return  [];

        const commonCss = manifest[`vendor.css`] ?
            [manifest[`vendor.css`]] :
            [];

        return [
            ...commonCss,
            `${staticPath.css}${manifest[`${page}.css`]}`
        ]

    }
};

module.exports = getCss;