import { getSSRConfig } from '../context'
import * as path from 'path'

const ssrConfig = getSSRConfig();

const preLoadComp = () => {
    const appEntry = ssrConfig.appEntry || {};

    Object.keys(appEntry).map((key) => {
        require(path.resolve(`build/server/${key}.generated.js`));
    })
};

export {
    preLoadComp
}
