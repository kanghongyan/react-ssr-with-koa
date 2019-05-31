"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context");
var logger_1 = require("../logger");
var MissingComp_1 = require("./MissingComp");
var getSSREntryForPage = function (page) {
    var App = MissingComp_1.Missing;
    try {
        App = context_1.getReactServerEntryByPage(page).default;
    }
    catch (e) {
        logger_1.logger.error(e.stack);
        console.log("build/server/" + page + ".generated.js is missing!");
    }
    return App;
};
exports.getAppForPage = getAppForPage;
//# sourceMappingURL=getAppForPage.js.map
