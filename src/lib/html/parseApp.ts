import { logger } from '../logger'

const getInitialData = async (Component, ctx, defaultInitialData) => {

    const MainApp = Component.App;

    if (!MainApp) return {};
    if (!MainApp.getInitialProps) return defaultInitialData || '';

    const initialData = await MainApp.getInitialProps(ctx)
        .catch((e) => {
            logger.error(e.stack)
        });

    // 将initialData注入到App中
    MainApp.defaultProps = {};
    MainApp.defaultProps['initialData'] = initialData;

    return initialData
};

export {
    getInitialData
};
