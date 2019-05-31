"use strict";
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
//
// const { window } = new JSDOM(``, {
//     url: "http://localhost"
// });
exports.__esModule = true;
// const window = jsdom.jsdom().defaultView;
//
// module.exports = window;
var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
var window = new JSDOM("...").window;
exports.window = window;
