let _logger = null;

const init = (loggerIns) => {
    if (loggerIns) {
        _logger = loggerIns;
    } else {
        _logger = require('./defaultLogger').logger;
    }
};

const logger = {
    init: init,
    info: (msg) => {
        _logger && _logger.info && _logger.info(msg)
    },
    error: (msg) => {
        _logger && _logger.error && _logger.error(msg)
    },
};


export {
    logger
}
