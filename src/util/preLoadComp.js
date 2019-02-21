const {getSSRConfig} = require('../../context');
const path = require('path');

const ssrConfig = getSSRConfig();

const preLoadComp = () => {
    const appEntry = ssrConfig.appEntry || {};

    Object.keys(appEntry).map((key) => {
        require(path.resolve(`build/server/${key}.generated.js`));
    })
};

module.exports = preLoadComp;