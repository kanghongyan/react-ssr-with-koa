"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _logger = null;
var init = function (loggerIns) {
    if (loggerIns) {
        _logger = loggerIns;
    }
    else {
        _logger = require('./defaultLogger').logger;
    }
};
var logger = {
    init: init,
    info: function (msg) {
        _logger && _logger.info && _logger.info(msg);
    },
    error: function (msg) {
        _logger && _logger.error && _logger.error(msg);
    },
};
exports.logger = logger;
//# sourceMappingURL=index.js.map