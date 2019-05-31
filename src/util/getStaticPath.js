"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var path = require("path");
var fs = require("fs");
var EARTH_CONFIG_NAME = "config";
var ENV = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
var webpackConfig = (function getCustomConfig() {
    var customConfigPath = path.resolve("./" + EARTH_CONFIG_NAME + "/webpack.config." + ENV + ".js");
    return fs.existsSync(customConfigPath) ? require(customConfigPath) : {};
})();
function getStaticPath() {
    var STATICPATH_CONFIG_NAME = 'config/staticPath.js';
    var config = {};
    var publicPath = _.get(webpackConfig, ['output', 'publicPath']);
    if (!publicPath) {
        try {
            config = require(path.resolve(STATICPATH_CONFIG_NAME));
        }
        catch (e) {
        }
    }
    // read from webpack.config.js
    if (_.isString(publicPath)) {
        return {
            js: publicPath,
            img: publicPath,
            css: publicPath,
            media: publicPath
        };
    }
    // read from staticPath.js
    if (ENV === 'dev') {
        // config/staticPath
        return {
            js: config[ENV],
            img: config[ENV],
            css: config[ENV],
            media: config[ENV]
        };
    }
    if (ENV === 'prod') {
        // webpack.config.dev.js
        if (_.isPlainObject(publicPath)) {
            return publicPath;
        }
        // config/staticPath
        return config[ENV];
    }
    return null;
}
exports.getStaticPath = getStaticPath;
//# sourceMappingURL=getStaticPath.js.map