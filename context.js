const path = require('path');

module.exports = {
    getCustomDef:
        (name = 'server.js') => {

            // todo: 先写死
            // _getContext(require.context('rootConfig', false, /server\.js/), name),
            // return require(path.resolve('config/server.js'))
            return require(path.resolve(`config/server`))
        },
    getAppByPage:
        (name) => {
            return require(path.resolve(`_server/dist/${name}.generated.js`));
        },
    getTplByPage:
        (name) => {
            return require(path.resolve(`template/${name}.js`))
        },
    getManifest:
        (name = 'asset-manifest.json') => {
            return require(path.resolve(`_server/asset-manifest.json`))
        },
    getBundleAssets:
        (name = 'react-loadable.json') => {
            return require(path.resolve(`_server/react-loadable.json`))
        },
    getSSRConfig: (name = 'ssr.js') => {
        return require(path.resolve(`config/${name}`))
    }
};