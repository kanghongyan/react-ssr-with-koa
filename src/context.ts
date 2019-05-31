const path = require('path');

function getReactServerEntryByPage(name: string) {
    return require(path.resolve(`build/server/${name}.generated.js`))
}

// todo: 改下名字
function getTplByPage(name: string): string {
    return path.resolve(`template/${name}.html`)
}

function getManifest(): any {
    return require(path.resolve(`build/asset-manifest.json`))
}

function getBundleAssets(): any {
    return require(path.resolve(`build/react-loadable.json`))
}

function getSSRConfig(): {
    appEntry: object
} {
    return require(path.resolve(`config/ssr.js`))
}


export {
    getReactServerEntryByPage,
    getTplByPage,
    getManifest,
    getBundleAssets,
    getSSRConfig
}
