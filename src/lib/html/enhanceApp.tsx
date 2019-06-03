import * as React from 'react';
import * as url from 'url'
import { logger } from '../logger'


const enhanceApp = (routeProps) => {

    return (Component) => {

        try {
            routeProps.location = url.parse(routeProps.location).path;
        } catch (e) {
            logger.error(`ctx.req.url error: ${e.stack}`)
        }


        return class InnerApp extends React.Component<{}> {
            render() {
                return (
                    <Component
                        {...routeProps}
                    />
                )
            }

        }
    }
};



export {
    enhanceApp
};
