import { logger } from '../logger'

const getInitialData = async (Component, ctx) => {

    const MainApp = Component.App;

    if (!MainApp) return {};
    if (!MainApp.getInitialProps) return {};

    const props = await MainApp.getInitialProps(ctx)
        .catch((e) => {
            logger.error(e.stack)
        });

    return props
};

export {
    getInitialData
};
