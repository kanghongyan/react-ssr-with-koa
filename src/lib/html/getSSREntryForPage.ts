import * as React from 'react';
import { getReactServerEntryByPage } from '../../context'
import { logger } from '../logger';
import { Missing } from './MissingComp';

interface ServerApp extends React.Component<{}, {}>{
    // getInitialStore?: any,
    // App: React.Component,
    // routeConfig: object[]
}

const getSSREntryForPage = (page: string) => {

    let App = Missing;

    try {
        App = getReactServerEntryByPage(page).default
    } catch (e) {

        logger.error(e.stack);

        console.log(`build/server/${page}.generated.js is missing!`);

    }

    return App
};

export {
    getSSREntryForPage
}
