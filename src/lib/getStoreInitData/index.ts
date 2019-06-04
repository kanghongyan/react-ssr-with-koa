function getStoreInitData(): object {

    const storeData = window && window.__PRELOADED_STATE__ ?
        window.__PRELOADED_STATE__.store || {} : {};

    delete window.__PRELOADED_STATE__.store;

    return storeData
}

export {
    getStoreInitData
}
