"use strict";
exports.__esModule = true;
var context_1 = require("../context");
var path = require("path");
var ssrConfig = context_1.getSSRConfig();
var preLoadComp = function () {
    var appEntry = ssrConfig.appEntry || {};
    Object.keys(appEntry).map(function (key) {
        require(path.resolve("build/server/" + key + ".generated.js"));
    });
};
exports.preLoadComp = preLoadComp;
