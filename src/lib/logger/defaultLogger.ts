import * as fs from 'fs'
import * as path from 'path'
import * as winston from 'winston'
import DailyRotateFile = require('winston-daily-rotate-file');

import { logDir as defaultLogDir } from '../../def'
const { createLogger, format } = winston;
const { combine, timestamp, label, json, printf } = format;

let logDir = defaultLogDir;

try {
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir)
    }
} catch(e) {
    console.log(e);
    logDir = path.resolve('log');
    console.log(`mkdir fail, now logDir is ${logDir}`)
}


const commonOption = {
    datePattern: 'YYYY-MM-DD',
    // zippedArchive: true,
    // maxSize: '20m',
    maxFiles: '14d'
};

const myFormat = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.message}`;
});

const transports = [
    new winston.transports.Console({ level: 'error' }),
    // new winston.transports.Console(),
    //
    // - Write to all logs with level `info` and below to `combined.log`
    //
    new (DailyRotateFile)(
        Object.assign({}, commonOption, {
            filename: path.join(logDir, './app.log.info-%DATE%'),
            level: 'info',
        })),
    new (DailyRotateFile)(
        Object.assign({}, commonOption, {
            filename: path.join(logDir, './app.log.error-%DATE%'),
            level: 'error',
        })
    )
]

const logger = createLogger({
    // level: 'info',
    exitOnError: false,
    format: combine(
        label({ label: 'msg' }),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS'
        }),
        myFormat
    ),
    transports: transports
});

logger.on('error', function (err) {
    /* Do Something */
    logger.error(err)
});

export {
    logger
}
