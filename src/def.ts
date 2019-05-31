import {
    STATIC_SERVER,
    LOG_DIR,
    LOG_DIR_DEPLOY
} from './constants'

import { getStaticPath } from './util/getStaticPath'
import { getSSRConfig } from './context'


const dev = process.env.NODE_ENV === 'development';

const logDir: string = dev ? LOG_DIR : LOG_DIR_DEPLOY;
const pagesMap: object = getSSRConfig().appEntry || {};
const staticPath: {
    js: string,
    css: string,
    img: string,
    media: string
} = getStaticPath() ||  {js: STATIC_SERVER, css: STATIC_SERVER, img: STATIC_SERVER, media: STATIC_SERVER};

export {
    logDir,
    pagesMap,

    // below can config
    // 本地开发静态资源起的服务，用于获取html
    staticPath
}
