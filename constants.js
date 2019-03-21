const path = require('path');

module.exports = {
    STATIC_SERVER: 'http://localhost:3000',

    LOG_DIR: path.resolve('log'),
    LOG_DIR_DEPLOY: '/opt/nodejslogs'
};