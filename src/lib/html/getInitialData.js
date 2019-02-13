const logger = require('../logger');

const getInitialData = async (Component, ctx) => {

    if (!Component.getInitialProps) return {};

    const props = await Component.getInitialProps(ctx)
        .catch((e) => {
            logger.error(e.stack)
        });

    return props
};

module.exports = getInitialData;