// PTS: PROXY_TO_SERVER
const RES_CODE = {
    PTS_ERROR: 'PTS_ERROR',       // 代理失败
    PTS_EMPTYBODY: 'PTS_EMPTYBODY',    // 代理成功，但是返回数据为空
    PTS_PARSEFAIL: 'PTS_PARSEFAIL',     // 代理成功，parse json失败
    PTS_SEND_TO_CLIENT_ERROR: 'PTS_SEND_TO_CLIENT_ERROR', // 发送给client失败
    PTS_GZIP_PARSED_ERROR: 'PTS_GZIP_PARSED_ERROR'  // gizp parsed失败
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