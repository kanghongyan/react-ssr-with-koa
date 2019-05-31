import * as path from 'path'

const STATIC_SERVER: string = 'http://localhost:3000';
const LOG_DIR: string = path.resolve('log');
const LOG_DIR_DEPLOY: string = '/opt/nodejslogs';

export {
    STATIC_SERVER,
    LOG_DIR,
    LOG_DIR_DEPLOY
}
