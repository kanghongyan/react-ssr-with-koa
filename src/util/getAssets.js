"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context");
var def_1 = require("../def");
var webpack_1 = require("react-loadable/webpack");
var _getAsyncBundle = function (modules, preLoc) {
    var loadableJson = context_1.getBundleAssets();
    var bundles = [];
    try {
        bundles = webpack_1.getBundles(loadableJson, modules);
    }
    catch (e) {
        // todo: logger
    }
    return bundles
        .filter(function (bundle) {
        return /\.js$/.test(bundle.file);
    })
        .map(function (item) { return item ? "" + preLoc + item.file : ''; });
};
function getCss(page, asyncModules) {
    var manifest = context_1.getManifest();
    if (!manifest)
        return [];
    var preLoc = def_1.staticPath.css;
    var commonCss = manifest["vendor.css"] ?
        ["" + preLoc + manifest["vendor.css"]] :
        [];
    return commonCss.concat([
        "" + preLoc + manifest[page + ".css"]
    ]);
}
exports.getCss = getCss;
function getScripts(page, asyncModules) {
    var manifest = context_1.getManifest();
    if (!manifest)
        return [];
    var preLoc = def_1.staticPath.js;
    var modules = _getAsyncBundle(asyncModules, preLoc);
    return [
        "" + preLoc + manifest['runtime.js'],
        "" + preLoc + manifest['vendor.js']
    ].concat(modules, [
        "" + preLoc + manifest[page + ".js"]
    ]);
}
exports.getScripts = getScripts;
//# sourceMappingURL=getAssets.js.map