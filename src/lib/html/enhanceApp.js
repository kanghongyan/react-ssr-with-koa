"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var url = require("url");
var logger_1 = require("../logger");
var enhanceApp = function (_a) {
    var initialData = _a.initialData, routeProps = __rest(_a, ["initialData"]);
    return function (Component) {
        // 将initialData注入到App中
        if (Component.App) {
            Component.App.defaultProps = {};
            Component.App.defaultProps['initialData'] = initialData;
        }
        try {
            routeProps.location = url.parse(routeProps.location).path;
        }
        catch (e) {
            logger_1.logger.error("ctx.req.url error: " + e.stack);
        }
        return /** @class */ (function (_super) {
            __extends(InnerApp, _super);
            function InnerApp() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            InnerApp.prototype.render = function () {
                return (React.createElement(Component, __assign({}, routeProps)));
            };
            return InnerApp;
        }(React.Component));
    };
};
exports.enhanceApp = enhanceApp;
//# sourceMappingURL=enhanceApp.js.map