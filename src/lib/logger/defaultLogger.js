"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var winston = require("winston");
var DailyRotateFile = require("winston-daily-rotate-file");
var def_1 = require("../../def");
var createLogger = winston.createLogger, format = winston.format;
var combine = format.combine, timestamp = format.timestamp, label = format.label, json = format.json, printf = format.printf;
var logDir = def_1.logDir;
try {
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
}
catch (e) {
    console.log(e);
    logDir = path.resolve('log');
    console.log("mkdir fail, now logDir is " + logDir);
}
var commonOption = {
    datePattern: 'YYYY-MM-DD',
};
var myFormat = printf(function (info) {
    return info.timestamp + " [" + info.label + "] " + info.message;
});
var transports = [
    new winston.transports.Console({ level: 'error' }),
    // new winston.transports.Console(),
    //
    // - Write to all logs with level `info` and below to `combined.log`
    //
    new (DailyRotateFile)(Object.assign({}, commonOption, {
        filename: path.join(logDir, './app.log.info-%DATE%'),
        level: 'info',
    })),
    new (DailyRotateFile)(Object.assign({}, commonOption, {
        filename: path.join(logDir, './app.log.error-%DATE%'),
        level: 'error',
    }))
];
var logger = createLogger({
    // level: 'info',
    exitOnError: false,
    format: combine(label({ label: 'msg' }), timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }), myFormat),
    transports: transports
});
exports.logger = logger;
logger.on('error', function (err) {
    /* Do Something */
    logger.error(err);
});
//# sourceMappingURL=defaultLogger.js.map