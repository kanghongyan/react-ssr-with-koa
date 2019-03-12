let logger = null;

const init = (loggerIns) => {
    if (loggerIns) {
        logger = loggerIns;
    } else {
        logger = require('./defaultLogger');
    }
};

module.exports = {
    init: init,
    info: (msg) => {
        logger.info && logger.info(msg)
    },
    error: (msg) => {
        logger.error && logger.error(msg)
    },
    logger: logger
};