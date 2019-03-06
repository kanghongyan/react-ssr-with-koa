const globby = require('globby');
const path = require('path');
const fs = require('fs-extra');
const babelCore = require('babel-core');
const del = require('del');

async function _babelTransform (file, src, dest, option = {}) {
    const filepath = path.join(src, file);
    const content = await fs.readFile(filepath);
    const destpath = path.join(dest, file);

    const {
        code
    } = babelCore.transform(content.toString(), option);

    return fs.outputFile(destpath, code)
}


const _transform = (src, dest, options) => {
    src = path.resolve(src);
    dest = path.resolve(dest);

    function t (file) {
        return _babelTransform(file, src, dest, options)
    }

    return globby('**/*.js', {
        cwd: src
    })
        .then((files) => {
            return Promise.all(files.map(t))
        })
        .catch((e) => {
            return Promise.reject(e)
        })
};


const compile = (src, dist, option) => {
    return new Promise((resolve, reject) => {
        _transform(src, dist, option)
            .then(() => {
                resolve()
            })
            .catch((e) => {
                reject(e)
            })
    })
};


const start = async () => {

    const option = {
        presets: [
            "es2015",
            "stage-0",
            "react"
        ]
    };

    // clear
    await del(path.resolve('dist'));


    try {
        await Promise.all([
            // lib
            compile(
                path.resolve(__dirname, '../src/lib'),
                path.resolve(__dirname, '../dist'),
                option
            ),

            // util
            compile(
                path.resolve(__dirname, '../src/util'),
                path.resolve(__dirname, '../dist/util'),
                option
            ),

            // WrapperForContainer
            compile(
                path.resolve(__dirname, '../src/WrapperForContainer'),
                path.resolve(__dirname, '../dist/WrapperForContainer'),
                option
            )
        ])
    } catch (e) {
        console.log(e);
        console.log('build error!!!')
    }


    console.log('build done!')



};


// start compile
start();