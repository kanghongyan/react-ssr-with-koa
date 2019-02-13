const _ = require('lodash');
const path = require("path");
const EARTH_CONFIG_NAME = `config`;
const fs = require('fs');

const ENV = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
const webpackConfig = (function getCustomConfig() {
    const customConfigPath = path.resolve(`./${EARTH_CONFIG_NAME}/webpack.config.${ENV}.js`);
    return fs.existsSync(customConfigPath) ? require(customConfigPath) : {}
})();

function getStaticPath() {

    const STATICPATH_CONFIG_NAME = 'config/staticPath.js';


    let config = {};
    const publicPath = _.get(webpackConfig, ['output', 'publicPath']);

    if (!publicPath) {
        try {
            config = require(path.resolve(STATICPATH_CONFIG_NAME))
        } catch (e) {
        }
    }

    // read from webpack.config.js
    if (_.isString(publicPath)) {
        return {
            js: publicPath,
            img: publicPath,
            css: publicPath,
            media: publicPath
        }
    }

    // read from staticPath.js
    if (ENV === 'dev') {

        // config/staticPath
        return {
            js: config[ENV]
        }
    }

    if (ENV === 'prod') {

        // webpack.config.dev.js
        if (_.isPlainObject(publicPath)) {
            return publicPath
        }

        // config/staticPath
        return config[ENV]
    }

    return null
}

module.exports = getStaticPath