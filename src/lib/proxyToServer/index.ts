import * as httpProxy from 'http-proxy'
import * as queryString from 'querystring'
import * as contentType from 'content-type';
import { resBody as errorBody, RES_CODE } from './error';
import { logger } from '../logger'

// const agent = _http.Agent({
//     keepAlive: false,
//     maxSockets: 10,
//     maxFreeSockets: 6,
//     keepAliveMsecs: 1000
// });

const proxy = httpProxy.createProxyServer({
    ignorePath: true
});

function _onProxyRes(proxyRes, req, res) {

    // set header
    Object.keys(proxyRes.headers).forEach(function(key) {
        let header = proxyRes.headers[key];
        res.setHeader(String(key).trim(), header)
    });

    const javaCode = proxyRes.statusCode;

    // case success
    if ( javaCode < 500 ) {
        res.statusCode = javaCode;
        proxyRes.pipe(res);
        return;
    }


    // case java problem
    let bufferArr = [];
    proxyRes.on('data', function (data) {
        bufferArr.push(Buffer.from(data));
    });
    proxyRes.on('end', function () {

        const javaContent = Buffer.concat(bufferArr).toString();
        const errorRes = errorBody(RES_CODE.PTS_UPSTREAM_500, javaContent);

        // 记录服务端返回的5xx错误
        logger.error(LOG_FORMAT.error({
            req,
            response: javaContent,
            errorCode: RES_CODE.PTS_UPSTREAM_500,
            errorStack: ''
        }));

        res.statusCode = 200;

        res.end(JSON.stringify(errorRes));

    });
}


function _onProxyError(e, req, res) {

    const data = JSON.stringify(errorBody(RES_CODE.PTS_ERROR, e.toString()));


    logger.error(LOG_FORMAT.error({
        req,
        response: data,
        errorCode: RES_CODE.PTS_ERROR,
        errorStack: e.stack
    }));



    res.statusCode = 200;
    // err: 代理失败
    res.write(JSON.stringify(errorBody(RES_CODE.PTS_ERROR, e.toString())));
    res.end()

}



// 使用agent,当sockets小于并发时会报错
// 压测bug Can't set headers after they are sent with bodyParser()
// todo: 暂时未找到根本性原因
proxy.on('proxyReq', function (proxyReq, req, res, options) {

    const body = req._body;

    if (!body) {
        return;
    }

    let _contType;
    let bodyData;

    try {
        _contType = contentType.parse(proxyReq).type
    } catch (e) {
        // logger.error(e.stack)
    }

    if (_contType === 'application/json') {
        bodyData = JSON.stringify(body);
    }

    if (_contType === 'application/x-www-form-urlencoded') {
        bodyData = queryString.stringify(body);
    }

    if (bodyData) {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        // proxyReq.end()
    }
});
proxy.on('proxyRes', function (proxyRes, req, res) {
    _onProxyRes(proxyRes, req, res)
});
proxy.on('error',  (e, req, res) => {
    _onProxyError(e, req, res)
});

const LOG_FORMAT = {
    info: ({req, ...option}) => {
        return `
API PROXY -->
   path: ${req.url}
   method: ${req.method}
   query: ${req.query || JSON.stringify(req._body)}
   time: ${option.time}
   status: ${option.status},
   response: ${option.response}
        `
    },
    error: ({req, ...option}) => {
        return `
API PROXY ERROR -->
   path: ${req.url},
   method: ${req.method}，
   query: ${req.query || JSON.stringify(req._body)}
   response: ${option.response},
   errorCode: ${option.errorCode},
   errorStack: ${option.errorStack} 
            `
    }
};



function proxyToServer(ctx, option) {
    const req = ctx.req;
    const res = ctx.res;

    return new Promise((resolve, reject) => {

        const { headers, ...customOption } = option;

        proxy.web(req, res,
            {
                selfHandleResponse: true,
                changeOrigin: true,
                // agent: agent,
                headers: {
                    ip: '',
                    'x-origin-ip': ctx.headers['x-forwarded-for'] || ctx.ip,
                    ...headers
                },
                ...customOption
            }
        );

        res.on('close', () => {
            reject(new Error('Http response closed while proxying'));
        });

        res.on('error', (e) => {
            reject(e);
        });

        res.on('finish', () => {
            resolve();
        });

    })

}


export {
    proxyToServer
};
