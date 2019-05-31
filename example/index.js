const Koa = require('koa');
const app = new Koa();
const http = require('http');


const port = 8001;
const appCallback = app.callback();
const server = http.createServer(appCallback);

const Router = require('koa-router');
const router = new Router();

server
    .listen(port)
    .on('clientError', (err, socket) => {
        // handleErr(err, 'caught_by_koa_on_client_error');
        socket.end('HTTP/1.1 400 Bad Request Request invalid\r\n\r\n');
    });
