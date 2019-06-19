import * as _ from 'lodash'
import * as path from 'path'
import * as fs from 'fs'

const EARTH_CONFIG_NAME = `config`;

const ENV = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
const webpackConfig = (function getCustomConfig() {
    const customConfigPath = path.resolve(`./${EARTH_CONFIG_NAME}/webpack.client.${ENV}.js`);
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
            js: config[ENV],
            img: config[ENV],
            css: config[ENV],
            media: config[ENV]
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

export {
    getStaticPath
}
