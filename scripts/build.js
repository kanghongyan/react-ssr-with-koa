const path = require('path');
const babelCore = require('babel-core');
const fs = require('fs');
const transform = require('babel-transform-dir')

// 这两个都需要build
// def
// constant
// todo: fix

// util
transform(
    path.resolve(__dirname, '../src/util'),
    path.resolve(__dirname, '../dist/util')
)
    .then(() => {
        console.log('util done')
    });


// html
const html = [
    'enhanceApp.js',
    'getAppForPage.js',
    'getInitialData.js',
    'getTplForPage.js',
    'index.js',
    'MissingComp.js'
];

html.forEach((file) => {
    babelCore.transformFile(path.resolve(__dirname, `../src/lib/html/${file}`),
        {
            presets: [
                "es2015",
                "stage-0",
                "react"
            ]
        },
        (err, result) => {
            if (err) {
                console.log(err);
                return
            }
            fs.writeFileSync(path.resolve(__dirname, `../dist/html/${file}`), result.code)
            // console.log(result.code)
        }
    );

});


// logger
const logger = [
    'index.js',
];

logger.forEach((file) => {
    babelCore.transformFile(path.resolve(__dirname, `../src/lib/logger/${file}`),
        {
            presets: [
                "es2015",
                "stage-0",
                "react"
            ]
        },
        (err, result) => {
            if (err) {
                console.log(err);
                return
            }
            fs.writeFileSync(path.resolve(__dirname, `../dist/logger/${file}`), result.code)
            // console.log(result.code)
        }
    );

});

// proxyToServer
const proxyToServer = [
    'proxyToServer.js',
    'error.js'
];
proxyToServer.forEach((file) => {
    babelCore.transformFile(path.resolve(__dirname, `../src/lib/proxyToServer/${file}`),
        {
            presets: [
                "es2015",
                "stage-0",
                "react"
            ]
        },
        (err, result) => {
            if (err) {
                console.log(err);
                return
            }
            fs.writeFileSync(path.resolve(__dirname, `../dist/proxyToServer/${file}`), result.code)
            // console.log(result.code)
        }
    );

});


