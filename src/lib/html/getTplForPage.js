"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ejs = require("ejs");
var fs = require("fs");
var getTplByPage = require('../../context').getTplByPage;
var flexibleStr = fs.readFileSync('node_modules/lm-flexible/build/changeRem-min.js', 'utf-8');
var getTpl = function (ctx, page, stringMarkup, preloadState, options) {
    return new Promise(function (resolve, reject) {
        var tpl = getTplByPage(page);
        if (tpl) {
            ejs.renderFile(tpl, __assign({}, options, { flexibleStr: flexibleStr,
                stringMarkup: stringMarkup,
                preloadState: preloadState }), {
                cache: false
            }, function (err, str) {
                // str => Rendered HTML string
                err ? reject(err.stack) : resolve(str);
            });
        }
        else {
            reject("template file : " + tpl + " is missing!");
        }
    });
};
exports.getTpl = getTpl;
//# sourceMappingURL=getTplForPage.js.map