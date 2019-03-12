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
        logger && logger.info && logger.info(msg)
    },
    error: (msg) => {
        logger && logger.error && logger.error(msg)
    },
    logger: logger
};