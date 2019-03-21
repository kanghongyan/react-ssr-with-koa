const path = require('path');

module.exports = {
    getCustomDef:
        (name = 'server.js') => {
            return require(path.resolve(`config/server`))
        },
    getAppByPage:
        (name) => {
            return require(path.resolve(`build/server/${name}.generated.js`));
        },
    getTplByPage:
        (name) => {
            return path.resolve(`template/${name}.html`)
        },
    getManifest:
        (name = 'asset-manifest.json') => {
            return require(path.resolve(`build/asset-manifest.json`))
        },
    getBundleAssets:
        (name = 'react-loadable.json') => {
            return require(path.resolve(`build/react-loadable.json`))
        },
    getSSRConfig: (name = 'ssr.js') => {
        return require(path.resolve(`config/${name}`))
    }
};