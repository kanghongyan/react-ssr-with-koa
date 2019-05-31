import {getBundleAssets, getManifest} from '../context'
import { staticPath } from '../def'
import {getBundles} from "react-loadable/webpack";

const _getAsyncBundle = (modules, preLoc) => {

    let loadableJson = getBundleAssets();


    let bundles = [];

    try {
        bundles = getBundles(loadableJson, modules)
    } catch (e) {
        // todo: logger
    }

    return bundles
        .filter((bundle) => {
            return /\.js$/.test(bundle.file)
        })
        .map((item) => item ? `${preLoc}${item.file}` : '')
};


function getCss(page: string, asyncModules?): string[]  {
    const manifest =  getManifest();

    if (!manifest) return  [];

    const preLoc = staticPath.css;

    const commonCss = manifest[`vendor.css`] ?
        [`${preLoc}${manifest[`vendor.css`]}`] :
        [];

    const pageCss = manifest[`${page}.css`] ?
        [`${preLoc}${manifest[`${page}.css`]}`]:
        [];

    return [
        ...commonCss,
        ...pageCss
    ]
}

function getScripts(page: string, asyncModules): string[] {
    const manifest =  getManifest();

    if (!manifest) return  [];

    const preLoc = staticPath.js;

    const modules = _getAsyncBundle(asyncModules, preLoc);

    return [
        `${preLoc}${manifest['runtime.js']}`,
        `${preLoc}${manifest['vendor.js']}`,
        ...modules,
        `${preLoc}${manifest[`${page}.js`]}`
    ]
}

export {
    getCss,
    getScripts
}
