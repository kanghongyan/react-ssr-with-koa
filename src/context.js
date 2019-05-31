"use strict";
exports.__esModule = true;
var path = require('path');
function getReactServerEntryByPage(name) {
    return require(path.resolve("build/server/" + name + ".generated.js"));
}
exports.getReactServerEntryByPage = getReactServerEntryByPage;
// todo: 改下名字
function getTplByPage(name) {
    return path.resolve("template/" + name + ".html");
}
exports.getTplByPage = getTplByPage;
function getManifest() {
    return require(path.resolve("build/asset-manifest.json"));
}
exports.getManifest = getManifest;
function getBundleAssets() {
    return require(path.resolve("build/react-loadable.json"));
}
exports.getBundleAssets = getBundleAssets;
function getSSRConfig() {
    return require(path.resolve("config/ssr.js"));
}
exports.getSSRConfig = getSSRConfig;
