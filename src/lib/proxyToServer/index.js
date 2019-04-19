const httpProxy = require('http-proxy');
const queryString = require('querystring');
const contentType = require('content-type');
const errorBody = require('./error').resBody;
const RES_CODE = require('./error').RES_CODE;
const logger = require('../logger');

// const agent = _http.Agent({
//     keepAlive: false,
//     maxSockets: 10,
//     maxFreeSockets: 6,
//     keepAliveMsecs: 1000
// });



const proxy = httpProxy.createProxyServer({
    ignorePath: true
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
}



// todo; 优化

class ProxyToServer {

    constructor(req, res) {
        this.req = req;
        this.res = res;
    }


    static onProxyRes(proxyRes, req, res) {

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

    static proxyToWeb(req, res, other, ctx) {

        const { headers, ...customOption } = other;

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
    }


    asyncTo(other, ctx) {
        return new Promise((resolve, reject) => {

            ProxyToServer.proxyToWeb(this.req, this.res, other, ctx);

            this.res.on('close', () => {
                reject(new Error('Http response closed while proxying'));
            });

            this.res.on('error', (e) => {
                reject(e/*new Error('Http response error while proxying')*/);
            });

            this.res.on('finish', () => {
                resolve();
            });

        })
    }

    static onProxyError(e, req, res) {

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
    ProxyToServer.onProxyRes(proxyRes, req, res)
});
proxy.on('error',  (e, req, res) => {
    ProxyToServer.onProxyError(e, req, res)
});

module.exports = ProxyToServer;