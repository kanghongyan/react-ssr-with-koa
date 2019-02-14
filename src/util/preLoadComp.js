const {getSSRConfig} = require('../../context');
const path = require('path');

const ssrConfig = getSSRConfig();

const preLoadComp = () => {
    const appEntry = ssrConfig.appEntry || {};

    Object.keys(appEntry).map((key) => {
        require(path.resolve(`_server/dist/${key}.generated.js`));
    })
};

module.exports = preLoadComp;