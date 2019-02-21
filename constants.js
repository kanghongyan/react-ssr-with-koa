const path = require('path');

module.exports = {
    SSR_PORT: 8001,
    PROXY_PATH: 'http://localhost:3101',
    STATIC_SERVER: 'http://localhost:3000',
    SELF_HANDLE_RESPONSE: false,

    CLIENT_BUILD_PATH: path.resolve('build'),
    LOG_DIR: path.resolve('log'),
    LOG_DIR_DEPLOY: '/opt/nodejslogs'
};