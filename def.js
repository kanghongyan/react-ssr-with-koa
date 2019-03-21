const {
    STATIC_SERVER,
    LOG_DIR,
    LOG_DIR_DEPLOY
} = require('./constants');

const getStaticPath = require('./dist/util/getStaticPath');

const {getSSRConfig} = require('./context');

const staticPath = getStaticPath();


const dev = process.env.NODE_ENV === 'development';

// todo: 格式校验

module.exports = {
    maxMem: '300M',
    logDir: dev ? LOG_DIR : LOG_DIR_DEPLOY,
    pagesMap: getSSRConfig().appEntry || [],

    // below can config
    // 本地开发静态资源起的服务，用于获取html
    staticPath: staticPath || {js: STATIC_SERVER}

};
