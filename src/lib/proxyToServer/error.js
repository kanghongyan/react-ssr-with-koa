// PTS: PROXY_TO_SERVER
const RES_CODE = {
    PTS_ERROR: 'PTS_ERROR',       // 代理失败
    PTS_UPSTREAM_500: 'PTS_UPSTREAM_500'
};

const resBody = (level, msg) => {
    return {
        code: level,
        msg: `ERROR: ${msg}`
    }
};

module.exports = {
    RES_CODE,
    resBody
};