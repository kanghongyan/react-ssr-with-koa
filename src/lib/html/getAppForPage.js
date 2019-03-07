const React = require('react');
const logger = require('../logger');
const {getAppByPage} = require('../../context');
const Missing = require('./MissingComp');

module.exports = (page) => {

    let App = Missing;

    try {
        App = getAppByPage(page).default
    } catch (e) {

        logger.error(e.stack);

        console.log(`build/server/${page}.generated.js is missing!`);

    }

    return App
};
