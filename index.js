const {Html}  = require('./dist/lib/html');
const {logger} = require('./dist/lib/logger');
const {proxyToServer} = require('./dist/lib/proxyToServer');
const {start} = require('./dist/start');


module.exports = {
    Html,
    logger,
    proxyToServer,
    start
};
