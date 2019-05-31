"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
require("ignore-styles"); // 不处理require('xx.scss')这种文件 https://www.npmjs.com/package/ignore-styles
// import 'babel-polyfill';
// client和server端通用的fetch
require("isomorphic-unfetch");
var Loadable = require("react-loadable");
var bodyParser = require("koa-bodyparser");
var router = require("./router");
var window_1 = require("./fakeObject/window");
// 兼容处理：为global添加window相关对象
global.window = window_1.window;
global.document = window_1.window.document;
global.navigator = window_1.window.navigator;
// preLoad all react modules for react-loadable
var preLoadComp_1 = require("./util/preLoadComp");
preLoadComp_1.preLoadComp();
var start = function (app, _a) {
    var _b = _a.useDefaultProxy, useDefaultProxy = _b === void 0 ? false : _b, _c = _a.useDefaultSSR, useDefaultSSR = _c === void 0 ? false : _c;
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, Loadable.preloadAll()];
                case 1:
                    _d.sent();
                    if (!app)
                        return [2 /*return*/];
                    if (useDefaultProxy) {
                        // bodyParser
                        app.use(bodyParser());
                        app.use(function (ctx, next) {
                            // 开启了bodyparser
                            // 约定，向req中注入_body for "proxyToServer"
                            ctx.req._body = ctx.request.body;
                            return next();
                        });
                    }
                    if (useDefaultSSR) {
                        // page
                        app.use(router.page.routes());
                        app.use(router.page.allowedMethods());
                    }
                    return [2 /*return*/];
            }
        });
    });
};
exports.start = start;
